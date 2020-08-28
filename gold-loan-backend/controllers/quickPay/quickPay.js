const models = require("../../models");
const sequelize = models.sequelize;

const Sequelize = models.Sequelize;
const Op = Sequelize.Op;
const { createReferenceCode } = require("../../utils/referenceCode");

const request = require("request");
const moment = require("moment");
const CONSTANT = require("../../utils/constant");
var uniqid = require('uniqid');


const check = require("../../lib/checkLib");
const { paginationWithFromTo } = require("../../utils/pagination");
let sms = require('../../utils/sendSMS');
let { mergeInterestTable, getCustomerInterestAmount, payableAmountForLoan, customerLoanDetailsByMasterLoanDetails, allInterestPayment, getSingleDayInterestAmount } = require('../../utils/loanFunction')

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
        where: { masterLoanId: masterLoanId, depositStatus: "Completed" },
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

    return res.status(200).json({ data, interest });
}

//CALCULATE PAYABLE AMOUNT
exports.payableAmountConfirm = async (req, res, next) => {
    let { masterLoanId, amount } = req.query
    let loan = await customerLoanDetailsByMasterLoanDetails(masterLoanId)

    return res.status(200).json({ data: loan });
}


exports.quickPayment = async (req, res, next) => {

    let createdBy = req.userData.id

    let { paymentDetails, payableAmount, masterLoanId } = req.body;
    let { bankName, branchName, chequeNumber, depositDate, depositTransactionId, paymentType, transactionId } = paymentDetails

    let amount = await getCustomerInterestAmount(masterLoanId);
    let { loan } = await customerLoanDetailsByMasterLoanDetails(masterLoanId);
    let transactionUniqueId = uniqid.time().toUpperCase();

    if (!['cash', 'IMPS', 'NEFT', 'RTGS', 'cheque', 'UPI', 'gateway'].includes(paymentType)) {
        return res.status(400).json({ message: "Invalid payment type" })
    }
    let { penalInterest } = await payableAmountForLoan(amount, loan)
    let splitUpAmount = payableAmount - penalInterest

    let { isUnsecuredSchemeApplied, securedOutstandingAmount, unsecuredOutstandingAmount, totalOutstandingAmount, securedRatio, unsecuredRatio, newSecuredOutstandingAmount, newUnsecuredOutstandingAmount, newMasterOutstandingAmount, securedPenalInterest, unsecuredPenalInterest, securedInterest, unsecuredInterest, securedLoanId, unsecuredLoanId } = await getAmountLoanSplitUpData(loan, amount, splitUpAmount)

    paymentDetails.masterLoanId = masterLoanId
    paymentDetails.transactionAmont = payableAmount
    paymentDetails.depositDate = depositDate
    paymentDetails.transactionUniqueId = transactionUniqueId //ye change karna h
    paymentDetails.bankTransactionUniqueId = transactionId
    paymentDetails.depositStatus = "Pending"
    paymentDetails.paymentFor = 'QuickPay'
    paymentDetails.createdBy = createdBy

    let data = await sequelize.transaction(async t => {
        let customerLoanTransaction = await models.customerLoanTransaction.create(paymentDetails, { transaction: t })

        await models.customerTransactionSplitUp.create({
            customerLoanTransactionId: customerLoanTransaction.id,
            loanId: securedLoanId,
            masterLoanId: masterLoanId,
            penal: securedPenalInterest,
            interest: securedRatio,
            isSecured: true
        }, { transaction: t })

        if (isUnsecuredSchemeApplied) {
            await models.customerTransactionSplitUp.create({
                customerLoanTransactionId: customerLoanTransaction.id,
                loanId: unsecuredLoanId,
                masterLoanId: masterLoanId,
                penal: unsecuredPenalInterest,
                interest: unsecuredRatio,
                isSecured: false
            }, { transaction: t })
        }

        return customerLoanTransaction
    })
    return res.status(200).json({ data: 'success' })

}

exports.confirmationForPayment = async (req, res, next) => {

    let { transactionId, status } = req.body
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



        let payment = await allInterestPayment(transactionId);
        // let { securedPayableOutstanding, unSecuredPayableOutstanding, transactionDataSecured, transactionDataUnSecured, securedOutstandingAmount, unSecuredOutstandingAmount, outstandingAmount, securedLoanUniqueId, unSecuredLoanUniqueId } = await getTransactionPrincipalAmount(transactionId);

        let quickPayData = await sequelize.transaction(async (t) => {

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
                        let description = "penal interest for customer loan"
                        let paid = await models.customerTransactionDetail.create({ customerLoanTransactionId: transactionId, masterLoanId: amount.masterLoanId, loanId: amount.loanId, isPenalInterest: amount.isPenalInterest, credit: amount.credit, description: description, paymentDate: moment() }, { transaction: t });
                        await models.customerTransactionDetail.update({ referenceId: `${amount.loanUniqueId}-${paid.id}` }, { where: { id: paid.id }, transaction: t });
                    } else {
                        let description = "interest for customer loan"
                        let paid = await models.customerTransactionDetail.create({ customerLoanTransactionId: transactionId, masterLoanId: amount.masterLoanId, loanId: amount.loanId, credit: amount.credit, description: description, paymentDate: moment(), }, { transaction: t });
                        await models.customerTransactionDetail.update({ referenceId: `${amount.loanUniqueId}-${paid.id}` }, { where: { id: paid.id }, transaction: t });
                    }
                }
            }


        })

        return res.status(200).json({ message: "success" });
    }

}

