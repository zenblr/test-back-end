const models = require("../../models");
const sequelize = models.sequelize;

const Sequelize = models.Sequelize;
const Op = Sequelize.Op;
const { createReferenceCode } = require("../../utils/referenceCode");
const _ = require('lodash');
const request = require("request");
const moment = require("moment");
const CONSTANT = require("../../utils/constant");
var uniqid = require('uniqid');
const razorpay = require('../../utils/razorpay');
let crypto = require('crypto');


const check = require("../../lib/checkLib");
const { paginationWithFromTo } = require("../../utils/pagination");
let sms = require('../../utils/sendSMS');
let { mergeInterestTable, getCustomerInterestAmount, payableAmountForLoan, customerLoanDetailsByMasterLoanDetails, allInterestPayment, getSingleDayInterestAmount, getAmountLoanSplitUpData } = require('../../utils/loanFunction')

exports.razorPayCreateOrder = async (req, res, next) => {
    let { amount } = req.body;
    let transactionUniqueId = uniqid.time().toUpperCase();
    let payableAmount = await amount * 100;
    let razorPayOrder = await razorpay.instance.orders.create({ amount: payableAmount, currency: "INR", receipt: `${transactionUniqueId}`, payment_capture: 0, notes: "gold loan" });
    return res.status(200).json({ razorPayOrder, razerPayConfig: razorpay.razorPayConfig.key_id });
}

//INTEREST TABLE 
exports.getInterestTable = async (req, res, next) => {
    let { loanId, masterLoanId } = req.query;

    let { mergeTble, securedTable, unsecuredTable } = await mergeInterestTable(masterLoanId)

    return res.status(200).json({ data: mergeTble })
}

//INTEREST INFO
exports.getInterestInfo = async (req, res, next) => {
    let { loanId, masterLoanId } = req.query;

    let interestInfo = await customerLoanDetailsByMasterLoanDetails(masterLoanId);

    let lastPayment = await models.customerLoanTransaction.findAll({
        where: { masterLoanId: masterLoanId, depositStatus: "Completed", paymentFor: 'quickPay' },
        order: [
            ['id', 'asc']
        ]
    })
    let lastPaymentDate = null

    if (lastPayment.length != 0) {
        lastPaymentDate = lastPayment[lastPayment.length - 1].depositDate
    }

    interestInfo.loan.dataValues.lastPaymentDate = lastPaymentDate

    return res.status(200).json({ message: "success", data: interestInfo.loan })


}

//CALCULATE PAYABLE AMOUNT
exports.payableAmount = async (req, res, next) => {
    let { masterLoanId } = req.query;
    let amount = await getCustomerInterestAmount(masterLoanId);

    let loan = await customerLoanDetailsByMasterLoanDetails(masterLoanId);

    let interest = await getSingleDayInterestAmount(loan.loan)

    let data = await payableAmountForLoan(amount, loan.loan)
    data.unsecuredTotalInterest = interest.unsecuredTotalInterest
    data.securedTotalInterest = interest.securedTotalInterest

    return res.status(200).json({ data });
}

//CALCULATE PAYABLE AMOUNT
exports.payableAmountConfirm = async (req, res, next) => {
    let { masterLoanId, amount } = req.query

    let payableAmount = 0;

    let interestTable = await models.customerLoanInterest.findAll({
        where: {
            masterLoanId: masterLoanId,
            emiStatus: { [Op.notIn]: ['paid'] },
        }
    })

    for (const emi of interestTable) {
        payableAmount += Number(emi.outstandingInterest)
        if (emi.penalInterest) {
            payableAmount += Number(emi.penalInterest)

        }
    }

    if (payableAmount < Number(amount)) {
        return res.status(403).json({ message: "Amount should Be less than payable amount" });

    }


    loan = await customerLoanDetailsByMasterLoanDetails(masterLoanId)

    return res.status(200).json({ data: loan });
}

