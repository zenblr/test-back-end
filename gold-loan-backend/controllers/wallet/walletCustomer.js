const qs = require('qs');
const uniqid = require('uniqid');
const crypto = require('crypto');
const moment = require('moment');
const path = require('path');
const models = require('../../models');
const check = require('../../lib/checkLib');
const getRazorPayDetails = require('../../utils/razorpay');
const { paginationWithFromTo } = require('../../utils/pagination');
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

        const { amount, paymentType, depositDate, chequeNumber, bankName, branchName, bankTransactionId, orderAmount, metalType, qtyAmtType, quantity, type, redirectOn } = req.body;
        console.log(req.body);

        let customerDetails = await models.customer.findOne({
            where: { id, isActive: true },
        });
        if (check.isEmpty(customerDetails)) {
            return res.status(404).json({ message: "Customer Does Not Exists" });
        };
        let transactionUniqueId = uniqid.time().toUpperCase();
        let tempWallet;

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

                tempWallet = await models.walletTempDetails.create({ customerId: id, amount: amount, paymentDirection: "credit", description: "add amount", productTypeId: 4, transactionDate: depositDate }, { transaction: t });

                tempOrderDetail = await models.walletTransactionTempDetails.create({ customerId: id, productTypeId: 4, orderTypeId: 4, walletTempId: tempWallet.id, transactionUniqueId, razorPayTransactionId: razorPayOrder.id, paymentType, transactionAmount: amount, paymentReceivedDate: depositDate, orderAmount, metalType, qtyAmtType, quantity, type, redirectOn }, { transaction: t });
            })

            return res.status(200).json({ amount, razorPayOrder, razorPay: razorPay.razorPayConfig.key_id, tempOrderDetail });

        } else {

            await sequelize.transaction(async (t) => {

                tempWallet = await models.walletTempDetails.create({ customerId: id, amount: amount, paymentDirection: "credit", description: "add amount", productTypeId: 4, transactionDate: moment() }, { transaction: t });
                console.log(tempWallet);
                tempOrderDetail = await models.walletTransactionTempDetails.create({ customerId: id, productTypeId: 4, orderTypeId: 4, walletTempId: tempWallet.id, transactionUniqueId, bankTransactionUniqueId: bankTransactionId, paymentType, transactionAmount: amount, paymentReceivedDate: depositDate, chequeNumber, bankName, branchName }, { transaction: t });

            })
            return res.status(200).json({ amount, transactionUniqueId });
        }
    } catch (err) {
        console.log(err);
        if (err.statusCode == 400 && err.error.code) {
            return res.status(400).json({ message: err.error.description });
        } else {
            return res.status(400).json({ err });
        }
    }

}

