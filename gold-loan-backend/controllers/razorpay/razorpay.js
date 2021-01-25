const models = require("../../models");
const sequelize = models.sequelize;

const Sequelize = models.Sequelize;
const Op = Sequelize.Op;
const moment = require('moment')
const getRazorPayDetails = require('../../utils/razorpay');
var uniqid = require('uniqid');
const { getAllPartAndFullReleaseData } = require('../../utils/loanFunction')
const { quickSettlement, partPaymnetSettlement } = require('../../utils/loanFunction')

exports.razorPayCreateOrder = async (req, res, next) => {
    try {
        let { amount, masterLoanId, paymentType, paymentFor, ornamentId } = req.body;
        let razorPayTempDetails
        const razorpay = await getRazorPayDetails();
        let transactionUniqueId = uniqid.time().toUpperCase();
        let payableAmount = 0
        if (paymentFor == "jewelleryRelease") {
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
        let loanRazorpayTemp = await models.tempRazorPayDetails.findAll({ where: { orderStatus: { [Op.iLike]: 'Pending' }, razorPayOrderId: { [Op.not]: null }, createdAt: { [Op.gte]: moment().subtract(4, 'days').format('YYYY-MM-DD') } }, attributes: ['id', 'razorPayOrderId'], transaction: t });
        // console.log(moment().subtract(2, 'days').format('YYYY-MM-DD'))

        //loan
        for (const temp of loanRazorpayTemp) {
            let razerpayInfo = await razorpay.instance.orders.fetch(temp.razorPayOrderId);
            let customerTransaction = await models.customerLoanTransaction.findOne({ where: { razorPayTransactionId: temp.razorPayOrderId } })
            if (razerpayInfo) {
                if (customerTransaction.paymentFor == 'quickPay') {
                    let quickPay = await quickSettlement(customerTransaction.id, razerpayInfo.status, customerTransaction.depositDate, customerTransaction.masterLoanId, customerTransaction.transactionAmont, 1)
                    let transcation = await models.customerLoanTransaction.findOne({ where: { razorPayTransactionId: temp.razorPayOrderId } })
                    await models.tempRazorPayDetails.update({ orderStatus: transcation.depositStatus }, { where: { razorPayOrderId: temp.razorPayOrderId } })
                }
                if (customerTransaction.paymentFor == 'partPayment') {
                    let partPayment = await partPaymnetSettlement(customerTransaction.id, razerpayInfo.status, customerTransaction.depositDate, customerTransaction.masterLoanId, customerTransaction.transactionAmont, 1)
                    let transcation = await models.customerLoanTransaction.findOne({ where: { razorPayTransactionId: temp.razorPayOrderId } })
                    await models.tempRazorPayDetails.update({ orderStatus: transcation.depositStatus }, { where: { razorPayOrderId: temp.razorPayOrderId } })
                }

            }

        }
    })
    // return res.status(200).json({ message: 'Success' })
}