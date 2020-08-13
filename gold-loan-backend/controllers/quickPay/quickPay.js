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
let { mergeInterestTable, getCustomerInterestAmount, getLoanDetails, payableAmount, customerLoanDetailsByMasterLoanDetails } = require('../../utils/loanFunction')

//INTEREST TABLE 
exports.getInterestTable = async (req, res, next) => {
    let { loanId, masterLoanId } = req.query;

    let { mergeTble, securedTable, unsecuredTable } = await mergeInterestTable(masterLoanId)

    return res.status(200).json({ data: mergeTble })
}

//INTEREST INFO
exports.getInterestInfo = async (req, res, next) => {
    let { loanId, masterLoanId } = req.query;

    let interestInfo = await models.customerLoanMaster.findOne({
        where: { id: masterLoanId },
        order: [[models.customerLoan, 'id', 'asc']],
        attributes: { exclude: ['createdAt', 'updatedAt', 'createdBy', 'modifiedBy', 'isActive'] },
        include: [
            {
                model: models.customerLoan,
                as: 'customerLoan',
                attributes: { exclude: ['createdAt', 'updatedAt', 'createdBy', 'modifiedBy', 'isActive'] },
                include: [
                    {
                        model: models.scheme,
                        as: 'scheme',
                        attributes: { exclude: ['createdAt', 'updatedAt', 'createdBy', 'modifiedBy', 'isActive'] },
                    }
                ]
            }
        ]
    })

    return res.status(200).json({ message: "success", data: interestInfo })


}

//CALCULATE PAYABLE AMOUNT
exports.payableAmount = async (req, res, next) => {
    let { masterLoanId } = req.query;
    let amount = await getCustomerInterestAmount(masterLoanId);

    let loan = await getLoanDetails(masterLoanId);

    let data = await payableAmount(amount, loan)

    return res.status(200).json({ data });
}

//CALCULATE PAYABLE AMOUNT
exports.payableAmountConfirm = async (req, res, next) => {
    let { masterLoanId, amount } = req.query
    let loan = await customerLoanDetailsByMasterLoanDetails(masterLoanId)

    return res.status(200).json({ data: loan });
}

exports.partPayment = async (req, res, next) => {
    let { masterLoanId, amount } = req.query
}

exports.quickPayment = async (req, res, next) => {

    let { paymentDetails, paymentType, masterLoanId, payableAmount } = req.body;

    let amount = await getCustomerInterestAmount(masterLoanId);

    let loanDetails = await customerLoanDetailsByMasterLoanDetails(masterLoanId)

    let loan = await getLoanDetails(masterLoanId);

    // let loan


    // let outstandingAmount = Number(loan.outstandingAmount.toFixed(2))

    let securedPenalInterest = amount.secured.penalInterest
    let securedInterest = amount.secured.interest
    let securedOutstandingAmount = loanDetails.loan.customerLoan[0].outstandingAmount

    let unsecuredInterest = 0
    let unsecuredPenalInterest = 0
    let unsecuredOutstandingAmount = 0
    // let payableAmount = amount.secured.interest + amount.secured.penalInterest
    if (amount.unSecured) {
        unsecuredInterest = amount.unSecured.interest
        unsecuredPenalInterest = amount.unSecured.penalInterest
        unsecuredOutstandingAmount = loanDetails.loan.customerLoan[1].outstandingAmount
    }
    let totalOutstandingAmount = securedOutstandingAmount + unsecuredOutstandingAmount

    // divinding in ratio

    let securedRatio = securedOutstandingAmount / totalOutstandingAmount * payableAmount;
    // securedRatio = Number(securedRatio - securedPenalInterest)

    if (amount.unSecured) {
        var unsecuredRatio = unsecuredOutstandingAmount / totalOutstandingAmount * payableAmount
        // unsecuredRatio = unsecuredRatio - unsecuredPenalInterest
    }

    // payableAmount = payableAmount + amount.unSecured.interest + amount.unSecured.penalInterest
    // interest = interest + amount.unSecured.interest
    // penalInterest = penalInterest + amount.unSecured.penalInterest
    // unsecuredInterest = amount.unSecured.interest
    // unsecuredPenalInterest = amount.unSecured.penalInterest

    return res.status(200).json({ unsecuredRatio, securedRatio, paymentDetails })
}

