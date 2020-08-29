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
let { mergeInterestTable, getCustomerInterestAmount, getLoanDetails, payableAmountForLoan, customerLoanDetailsByMasterLoanDetails, allInterestPayment, penalInterestPayment, getInterestTableOfSingleLoan } = require('../../utils/loanFunction')


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
    let partPaymentamount = paidAmount - payableAmount

    let securedOutstandingAmount = loan.customerLoan[0].outstandingAmount
    let unsecuredOutstandingAmount = 0
    if (loan.isUnsecuredSchemeApplied) {
        unsecuredOutstandingAmount = loan.customerLoan[1].outstandingAmount
    }
    let totalOutstandingAmount = Number(securedOutstandingAmount) + Number(unsecuredOutstandingAmount)

    let securedRatio = securedOutstandingAmount / totalOutstandingAmount * (partPaymentamount)
    let newSecuredOutstandingAmount = securedOutstandingAmount - securedRatio
    let newUnsecuredOutstandingAmount = 0
    if (loan.isUnsecuredSchemeApplied) {
        var unsecuredRatio = unsecuredOutstandingAmount / totalOutstandingAmount * partPaymentamount
        newUnsecuredOutstandingAmount = Number(unsecuredOutstandingAmount) - unsecuredRatio
    }
    let newMasterOutstandingAmount = newSecuredOutstandingAmount + newUnsecuredOutstandingAmount

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
    let { masterLoanId, paidAmount } = req.body
    let createdBy = req.userData.id
    let amount = await getCustomerInterestAmount(masterLoanId);
    let { loan } = await customerLoanDetailsByMasterLoanDetails(masterLoanId);
    let { payableAmount } = await payableAmountForLoan(amount, loan)
    let { transactionDetails, securedLoanDetails, unsecuredLoanDetails, penalDate } = await allInterestPayment(masterLoanId, payableAmount, createdBy)

    let partPaymentamount = paidAmount - payableAmount
    if (payableAmount > paidAmount) {
        return res.status(200).json({ message: `Your payable amount is greater than paid amount. You have to pay ${payableAmount}` })
    }

    //// outstanding amount change
    let securedOutstandingAmount = loan.customerLoan[0].outstandingAmount
    let unsecuredOutstandingAmount = 0
    if (loan.isUnsecuredSchemeApplied) {
        unsecuredOutstandingAmount = loan.customerLoan[1].outstandingAmount
    }
    let totalOutstandingAmount = Number(securedOutstandingAmount) + Number(unsecuredOutstandingAmount)

    let securedRatio = securedOutstandingAmount / totalOutstandingAmount * (partPaymentamount)
    let newSecuredOutstandingAmount = securedOutstandingAmount - securedRatio
    let newUnsecuredOutstandingAmount = 0
    // await models.customerLoan.update({ outstandingAmount: newSecuredOutstandingAmount }, { where: { id: loan.customerLoan[0].id }, transaction: t })
    if (loan.isUnsecuredSchemeApplied) {
        var unsecuredRatio = unsecuredOutstandingAmount / totalOutstandingAmount * partPaymentamount
        newUnsecuredOutstandingAmount = Number(unsecuredOutstandingAmount) - unsecuredRatio
        // await models.customerLoan.update({ outstandingAmount: newUnsecuredOutstandingAmount }, { where: { id: loan.customerLoan[1].id }, transaction: t })
    }
    let newMasterOutstandingAmount = newSecuredOutstandingAmount + newUnsecuredOutstandingAmount
    // await models.customerLoanMaster.update({ outstandingAmount: newMasterOutstandingAmount }, { where: { id: loan.id }, transaction: t })
    //// outstanding amount change

  

    return res.status(200).json({ amount, transactionDetails, securedLoanDetails, unsecuredLoanDetails, penalDate })
}