exports.quickPayment = async (req, res, next) => {

    let createdBy = req.userData.id

    let { paymentDetails, payableAmount, masterLoanId, transactionDetails } = req.body;
    let { bankName, branchName, chequeNumber, depositDate, depositTransactionId, paymentType, transactionId } = paymentDetails

    let amount = await getCustomerInterestAmount(masterLoanId);
    let { loan } = await customerLoanDetailsByMasterLoanDetails(masterLoanId);
    let transactionUniqueId = uniqid.time().toUpperCase();

    if (!['cash', 'IMPS', 'NEFT', 'RTGS', 'cheque', 'UPI', 'gateway'].includes(paymentType)) {
        return res.status(400).json({ message: "Invalid payment type" })
    }
    let signatureVerification = false;
    let razorPayTransactionId;
    let isRazorPay = false;
    if (paymentType == 'gateway') {
        let razerpayData = await razorpay.instance.orders.fetch(transactionDetails.razorpay_order_id);
        transactionUniqueId = razerpayData.receipt;
        const generated_signature = crypto
            .createHmac(
                "SHA256",
                razorpay.razorPayConfig.key_secret
            )
            .update(transactionDetails.razorpay_order_id + "|" + transactionDetails.razorpay_payment_id)
            .digest("hex");
        if (generated_signature == transactionDetails.razorpay_signature) {
            signatureVerification = true;
            isRazorPay = true;
            razorPayTransactionId = transactionDetails.razorpay_order_id;
        }
        if (signatureVerification == false) {
            return res.status(422).json({ message: "razorpay payment verification failed" });
        }
    }
    let { penalInterest } = await payableAmountForLoan(amount, loan)
    let splitUpAmount = payableAmount - penalInterest
    let penalInterestRatio;
    if (splitUpAmount <= 0) {
        penalInterestRatio = await getAmountLoanSplitUpData(loan, amount, payableAmount)
        splitUpAmount = 0
    }


    let data = await getAmountLoanSplitUpData(loan, amount, splitUpAmount);
    let { isUnsecuredSchemeApplied, securedOutstandingAmount, unsecuredOutstandingAmount, totalOutstandingAmount, securedRatio, unsecuredRatio, newSecuredOutstandingAmount, newUnsecuredOutstandingAmount, newMasterOutstandingAmount, securedInterest, unsecuredInterest, securedLoanId, unsecuredLoanId } = data

    let securedPenalInterest = 0;
    let unsecuredPenalInterest = 0;
    if (splitUpAmount <= 0) {
        securedPenalInterest = penalInterestRatio.securedRatio
        unsecuredPenalInterest = penalInterestRatio.unsecuredRatio
    } else {
        securedPenalInterest = data.securedPenalInterest
        unsecuredPenalInterest = data.unsecuredPenalInterest
    }

    paymentDetails.masterLoanId = masterLoanId
    paymentDetails.transactionAmont = payableAmount
    paymentDetails.depositDate = moment(depositDate).utcOffset("+05:30").format("YYYY-MM-DD");
    paymentDetails.transactionUniqueId = transactionUniqueId //ye change karna h
    if (isRazorPay) {
        paymentDetails.razorPayTransactionId = razorPayTransactionId
    }
    paymentDetails.bankTransactionUniqueId = transactionId
    paymentDetails.depositStatus = "Pending"
    paymentDetails.paymentFor = 'quickPay'

    await sequelize.transaction(async t => {
        let customerLoanTransaction = await models.customerLoanTransaction.create(paymentDetails, { transaction: t })

        await models.customerTransactionSplitUp.create({
            customerLoanTransactionId: customerLoanTransaction.id,
            loanId: securedLoanId,
            masterLoanId: masterLoanId,
            penal: securedPenalInterest.toFixed(2),
            interest: securedRatio,
            isSecured: true
        }, { transaction: t })

        if (isUnsecuredSchemeApplied) {
            await models.customerTransactionSplitUp.create({
                customerLoanTransactionId: customerLoanTransaction.id,
                loanId: unsecuredLoanId,
                masterLoanId: masterLoanId,
                penal: unsecuredPenalInterest.toFixed(2),
                interest: unsecuredRatio,
                isSecured: false
            }, { transaction: t })
        }

        return customerLoanTransaction
    })
    return res.status(200).json({ data: 'success' })

}