exports.addAmountWallet = async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, transactionUniqueId } = req.body;

    let walletTransactionDetails;
    if (razorpay_order_id && razorpay_payment_id && razorpay_signature) {

        let tempWalletTransaction = await models.walletTransactionTempDetails.getWalletTempTransactionDetails(razorpay_order_id);

        let tempWalletDetail = await models.walletTempDetails.getTempWalletData(tempWalletTransaction.walletTempId);

        // if(tempWalletTransaction.isOrderPlaced == true){
        //     return res.status(400).json({ message: "Order id already placed for this order ID" });
        // }
        let customer = await models.customer.findOne({ where: { id: tempWalletTransaction.customerId } });

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
            data: qs.stringify({ notes: { transactionId: tempWalletTransaction.transactionUniqueId, uniqueId: customer.customerUniqueId } })
        })
        let customerUpdatedBalance
        if (customer.currentWalletBalance) {
            customerUpdatedBalance = Number(customer.currentWalletBalance) + Number(tempWalletTransaction.transactionAmount);
        } else {
            customerUpdatedBalance = Number(tempWalletTransaction.transactionAmount);
        }
        let WalletDetail;
        await sequelize.transaction(async (t) => {
            await models.customer.update({ currentWalletBalance: customerUpdatedBalance }, { where: { id: customer.id } })

            WalletDetail = await models.walletDetails.create({ customerId: tempWalletDetail.customerId, amount: tempWalletDetail.amount, paymentDirection: "credit", description: "add amount", productTypeId: 4, transactionDate: tempWalletDetail.transactionDate }, { transaction: t });

            walletTransactionDetails = await models.walletTransactionDetails.create({ customerId: tempWalletTransaction.customerId, productTypeId: 4, orderTypeId: 4, walletId: WalletDetail.id, transactionUniqueId: tempWalletTransaction.transactionUniqueId, razorpayOrderId: razorpay_order_id, razorpayPaymentId: razorpay_payment_id, razorpaySignature: razorpay_signature, paymentType: tempWalletTransaction.paymentType, transactionAmount: tempWalletTransaction.transactionAmount, paymentReceivedDate: tempWalletTransaction.paymentReceivedDate, depositDate: tempWalletTransaction.paymentReceivedDate, depositApprovedDate: tempWalletTransaction.paymentReceivedDate, depositStatus: "completed", runningBalance: customerUpdatedBalance, freeBalance: customer.walletFreeBalance }, { transaction: t })

            await models.walletTransactionTempDetails.update({ isOrderPlaced: true }, { where: { id: tempWalletTransaction.id }, transaction: t });

        });
        let orderData = {
            amount: tempWalletTransaction.orderAmount,
            metalType: tempWalletTransaction.metalType,
            qtyAmtType: tempWalletTransaction.qtyAmtType,
            quantity: tempWalletTransaction.quantity,
            type: tempWalletTransaction.type,
            redirectOn: process.env.DIGITALGOLDAPI + tempWalletTransaction.redirectOn
        }

        if(tempWalletTransaction.redirectOn){
            if (tempWalletTransaction.type == "buy") {
                res.cookie(`orderData`, `${JSON.stringify(orderData)}`);
            }
            if (tempWalletTransaction.type == "deposit") {
                // res.redirect(`http://localhost:4500${tempWalletTransaction.redirectOn}${walletTransactionDetails.id}`);
                res.redirect(`${process.env.BASE_URL_CUSTOMER}${tempWalletTransaction.redirectOn}${walletTransactionDetails.id}`);
            } else {
                // res.redirect(`http://localhost:4500${tempWalletTransaction.redirectOn}`);
                res.redirect(`${process.env.BASE_URL_CUSTOMER}${tempWalletTransaction.redirectOn}`);
            }
        }else{
        return res.status(200).json({message: "success", walletTransactionDetails});
        }
        
        // return res.status(200).json(walletTransactionDetails);

    } else {
        if (!transactionUniqueId) {
            return res.status(404).json({ message: "Transaction Unique Id is required" });
        }
        let tempWalletTransaction = await models.walletTransactionTempDetails.findOne({ where: { transactionUniqueId: transactionUniqueId } });

        if (!tempWalletTransaction) {
            return res.status(404).json({ message: "Order Does Not Exists" });
        }
        if (tempWalletTransaction.isOrderPlaced == true) {
            return res.status(422).json({ message: "Order id already placed for this order ID" });
        }

        let customer = await models.customer.findOne({ where: { id: tempWalletTransaction.customerId } });

        await sequelize.transaction(async (t) => {

            walletTransactionDetails = await models.walletTransactionDetails.create({ customerId: tempWalletTransaction.customerId, productTypeId: 4, orderTypeId: 4, transactionUniqueId, bankTransactionUniqueId: tempWalletTransaction.bankTransactionUniqueId, paymentType: tempWalletTransaction.paymentType, transactionAmount: tempWalletTransaction.transactionAmount, paymentReceivedDate: tempWalletTransaction.paymentReceivedDate, depositDate: tempWalletTransaction.paymentReceivedDate, chequeNumber: tempWalletTransaction.chequeNumber, bankName: tempWalletTransaction.bankName, branchName: tempWalletTransaction.branchName, depositStatus: "pending", runningBalance: customer.currentWalletBalance, freeBalance: customer.walletFreeBalance }, { transaction: t });

            await models.tempRazorPayDetails.update({ isOrderPlaced: true }, { where: { id: tempWalletTransaction.id }, transaction: t });
        })

        return res.status(200).json({ message: "Payment request created Successfully", walletTransactionDetails });
    }

}

