const models = require("../../models");
const sequelize = models.sequelize;

const Sequelize = models.Sequelize;
const Op = Sequelize.Op;
const { createReferenceCode } = require("../../utils/referenceCode");

const request = require("request");
const moment = require("moment");
const CONSTANT = require("../../utils/constant");

const check = require("../../lib/checkLib");
const { paginationWithFromTo } = require("../../utils/pagination");
let sms = require('../../utils/sendSMS');
let { mergeInterestTable, getCustomerInterestAmount, getLoanDetails, getAmountLoanSplitUpData, payableAmountForLoan, customerLoanDetailsByMasterLoanDetails, allInterestPayment, penalInterestPayment, getInterestTableOfSingleLoan } = require('../../utils/loanFunction')


exports.getInterestInfo = async (req, res, next) => {
    let { loanId, masterLoanId } = req.query;

    let interestInfo = await customerLoanDetailsByMasterLoanDetails(masterLoanId);

    return res.status(200).json({ message: "success", data: interestInfo.loan })


}

exports.checkPartAmount = async (req, res, next) => {
    let { paidAmount, masterLoanId } = req.body

    let amount = await getCustomerInterestAmount(masterLoanId);
    let loan = await customerLoanDetailsByMasterLoanDetails(masterLoanId);
    let data = await payableAmountForLoan(amount, loan.loan)
    if (data.payableAmount > paidAmount) {
        return res.status(200).json({ message: `Your payable amount is greater than paid amount. You have to pay ${data.payableAmount}` })
    }
    let partPaymentAmount = Number(paidAmount) - Number(data.payableAmount)
    data.partPaymentAmount = (partPaymentAmount.toFixed(2))
    data.paidAmount = paidAmount
    data.loanDetails = loan.loan
    return res.status(200).json({ data })
}

//CALCULATE PAYABLE AMOUNT
exports.payableAmountConfirmPartPayment = async (req, res, next) => {
    let { masterLoanId, paidAmount } = req.body
    let amount = await getCustomerInterestAmount(masterLoanId);
    let { loan } = await customerLoanDetailsByMasterLoanDetails(masterLoanId)
    let { payableAmount } = await payableAmountForLoan(amount, loan)
    let partPaymentAmount = paidAmount - payableAmount

    let { isUnsecuredSchemeApplied, securedOutstandingAmount, unsecuredOutstandingAmount, totalOutstandingAmount, securedRatio, unsecuredRatio, newSecuredOutstandingAmount, newUnsecuredOutstandingAmount, newMasterOutstandingAmount, securedPenalInterest, unsecuredPenalInterest, securedInterest, unsecuredInterest } = await getAmountLoanSplitUpData(loan, amount, partPaymentAmount)

    loan.dataValues.newOutstandingAmount = newMasterOutstandingAmount

    loan.dataValues.customerLoan[0].dataValues.partPayment = securedRatio.toFixed(2)
    loan.dataValues.customerLoan[0].dataValues.newOutstandingAmount = newSecuredOutstandingAmount.toFixed(2)

    if (loan.isUnsecuredSchemeApplied) {
        loan.dataValues.customerLoan[1].dataValues.partPayment = unsecuredRatio.toFixed(2)
        loan.dataValues.customerLoan[1].dataValues.newOutstandingAmount = newUnsecuredOutstandingAmount.toFixed(2)
    }

    return res.status(200).json({ data: loan });
}


exports.partPayment = async (req, res, next) => {
    let { masterLoanId, paidAmount, paymentDetails } = req.body
    let { bankName, branchName, chequeNumber, depositDate, depositTransactionId, paymentType, transactionId } = paymentDetails
    let createdBy = req.userData.id
    let amount = await getCustomerInterestAmount(masterLoanId);
    let { loan } = await customerLoanDetailsByMasterLoanDetails(masterLoanId);
    let { payableAmount } = await payableAmountForLoan(amount, loan)

    if (!['cash', 'IMPS', 'NEFT', 'RTGS', 'cheque', 'UPI', 'gateway'].includes(paymentType)) {
        return res.status(400).json({ message: "Invalid payment type" })
    }

    let partPaymentAmount = paidAmount - payableAmount
    if (payableAmount > paidAmount) {
        return res.status(200).json({ message: `Your payable amount is greater than paid amount. You have to pay ${payableAmount}` })
    }
    let { isUnsecuredSchemeApplied, securedOutstandingAmount, unsecuredOutstandingAmount, totalOutstandingAmount, securedRatio, unsecuredRatio, newSecuredOutstandingAmount, newUnsecuredOutstandingAmount, newMasterOutstandingAmount, securedPenalInterest, unsecuredPenalInterest, securedInterest, unsecuredInterest } = await getAmountLoanSplitUpData(loan, amount, partPaymentAmount)

    paymentDetails.masterLoanId = masterLoanId
    paymentDetails.transactionAmont = paidAmount
    paymentDetails.depositDate = depositDate
    paymentDetails.transactionUniqueId = transactionId
    paymentDetails.depositStatus = "Pending"
    paymentDetails.paymentFor = 'partPayment'
    paymentDetails.createdBy = createdBy

    // let data = await sequelize.transaction(async t => {
    //     let data = await models.customerLoanTransaction.create(paymentDetails, { transaction: t })

    //     await models.customerLoanTransaction.create

    //     return data
    // })

    return res.status(200).json({ isUnsecuredSchemeApplied, securedOutstandingAmount, unsecuredOutstandingAmount, totalOutstandingAmount, securedRatio, unsecuredRatio, newSecuredOutstandingAmount, newUnsecuredOutstandingAmount, newMasterOutstandingAmount, securedPenalInterest, unsecuredPenalInterest, securedInterest, unsecuredInterest })
}