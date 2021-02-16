const models = require("../../models");
const sequelize = models.sequelize;

const Sequelize = models.Sequelize;
const Op = Sequelize.Op;
const moment = require('moment')
const getRazorPayDetails = require('../../utils/razorpay');
var uniqid = require('uniqid');
const { getAllPartAndFullReleaseData } = require('../../utils/loanFunction')
const { quickSettlement, partPaymnetSettlement } = require('../../utils/loanFunction')
const { updateAmountStatus, updateAmountStatusFullRelease } = require('../../controllers/jewelleryRelease/jewelleryRelease')

exports.razorPayCreateOrder = async (req, res, next) => {
    try {
        let { amount, masterLoanId, paymentType, paymentFor, ornamentId } = req.body;
        let razorPayTempDetails
        const razorpay = await getRazorPayDetails();
        let transactionUniqueId = uniqid.time().toUpperCase();
        let payableAmount = 0
        if (paymentFor == "jewelleryRelease") {
            let ornaments = await models.customerLoanOrnamentsDetail.findAll({ where: { masterLoanId: masterLoanId } })
            if (ornamentId.length == ornaments.length) {
                paymentFor = 'fullRelease'
            } else {
                paymentFor = 'partRelease'
            }
            let releaseData = await getAllPartAndFullReleaseData(masterLoanId, ornamentId);
            amount = releaseData.loanInfo.totalPayableAmount;
            transactionUniqueId = uniqid.time().toUpperCase();
            payableAmount = await Math.round(amount * 100);
        } else {
            payableAmount = await Math.round(amount * 100);
        }
        let loanData = await models.customerLoan.findOne({ where: { masterLoanId: masterLoanId }, order: [['id', 'asc']] });
        let razorPayOrder = await razorpay.instance.orders.create({ amount: payableAmount, currency: "INR", receipt: `${transactionUniqueId}`, payment_capture: 1, notes: { product: "gold loan", loanId: loanData.loanUniqueId } });
        if (paymentType) {
            razorPayTempDetails = await models.tempRazorPayDetails.create({ paymentFor, paymentType, amount, masterLoanId, razorPayOrderId: razorPayOrder.id, depositDate: moment(), transactionUniqueId, ornamentId })
            console.log(razorPayTempDetails)

            razorPayTempDetails = await models.customerLoanTransaction.create({ paymentFor, paymentType, transactionAmont: amount, masterLoanId, razorPayTransactionId: razorPayOrder.id, depositStatus: "Pending", depositDate: moment().format('YYYY-MM-DD'), transactionUniqueId, ornamentId })
        }
        return res.status(200).json({ razorPayOrder, razerPayConfig: razorpay.razorPayConfig.key_id, razorPayTempDetails });
    } catch (err) {
        console.log(err)
        await models.errorLogger.create({
            message: err.message,
            url: req.url,
            method: req.method,
            host: req.hostname,
            body: req.body,
            userData: req.userData
        });
        res.status(500).send({ message: err.message });
    }
}

