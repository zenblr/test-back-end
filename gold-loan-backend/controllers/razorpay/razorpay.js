const models = require("../../models");
const sequelize = models.sequelize;

const Sequelize = models.Sequelize;
const Op = Sequelize.Op;
const moment = require('moment')

exports.razorPayCreateOrder = async (req, res, next) => {
    try {
        let { amount, masterLoanId, paymentType, paymentFor } = req.body;
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
             razorPayTempDetails = await models.tempRazorPayDetails.create({ paymentFor, paymentType, amount, masterLoanId, razorPayOrder: razorPayOrder.id, depositDate: moment() })
        }
        return res.status(200).json({ razorPayOrder, razerPayConfig: razorpay.razorPayConfig.key_id,razorPayTempDetails });
    } catch (err) {
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