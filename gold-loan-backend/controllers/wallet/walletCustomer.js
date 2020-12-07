const qs = require('qs');
const uniqid = require('uniqid');
const crypto = require('crypto');
const moment = require('moment');
const path = require('path');
const models = require('../../models');
const check = require('../../lib/checkLib');
const getRazorPayDetails = require('../../utils/razorpay');
const pagination = require('../../utils/pagination');
// let sms = require('../../../utils/sendSMS');
let sms = require('../../utils/SMS');
var pdf = require("pdf-creator-node");
var fs = require('fs');
const numToWords = require('../../utils/numToWords');
const errorLogger = require('../../utils/errorLogger');
const sequelize = models.sequelize;
const Sequelize = models.Sequelize;
const Op = Sequelize.Op;


exports.makePayment = async (req, res) => {
    try {
        const id = req.userData.id;

        const { amount, paymentType, depositDate, chequeNumber, bankName, branchName } = req.body;
        console.log(req.body);

        let customerDetails = await models.customer.findOne({
            where: { id, isActive: true },
        });
        if (check.isEmpty(customerDetails)) {
            return res.status(404).json({ message: "Customer Does Not Exists" });
        };

        if (paymentType == 'upi' || paymentType == 'netbanking' || paymentType == 'wallet' || paymentType == 'card') {

            let newAmmount = await amount * 100;
            let sendAmount = await Math.round(newAmmount);
            let tempOrderDetail;
            let razorPayOrder;
            await sequelize.transaction(async (t) => {
                const razorPay = await getRazorPayDetails();

                razorPayOrder = await razorPay.instance.orders.create(
                    { amount: sendAmount, currency: "INR", payment_capture: 1 }
                );
                let transactionUniqueId = uniqid.time().toUpperCase();

                tempOrderDetail = await models.tempRazorPayDetails.create({ customerId: id, razorPayOrderId: razorPayOrder.id, amount, paymentFor: "addAmountWallet", depositDate, paymentType, transactionUniqueId });
            })

            return res.status(200).json({ amount, razorPayOrder, tempOrderDetail });

        } else {
            let transactionUniqueId = uniqid.time().toUpperCase();

            await sequelize.transaction(async (t) => {

                tempOrderDetail = await models.tempRazorPayDetails.create({ customerId: id, amount, paymentFor: "addAmountWallet", depositDate, paymentType, transactionUniqueId, chequeNumber, bankName, branchName });

            })
            return res.status(200).json({ amount, tempOrderDetail, transactionUniqueId });
        }
    } catch (err) {
        console.log(err);
    }

}