exports.getAllDepositDetails = async (req, res) => {

    const id = req.userData.id;
    let { orderTypeId, depositStatus } = req.query

    const { search, offset, pageSize } = paginationWithFromTo(
        req.query.search,
        req.query.from,
        req.query.to
    );
    if (!orderTypeId) {
        return res.status(404).json({ message: 'orderTypeId is required' });
    }
    // if (!depositStatus) {
    //     return res.status(404).json({ message: 'depositStatus is required' });
    // }

    let orderTypeData = await models.digiGoldOrderType.findOne({ where: { id: orderTypeId, isActive: true } })


    if (!orderTypeData) {
        return res.status(404).json({ message: 'Data not found' });
    }
    let query = {};
    if (orderTypeId) {
        query.orderTypeId = orderTypeData.id
    }
    if (depositStatus) {
        query.depositStatus = depositStatus
    }

    let searchQuery = {
        [Op.and]: [query, {
            [Op.or]: {
                depositStatus: sequelize.where(
                    sequelize.cast(sequelize.col("walletTransactionDetails.deposit_status"), "varchar"),
                    {
                        [Op.iLike]: search + "%",
                    }
                ),
                depositDate: sequelize.where(
                    sequelize.cast(sequelize.col("walletTransactionDetails.deposit_date"), "varchar"),
                    {
                        [Op.iLike]: search + "%",
                    }
                ),
                paymentType: sequelize.where(
                    sequelize.cast(sequelize.col("walletTransactionDetails.payment_type"), "varchar"),
                    {
                        [Op.iLike]: search + "%",
                    }
                ),
                // "$walletTransactionDetails.payment_type$": { [Op.iLike]: search + '%' },
                "$walletTransactionDetails.bank_name$": { [Op.iLike]: search + '%' },
                "$walletTransactionDetails.cheque_number$": { [Op.iLike]: search + '%' },

                "$walletTransactionDetails.branch_name$": { [Op.iLike]: search + '%' },
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

    let depositDetail = await models.walletTransactionDetails.findAll({
        include: includeArray,
        where: searchQuery,
        offset: offset,
        limit: pageSize,
        subQuery: false,
    });

    let count = await models.walletTransactionDetails.findAll({
        where: searchQuery,
        order: [
            ["updatedAt", "DESC"]
        ],
        include: includeArray

    });

    if (check.isEmpty(depositDetail)) {
        return res.status(200).json({
            depositDetail: [], count: 0
        })
    }
    return res.status(200).json({ depositDetail: depositDetail, count: count.length });

}


exports.getWalletDetailById = async (req, res) => {
    let depositWithdrawId = req.params.depositWithdrawId;

    let transactionData = await walletService.walletTransactionDetailById(depositWithdrawId);

    if (!transactionData) {
        return res.status(404).json({ message: 'Data not found' });
    } else {
        return res.status(200).json({ transactionData });
    }
}

exports.getTransactionDetails = async (req, res) => {
    const id = req.userData.id;
    const { paymentFor } = req.query;
    // if (!orderTypeId) {
    //     return res.status(404).json({ message: 'orderTypeId is required' });
    // }
    let orderTypeData
    if (paymentFor) {
        orderTypeData = await models.digiGoldOrderType.findOne({ where: { orderType: paymentFor } })
    }
    // if (!orderTypeData) {
    //     return res.status(404).json({ message: 'Data not found' });
    // }
    let query = {};
    if (paymentFor) {
        query.orderTypeId = orderTypeData.id
    }
    const { search, offset, pageSize } = paginationWithFromTo(
        req.query.search,
        req.query.from,
        req.query.to
    );

    let searchQuery = {
        [Op.and]: [query, {
            [Op.or]: {


                // depositStatus: sequelize.where(
                // sequelize.cast(sequelize.col("walletTransactionDetails.deposit_status"), "varchar"),
                // {
                // [Op.iLike]: search + "%",
                // }
                // ),
                paymentType: sequelize.where(
                    sequelize.cast(sequelize.col("walletTransactionDetails.payment_type"), "varchar"),
                    {
                        [Op.iLike]: search + "%",
                    }
                ),

                // "$walletTransactionDetails.payment_type$": { [Op.iLike]: search + '%' },
                "$walletTransactionDetails.bank_name$": { [Op.iLike]: search + '%' },
                "$walletTransactionDetails.cheque_number$": { [Op.iLike]: search + '%' },

                "$walletTransactionDetails.branch_name$": { [Op.iLike]: search + '%' },
            },
        }],
        // isActive: true,
        // customerId: CusData,
        customerId: id,
        depositStatus: 'completed',
        // paymentType: { [Op.in]: ['4', '5'] }

    };

    let transactionDetails = await models.walletTransactionDetails.findAll({
        where: searchQuery,
        offset: offset,
        limit: pageSize,
        subQuery: false,
    });

    let count = await models.walletTransactionDetails.findAll({
        where: searchQuery,
        order: [
            ["updatedAt", "DESC"]
        ],

    });

    if (check.isEmpty(transactionDetails)) {
        return res.status(200).json({
            data: [], count: 0

        })
    }
    return res.status(200).json({ transactionDetails, count: count.length });

}

exports.getWalletBalance = async (req, res) => {
    const id = req.userData.id;

    let getWalletbalance = await models.customer.findOne({ where: { id: id, isActive: true } })

    if (check.isEmpty(getWalletbalance)) {
        return res.status(400).json({ message: `Data Not Found.` });
    } else {

        const walletFreeBalance = getWalletbalance.walletFreeBalance ? getWalletbalance.walletFreeBalance.toFixed(2) : 0.00;
        const currentWalletBalance = getWalletbalance.currentWalletBalance ? getWalletbalance.currentWalletBalance.toFixed(2) : 0.00;
        return res.status(200).json({ walletFreeBalance, currentWalletBalance, customerUniqueId: getWalletbalance.customerUniqueId });
    }
}

exports.withdrawAmount = async (req, res) => {
    const { withdrawAmount, bankName, branchName, accountHolderName, accountNumber, ifscCode } = req.body;

    const id = req.userData.id;

    let customerFreeBalance = await models.customer.findOne({ where: { id: id, isActive: true } })
    if (customerFreeBalance.walletFreeBalance < withdrawAmount) {

        return res.status(400).json({ message: `Insufficient free wallet balance.` });
    } else {
        await sequelize.transaction(async (t) => {

            tempWallet = await models.walletTempDetails.create({ customerId: id, amount: withdrawAmount, paymentDirection: "debit", description: "withdraw amount", productTypeId: 4 }, { transaction: t });

            let transactionUniqueId = uniqid.time().toUpperCase();

            tempOrderDetail = await models.walletTransactionTempDetails.create({ customerId: id, productTypeId: 4, orderTypeId: 5, walletTempId: tempWallet.id, transactionUniqueId, transactionAmount: withdrawAmount, bankName: bankName, branchName: branchName, accountHolderName: accountHolderName, accountNumber: accountNumber, ifscCode: ifscCode }, { transaction: t });

            tempOrderDetail = await models.walletTransactionDetails.create({ customerId: id, productTypeId: 4, orderTypeId: 5, transactionUniqueId, transactionAmount: withdrawAmount, bankName: bankName, branchName: branchName, accountHolderName: accountHolderName, accountNumber: accountNumber, ifscCode: ifscCode, depositStatus: "pending" }, { transaction: t });

        })

        return res.status(200).json({ message: `Success` });
    }

}


exports.AddCustomerBankDetails = async (req, res) => {

    const { bankName, bankBranchName, accountType, accountHolderName, accountNumber, ifscCode } = req.body;

    const id = req.userData.id;

    customerBankDetails = await models.customerBankDetails.create({ customerId: id, moduleId: 4, description: 'withdraw wallet amount', bankName: bankName, bankBranchName, accountType, accountHolderName, accountNumber, ifscCode, isActive: 'true' });

    if (customerBankDetails) {
        return res.status(200).json({ message: 'Success' });
    } else {
        return res.status(404).json({ message: `Failed to add bank details.` });
    }



}

exports.getAllBankDetails = async (req, res) => {

    const id = req.userData.id;
    let bankDetails = await models.customerBankDetails.findAll({
        where: { customerId: id, isActive: 'true' },
        include: {
            model: models.customer,
            as: "customer",
            attributes: ['customerUniqueId', 'firstName', 'lastName', 'mobileNumber']
        }
    });

    if (check.isEmpty(bankDetails)) {
        bankDetails = []
        return res.status(200).json({ bankDetails });
    } else {
        return res.status(200).json({ bankDetails });
    }


}

