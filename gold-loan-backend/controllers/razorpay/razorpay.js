const models = require("../../models");
const sequelize = models.sequelize;

const Sequelize = models.Sequelize;
const Op = Sequelize.Op;
const moment = require('moment')
const getRazorPayDetails = require('../../utils/razorpay');
var uniqid = require('uniqid');
const { getAllPartAndFullReleaseData } = require('../../utils/loanFunction')

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
            razorPayTempDetails = await models.tempRazorPayDetails.create({ paymentFor, paymentType, amount, masterLoanId, razorPayOrderId: razorPayOrder.id, depositDate: moment(), transactionUniqueId, ornamentId, customerId: loanData.customerId })
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
    let data = await sequelize.transaction(async (t) => {
        let razorpayData = []
        //loan
        let loanRazorpayTemp = await models.tempRazorPayDetails.findAll({ where: { isOrderPlaced: false, razorPayOrderId: { [Op.not]: null }, refundCronExecuted: false, createdAt : {[Op.lt]: moment().subtract(2, 'days').format('YYYY-MM-DD')} }, attributes: ['customerId', 'id', 'isOrderPlaced', 'razorPayOrderId', 'refundCronExecuted'], transaction: t });

        //digigold temp order
        let digiGoldOrderTemp = await models.digiGoldTempOrderDetail.findAll({ where: { isOrderPlaced: false, razorpayOrderId: { [Op.not]: null }, refundCronExecuted: false, createdAt : {[Op.lt]: moment().subtract(2, 'days').format('YYYY-MM-DD')} }, attributes: ['customerId', 'id', 'isOrderPlaced', 'razorpayOrderId', 'refundCronExecuted'], transaction: t });

        //digigold temp wallet
        let digiGoldWalletTemp = await models.walletTransactionTempDetails.findAll({ where: { isOrderPlaced: false, razorPayTransactionId: { [Op.not]: null }, refundCronExecuted: false, createdAt : {[Op.lt]: moment().subtract(2, 'days').format('YYYY-MM-DD')} }, attributes: ['customerId', 'id', 'isOrderPlaced', 'razorPayTransactionId', 'refundCronExecuted'], transaction: t });

        //loan
        for (const temp of loanRazorpayTemp) {
            let razerpayInfo = await razorpay.instance.orders.fetch(temp.razorPayOrderId);
            if (razerpayInfo) {
                if(razerpayInfo.status == 'paid'){
                    let customerData = await models.customer.findOne({where:{id:temp.customerId},transaction: t});
                    if(customerData){
                        let amount = Number(customerData.currentWalletBalance) + Number(razerpayInfo.amount_paid/100);
                        await models.customer.update({ currentWalletBalance: amount }, { where: { id: customerData.id }, transaction: t });
                        await models.walletDetails.create({customerId:customerData.id,amount:amount,paymentDirection:'credit',description:'Refund',productTypeId:1,transactionDate:moment()},{transaction: t});
                    }
                }
            }
            await models.tempRazorPayDetails.update({refundCronExecuted : true},{ where: {id:temp.id},transaction: t });
        }

        //digiGoldTemp
        for (const temp of digiGoldOrderTemp) {
            let razerpayInfo = await razorpay.instance.orders.fetch(temp.razorpayOrderId);
            if (razerpayInfo) {
                if(razerpayInfo.status == 'paid'){
                    let customerData = await models.customer.findOne({where:{id:temp.customerId},transaction: t});
                    if(customerData){
                        let amount = Number(customerData.currentWalletBalance) + Number(razerpayInfo.amount_paid/100);
                        await models.customer.update({ currentWalletBalance: amount }, { where: { id: customerData.id }, transaction: t });
                        await models.walletDetails.create({customerId:customerData.id,amount:amount,paymentDirection:'credit',description:'Refund',productTypeId:4,transactionDate:moment()},{transaction: t});
                    }
                }
            }
            await models.digiGoldTempOrderDetail.update({refundCronExecuted : true},{ where: {id:temp.id},transaction: t });
        }

         //digiGoldTempWallet
         for (const temp of digiGoldWalletTemp) {
            let razerpayInfo = await razorpay.instance.orders.fetch(temp.razorPayTransactionId);
            if (razerpayInfo) {
                if(razerpayInfo.status == 'paid'){
                    let customerData = await models.customer.findOne({where:{id:temp.customerId},transaction: t});
                    if(customerData){
                        let amount = Number(customerData.currentWalletBalance) + Number(razerpayInfo.amount_paid/100);
                        await models.customer.update({ currentWalletBalance: amount }, { where: { id: customerData.id }, transaction: t });
                        await models.walletDetails.create({customerId:customerData.id,amount:amount,paymentDirection:'credit',description:'Refund',productTypeId:4,transactionDate:moment()},{transaction: t});
                    }
                }
            }
            await models.walletTransactionTempDetails.update({refundCronExecuted : true},{ where: {id:temp.id},transaction: t });
        }
        return { loanRazorpayTemp, digiGoldOrderTemp, digiGoldWalletTemp, razorpayData }
    })
    return res.status(200).json({ data })
}