exports.confirmationForPayment = async (req, res, next) => {

    let { transactionId, status, paymentReceivedDate } = req.body
    let modifiedBy = req.userData.id

    let transactionDetail = await models.customerLoanTransaction.findOne({ where: { id: transactionId } })

    if (transactionDetail.depositStatus == "Completed" || transactionDetail.depositStatus == "Rejected") {
        return res.status(400).json({ message: `You can not change the status from this stage.` })
    }

    if (status == "Rejected") {
        await models.customerLoanTransaction.update({ depositStatus: status }, { where: { id: transactionId } });
    }
    if (status == "Pending") {
        await models.customerLoanTransaction.update({ depositStatus: status }, { where: { id: transactionId } });
    }

    if (status == 'Completed') {



        var payment = await allInterestPayment(transactionId,paymentReceivedDate);
        // let { securedPayableOutstanding, unSecuredPayableOutstanding, transactionDataSecured, transactionDataUnSecured, securedOutstandingAmount, unSecuredOutstandingAmount, outstandingAmount, securedLoanUniqueId, unSecuredLoanUniqueId } = await getTransactionPrincipalAmount(transactionId);

        let quickPayData = await sequelize.transaction(async (t) => {


            await models.customerLoanTransaction.update({ depositStatus: status, paymentReceivedDate: moment() }, { where: { id: transactionId }, transaction: t });

            if (payment.securedLoanDetails) {
                for (const interest of payment.securedLoanDetails) {
                    await models.customerLoanInterest.update({ paidAmount: interest.paidAmount, interestAccrual: interest.interestAccrual, outstandingInterest: interest.outstandingInterest, emiReceivedDate: moment(), penalAccrual: interest.penalAccrual, penalOutstanding: interest.penalOutstanding, penalPaid: interest.penalPaid, modifiedBy, emiStatus: interest.emiStatus }, { where: { id: interest.id }, transaction: t });
                }
            }
            if (payment.unsecuredLoanDetails) {
                for (const interest of payment.unsecuredLoanDetails) {
                    await models.customerLoanInterest.update({ paidAmount: interest.paidAmount, interestAccrual: interest.interestAccrual, outstandingInterest: interest.outstandingInterest, emiReceivedDate: moment(), penalAccrual: interest.penalAccrual, penalOutstanding: interest.penalOutstanding, penalPaid: interest.penalPaid, modifiedBy, emiStatus: interest.emiStatus }, { where: { id: interest.id }, transaction: t });
                }
            }
            //update in transaction
            if (payment.transactionDetails) {
                for (const amount of payment.transactionDetails) {
                    if (amount.isPenalInterest) {
                        //debit
                        let checkDebitEntry = await models.customerTransactionDetail.findAll({ where: { masterLoanId: amount.masterLoanId, loanId: amount.loanId, loanInterestId: amount.loanInterestId, isPenalInterest: true } });
                        if (checkDebitEntry.length == 0) {
                            let debit = await models.customerTransactionDetail.create({ masterLoanId: amount.masterLoanId, loanId: amount.loanId, loanInterestId: amount.loanInterestId, isPenalInterest: true, debit: amount.penalInterest, description: `Penal interest` }, { transaction: t });
                            await models.customerTransactionDetail.update({ referenceId: `${amount.loanUniqueId}-${debit.id}` }, { where: { id: debit.id }, transaction: t });
                        } else {
                            let debitedAmount = await checkDebitEntry.map((data) => Number(data.debit));
                            let totalDebitedAmount = _.sum(debitedAmount);
                            let newDebitAmount = amount.penalInterest - totalDebitedAmount;
                            if (newDebitAmount > 0) {
                                let debit = await models.customerTransactionDetail.create({ masterLoanId: amount.masterLoanId, loanId: amount.loanId, loanInterestId: amount.loanInterestId, isPenalInterest: true, debit: newDebitAmount, description: `Penal interest` }, { transaction: t });
                                await models.customerTransactionDetail.update({ referenceId: `${amount.loanUniqueId}-${debit.id}` }, { where: { id: debit.id }, transaction: t });
                            }
                        }
                        //credit
                        let description = "penal interest Received"
                        let paid = await models.customerTransactionDetail.create({ customerLoanTransactionId: transactionId, masterLoanId: amount.masterLoanId, loanId: amount.loanId, isPenalInterest: amount.isPenalInterest, credit: amount.credit, description: description, paymentDate: moment() }, { transaction: t });
                        await models.customerTransactionDetail.update({ referenceId: `${amount.loanUniqueId}-${paid.id}` }, { where: { id: paid.id }, transaction: t });
                    } else {
                        if (amount.isExtraDaysInterest) {
                            //debit
                            let checkDebitEntry = await models.customerTransactionDetail.findAll({ where: { masterLoanId: amount.masterLoanId, loanId: amount.loanId, loanInterestId: amount.loanInterestId, isPenalInterest: false } });
                            if (checkDebitEntry.length == 0) {
                                let debit = await models.customerTransactionDetail.create({ masterLoanId: amount.masterLoanId, loanId: amount.loanId, loanInterestId: amount.loanInterestId, debit: amount.interestAmount, description: `Extra days interest` }, { transaction: t });
                                await models.customerTransactionDetail.update({ referenceId: `${amount.loanUniqueId}-${debit.id}` }, { where: { id: debit.id }, transaction: t });
                            } else {
                                let debitedAmount = await checkDebitEntry.map((data) => Number(data.debit));
                                let totalDebitedAmount = _.sum(debitedAmount);
                                let newDebitAmount = amount.interestAmount - totalDebitedAmount;
                                if (newDebitAmount > 0) {
                                    let debit = await models.customerTransactionDetail.create({ masterLoanId: amount.masterLoanId, loanId: amount.loanId, loanInterestId: amount.loanInterestId, debit: newDebitAmount, description: `Extra days interest` }, { transaction: t });
                                    await models.customerTransactionDetail.update({ referenceId: `${amount.loanUniqueId}-${debit.id}` }, { where: { id: debit.id }, transaction: t });
                                }
                            }
                            //credit
                            let paid = await models.customerTransactionDetail.create({ customerLoanTransactionId: transactionId, masterLoanId: amount.masterLoanId, loanId: amount.loanId, credit: amount.credit, description: `Extra days interest received`, paymentDate: moment(), }, { transaction: t });
                            await models.customerTransactionDetail.update({ referenceId: `${amount.loanUniqueId}-${paid.id}` }, { where: { id: paid.id }, transaction: t });
                        } else {
                            let paid = await models.customerTransactionDetail.create({ customerLoanTransactionId: transactionId, masterLoanId: amount.masterLoanId, loanInterestId: amount.loanInterestId, loanId: amount.loanId, credit: amount.credit, description: `interest received ${amount.emiDueDate}`, paymentDate: moment(), }, { transaction: t });
                            await models.customerTransactionDetail.update({ referenceId: `${amount.loanUniqueId}-${paid.id}` }, { where: { id: paid.id }, transaction: t });
                        }

                    }
                }
            }



        })

    }
    return res.status(200).json({ message: "success", payment });



}

exports.transcationHistory = async (req, res, next) => {

    let { masterLoanId } = req.query;

    let data = await models.customerLoanTransaction.findAll({
        where: {
            masterLoanId: masterLoanId,
            paymentFor: 'quickPay',
        },
        attributes: ['transactionUniqueId', 'transactionAmont', 'paymentReceivedDate', 'depositStatus']
    })

    return res.status(200).json({ data: data })

}
