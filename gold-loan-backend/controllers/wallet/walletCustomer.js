const qs = require('qs');
const uniqid = require('uniqid');
const crypto = require('crypto');
const moment = require('moment');
const path = require('path');
const models = require('../../models');
const check = require('../../lib/checkLib');
const getRazorPayDetails = require('../../utils/razorpay');
const  { paginationWithFromTo } = require('../../utils/pagination');
// let sms = require('../../../utils/sendSMS');
let sms = require('../../utils/SMS');
var pdf = require("pdf-creator-node");
var fs = require('fs');
const numToWords = require('../../utils/numToWords');
const errorLogger = require('../../utils/errorLogger');
const sequelize = models.sequelize;
const Sequelize = models.Sequelize;
const Op = Sequelize.Op;
const walletService = require('../../service/wallet');


exports.makePayment = async (req, res) => {
    try {
        const id = req.userData.id;

        const { amount, paymentType, depositDate, chequeNumber, bankName, branchName, bankTransactionId } = req.body;
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
            const razorPay = await getRazorPayDetails();

            await sequelize.transaction(async (t) => {

                razorPayOrder = await razorPay.instance.orders.create(
                    { amount: sendAmount, currency: "INR", payment_capture: 1 }
                );
                let transactionUniqueId = uniqid.time().toUpperCase();

                tempOrderDetail = await models.tempRazorPayDetails.create({ customerId: id, razorPayOrderId: razorPayOrder.id, amount, paymentFor: "deposit", depositDate, paymentType, transactionUniqueId });
            })

            return res.status(200).json({ amount, razorPayOrder, razorPay:razorPay.razorPayConfig.key_id, tempOrderDetail });

        } else {
            let transactionUniqueId = uniqid.time().toUpperCase();

            await sequelize.transaction(async (t) => {

                tempOrderDetail = await models.tempRazorPayDetails.create({ customerId: id, amount, paymentFor: "deposit", depositDate, paymentType, transactionUniqueId, chequeNumber, bankName, branchName, bankTransactionId });

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
                customerUpdatedBalance = Number(customer.currentWalletBalance) + Number(tempOrderData.amount);
              }else{
                customerUpdatedBalance = Number(tempOrderData.amount);
              }
            await sequelize.transaction(async (t) => {
                await models.customer.update({ currentWalletBalance: customerUpdatedBalance }, { where: { id: customer.id}})

                customerLoanTransaction = await models.customerLoanTransaction.create({ customerId: tempOrderData.customerId, productTypeId: 4, transactionUniqueId: tempOrderData.transactionUniqueId, bankTransactionUniqueId: tempOrderData.bankTransactionId, razorPayTransactionId: razorpay_order_id, paymentType: tempOrderData.paymentType, transactionAmont: tempOrderData.amount, paymentReceivedDate: tempOrderData.depositDate, depositDate: tempOrderData.depositDate, depositStatus: "Completed", paymentFor: "deposit", runningBalance: customerUpdatedBalance, freeBalance: customer.walletFreeBalance, createdBy: 1, modifiedBy: 1 });
    
                await models.tempRazorPayDetails.update({ isOrderPlaced: true }, { where: { id: tempOrderData.id } });
            })
              
            // res.redirect(`http://${process.env.DIGITALGOLDAPI}/digi-gold/`);
            // return res.status(200).json(customerLoanTransaction);
            res.redirect(`http://localhost:4500/digi-gold`);


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
            await sequelize.transaction(async (t) => {

                customerLoanTransaction = await models.customerLoanTransaction.create({ customerId: customer.id, productTypeId: 4, transactionUniqueId, bankTransactionUniqueId: tempOrderData.bankTransactionId,  paymentType: tempOrderData.paymentType, transactionAmont: tempOrderData.amount, paymentReceivedDate: tempOrderData.depositDate, depositDate: tempOrderData.depositDate, chequeNumber: tempOrderData.chequeNumber, bankName: tempOrderData.bankName, branchName: tempOrderData.branchName, depositStatus: "Pending", paymentFor: "deposit", runningBalance: customer.currentWalletBalance, freeBalance: customer.walletFreeBalance, createdBy: 1, modifiedBy: 1 });

                await models.tempRazorPayDetails.update({ isOrderPlaced: true }, { where: { id: tempOrderData.id } });
            })

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
                depositDetail: [], count: 0
            })
        }
        return res.status(200).json({depositDetail: depositDetail, count: count});
    } catch (err) {
        console.log(err);

    };
}

exports.getWalletDetailByIdAdmin = async (req, res) => {
    let depositWithdrawId = req.params.depositWithdrawId;

    let transactionData = await walletService.walletTransactionDetailById(depositWithdrawId);

        if (!transactionData) {
            return res.status(404).json({ message: 'Data not found' });
        }else{
            return res.status(200).json({transactionData});
        }
}

exports.getTransactionDetails = async (req, res) => {
    try {
        const id = req.userData.id;

        const { search, offset, pageSize } = paginationWithFromTo(
            req.query.search,
            req.query.from,
            req.query.to
        );

        let query = {};
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
            // customerId: CusData,
            customerId: id,
            depositStatus: 'Completed',
            paymentFor: { [Op.in]: ['deposit', 'withdraw'] }

        };

        let transactionDetails = await models.customerLoanTransaction.findAll({
            // include: includeArray,
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

        });

        if (check.isEmpty(transactionDetails)) {
            return res.status(200).json({
                data: [], count: 0

            })
        }
        return res.status(200).json(transactionDetails);
    } catch (err) {
        console.log(err);

    };
}

exports.getWalletBalance = async (req, res) => {
    try {
        const id = req.userData.id;
        let getWalletbalance = await models.customer.findOne({ where: {  id: id,isActive:true} })
   
       const walletFreeBalance=getWalletbalance.walletFreeBalance
       const currentWalletBalance=getWalletbalance.currentWalletBalance
        return res.status(200).json({walletFreeBalance,currentWalletBalance});
    } catch (err) {
        console.log(err);

    };
}