exports.refundCron = async (req, res, next) => {
    const razorpay = await getRazorPayDetails();
    await sequelize.transaction(async (t) => {
        let razorpayData = []
        //loan
        let loanRazorpayTemp = await models.tempRazorPayDetails.findAll({ where: { orderStatus: { [Op.iLike]: 'Pending' }, razorPayOrderId: { [Op.not]: null }, createdAt: { [Op.gte]: moment().subtract(4, 'days').format('YYYY-MM-DD') } }, attributes: ['id', 'razorPayOrderId', 'ornamentId'], transaction: t });

        //digigold temp order
        // let digiGoldOrderTemp = await models.digiGoldTempOrderDetail.findAll({ where: { isOrderPlaced: false, razorpayOrderId: { [Op.not]: null }, refundCronExecuted: false, createdAt: { [Op.lt]: moment().subtract(2, 'days').format('YYYY-MM-DD') } }, attributes: ['customerId', 'id', 'isOrderPlaced', 'razorpayOrderId', 'refundCronExecuted'], transaction: t });

        //digigold temp wallet
        // let digiGoldWalletTemp = await models.walletTransactionTempDetails.findAll({ where: { isOrderPlaced: false, razorPayTransactionId: { [Op.not]: null }, refundCronExecuted: false, createdAt: { [Op.lt]: moment().subtract(2, 'days').format('YYYY-MM-DD') } }, attributes: ['customerId', 'id', 'isOrderPlaced', 'razorPayTransactionId', 'refundCronExecuted'], transaction: t });

        //loan
        for (const temp of loanRazorpayTemp) {
            let razerpayInfo = await razorpay.instance.orders.fetch(temp.razorPayOrderId);
            let customerTransaction = await models.customerLoanTransaction.findOne({ where: { razorPayTransactionId: temp.razorPayOrderId } })
            if (razerpayInfo) {
                if (customerTransaction.paymentFor == 'quickPay') {
                    let quickPay = await quickSettlement(customerTransaction.id, razerpayInfo.status, customerTransaction.depositDate, customerTransaction.masterLoanId, customerTransaction.transactionAmont, 1)
                    let transcation = await models.customerLoanTransaction.findOne({ where: { razorPayTransactionId: temp.razorPayOrderId } })
                    await models.tempRazorPayDetails.update({ orderStatus: transcation.depositStatus }, { where: { razorPayOrderId: temp.razorPayOrderId }, transcation: t })
                }
                if (customerTransaction.paymentFor == 'partPayment') {
                    let partPayment = await partPaymnetSettlement(customerTransaction.id, razerpayInfo.status, customerTransaction.depositDate, customerTransaction.masterLoanId, customerTransaction.transactionAmont, 1)
                    let transcation = await models.customerLoanTransaction.findOne({ where: { razorPayTransactionId: temp.razorPayOrderId } })
                    await models.tempRazorPayDetails.update({ orderStatus: transcation.depositStatus }, { where: { razorPayOrderId: temp.razorPayOrderId }, transcation: t })
                }
                if (customerTransaction.paymentFor == 'jewelleryRelease') {
                    let ornaments = await models.customerLoanOrnamentsDetail.findAll({ where: { masterLoanId: customerTransaction.masterLoanId } })
                    if (temp.ornamentId.length == ornaments.length && razerpayInfo.status == 'paid') {
                        let data = { id: customerTransaction.id, status: 'completed', razorPayOrderId: temp.razorPayOrderId, paymentReceivedDate: customerTransaction.depositDate }
                        await updateAmountStatusFullRelease(data)
                        let transcation = await models.customerLoanTransaction.findOne({ where: { razorPayTransactionId: temp.razorPayOrderId } })
                        await models.tempRazorPayDetails.update({ orderStatus: transcation.depositStatus }, { where: { razorPayOrderId: temp.razorPayOrderId }, transcation: t })
                    } else if (razerpayInfo.status == 'paid') {
                        let data = { id: customerTransaction.id, status: 'completed', razorPayOrderId: temp.razorPayOrderId, paymentReceivedDate: customerTransaction.depositDate }
                        await updateAmountStatus(data)
                        let transcation = await models.customerLoanTransaction.findOne({ where: { razorPayTransactionId: temp.razorPayOrderId } })
                        await models.tempRazorPayDetails.update({ orderStatus: transcation.depositStatus }, { where: { razorPayOrderId: temp.razorPayOrderId }, transcation: t })
                    }
                }

            }

        }

        //digiGoldTemp
        // for (const temp of digiGoldOrderTemp) {
        //     let transactionUniqueId = uniqid.time().toUpperCase();
        //     let razerpayInfo = await razorpay.instance.orders.fetch(temp.razorpayOrderId);
        //     if (razerpayInfo) {
        //         if (razerpayInfo.status == 'paid') {
        //             let customerData = await models.customer.findOne({ where: { id: temp.customerId }, transaction: t });
        //             if (customerData) {
        //                 let amount = Number(customerData.currentWalletBalance) + Number(razerpayInfo.amount_paid / 100);
        //                 await models.customer.update({ currentWalletBalance: amount }, { where: { id: customerData.id }, transaction: t });
        //                 let digiGoldOrderWallet = await models.walletDetails.create({ customerId: customerData.id, amount: Number(razerpayInfo.amount_paid / 100), paymentDirection: 'credit', description: 'Refund', productTypeId: 4, orderTypeId: 4, paymentOrderTypeId: 4, transactionDate: moment(), transactionStatus: "completed" }, { transaction: t });

        //                 await models.walletTransactionDetails.create({ customerId: temp.customerId, productTypeId: 4, orderTypeId: 4, walletId: digiGoldOrderWallet.id, transactionUniqueId, paymentType: 'refund', transactionAmount: Number(razerpayInfo.amount_paid / 100), runningBalance: amount, depositDate: moment(), depositApprovedDate: moment(), depositStatus: 'completed', transactionTempDetailId: temp.id }, { transaction: t })
        //             }
        //         }
        //     }
        //     await models.digiGoldTempOrderDetail.update({ refundCronExecuted: true }, { where: { id: temp.id }, transaction: t });
        // }

        //digiGoldTempWallet
        // for (const temp of digiGoldWalletTemp) {
        //     let transactionUniqueId = uniqid.time().toUpperCase();
        //     let razerpayInfo = await razorpay.instance.orders.fetch(temp.razorPayTransactionId);
        //     if (razerpayInfo) {
        //         if (razerpayInfo.status == 'paid') {
        //             let customerData = await models.customer.findOne({ where: { id: temp.customerId }, transaction: t });
        //             if (customerData) {
        //                 let amount = Number(customerData.currentWalletBalance) + Number(razerpayInfo.amount_paid / 100);
        //                 await models.customer.update({ currentWalletBalance: amount }, { where: { id: customerData.id }, transaction: t });

        //                 let digiGoldWallet = await models.walletDetails.create({ customerId: customerData.id, amount: amount, paymentDirection: 'credit', description: 'Refund', productTypeId: 4, orderTypeId: 4, paymentOrderTypeId: 4, transactionDate: moment(), transactionStatus: "completed" }, { transaction: t });

        //                 await models.walletTransactionDetails.create({ customerId: temp.customerId, productTypeId: 4, orderTypeId: 4, walletId: digiGoldWallet.id, transactionUniqueId, paymentType: 'refund', transactionAmount: Number(razerpayInfo.amount_paid / 100), runningBalance: amount, depositDate: moment(), depositApprovedDate: moment(), depositStatus: 'completed', transactionTempDetailId: temp.id }, { transaction: t })

        //             }
        //         }
        //     }
        //     await models.walletTransactionTempDetails.update({ refundCronExecuted: true }, { where: { id: temp.id }, transaction: t });
        // }
    })
    return res.status(200).json({ message: 'Success' })
}