exports.addAmountWallet = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, transactionUniqueId } = req.body;

        let customerLoanTransaction;
        if (razorpay_order_id && razorpay_payment_id && razorpay_signature) {
            let tempOrderData = await models.tempRazorPayDetails.getTempOrderDetail(razorpay_order_id);
            
            if(tempOrderData.isOrderPlaced == true){
                return res.status(422).json({ message: "Order id already placed for this order ID" });
            }
            let customer = await models.customer.findOne({ where: { id: tempOrderData.customerId } });

            const razorPay = await getRazorPayDetails();
            const generated_signature = crypto
                .createHmac(
                    "SHA256",
                    razorPay.razorPayConfig.key_secret
                )
                .update(razorpay_order_id + "|" + razorpay_payment_id)
                .digest("hex");
            if (generated_signature == razorpay_signature) {
                signatureVerification = true
            }
            if (signatureVerification == false) {
                return res.status(422).json({ message: "Payment verification failed" });
            }

            await models.axios({
                method: 'PATCH',
                url: `https://api.razorpay.com/v1/payments/${razorpay_payment_id}`,
                auth: {
                  username: razorPay.razorPayConfig.key_id,
                  password: razorPay.razorPayConfig.key_secret
                },
                data: qs.stringify({ notes: { transactionId: tempOrderData.transactionUniqueId, uniqueId: customer.customerUniqueId } })
              })
              let customerUpdatedBalance
              if(customer.currentWalletBalance){
                customerUpdatedBalance = customer.currentWalletBalance + tempOrderData.amount;
              }else{
                customerUpdatedBalance = tempOrderData.amount;
              }

            await models.customer.update({ currentWalletBalance: customerUpdatedBalance }, { where: { id: customer.id}})

            customerLoanTransaction = await models.customerLoanTransaction.create({ customerId: tempOrderData.customerId, productTypeId: 4, transactionUniqueId: tempOrderData.transactionUniqueId, razorPayTransactionId: razorpay_order_id, paymentType: tempOrderData.paymentType, transactionAmont: tempOrderData.amount, paymentReceivedDate: tempOrderData.depositDate, depositDate: tempOrderData.depositDate, depositStatus: "Completed", paymentFor: "addAmountWallet", runningBalance: customerUpdatedBalance, freeBalance: customer.walletFreeBalance, createdBy: 1, modifiedBy: 1 });

            await models.tempRazorPayDetails.update({ isOrderPlaced: true }, { where: { id: tempOrderData.id } });

            res.redirect(`http://${process.env.DIGITALGOLDAPI}/digi-gold/`);
            // return res.status(200).json(customerLoanTransaction);


        } else {

            let tempOrderData = await models.tempRazorPayDetails.findOne({ where: { transactionUniqueId: transactionUniqueId } });
            if (!tempOrderData) {
                return res.status(404).json({ message: "Order Does Not Exists" });
            }
            if(tempOrderData.isOrderPlaced == true){
                return res.status(422).json({ message: "Order id already placed for this order ID" });
            }

            let customer = await models.customer.findOne({ where: { id: tempOrderData.customerId } });

            if (check.isEmpty(customer)) {
                return res.status(404).json({ message: "Customer Does Not Exists" });
            };

            customerLoanTransaction = await models.customerLoanTransaction.create({ customerId: customer.id, productTypeId: 4, transactionUniqueId, paymentType: tempOrderData.paymentType, transactionAmont: tempOrderData.amount, paymentReceivedDate: tempOrderData.depositDate, depositDate: tempOrderData.depositDate, chequeNumber: tempOrderData.chequeNumber, bankName: tempOrderData.bankName, branchName: tempOrderData.branchName, depositStatus: "Pending", paymentFor: "addAmountWallet", runningBalance: customer.currentWalletBalance, freeBalance: customer.walletFreeBalance, createdBy: 1, modifiedBy: 1 });

            await models.tempRazorPayDetails.update({ isOrderPlaced: true }, { where: { id: tempOrderData.id } });

            return res.status(200).json(customerLoanTransaction);
        }
    } catch (err) {
        console.log(err);
    }

}

exports.getAllDepositDetails = async (req, res) => {
    try {
        const id = req.userData.id;
        let { paymentFor } = req.query
        
        const { search, offset, pageSize } = paginationWithFromTo(
            req.query.search,
            req.query.from,
            req.query.to
        );
    
        let query = {};
        if (paymentFor) {
            query.paymentFor = paymentFor
        }

        let searchQuery = {
            [Op.and]: [query, {
                [Op.or]: {


                    depositStatus: sequelize.where(
                        sequelize.cast(sequelize.col("customerLoanTransaction.deposit_status"), "varchar"),
                        {
                            [Op.iLike]: search + "%",
                        }
                    ),
                    applicationDate: sequelize.where(
                        sequelize.cast(sequelize.col("customerLoanTransaction.deposit_date"), "varchar"),
                        {
                            [Op.iLike]: search + "%",
                        }
                    ),

                    "$customerLoanTransaction.payment_for$": { [Op.iLike]: search + '%' },
                    "$customerLoanTransaction.bank_name$": { [Op.iLike]: search + '%' },
                    "$customerLoanTransaction.cheque_number$": { [Op.iLike]: search + '%' },

                    "$customerLoanTransaction.branch_name$": { [Op.iLike]: search + '%' },
                },
            }],
            // isActive: true,
            customerId: id,

        };

        let includeArray = [
            {
                model: models.customer,
                as: 'customer',

                attributes: ['id', 'customerUniqueId', 'firstName', 'lastName']
            }
        ]
       
        let depositDetail = await models.customerLoanTransaction.findAll({

            include: includeArray,
            where: searchQuery,
            offset: offset,
            limit: pageSize,
            subQuery: false,
        });

        let count = await models.customerLoanTransaction.findAll({
            where: searchQuery,
            order: [
                ['id', 'DESC']
            ],
            include: includeArray
    
        });

        if (check.isEmpty(depositDetail)) {
            return res.status(200).json({
                data: [], count: 0

            })
        }
        return res.status(200).json(depositDetail);
    } catch (err) {
        console.log(err);

    };
}