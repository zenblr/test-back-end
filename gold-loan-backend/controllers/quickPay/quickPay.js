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
let { mergeInterestTable, getCustomerInterestAmount, getLoanDetails } = require('../../utils/loanFunction')

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

    let interest = amount.secured.interest
    let penalInterest = amount.secured.penalInterest
    let payableAmount = amount.secured.interest + amount.secured.penalInterest
    if (amount.unsecured) {
        payableAmount = payableAmount + amount.unsecured.interest + amount.unsecured.penalInterest
        interest = interest + amount.unsecured.interest
        penalInterest = penalInterest + amount.unsecured.penalInterest

    }
    let data = {}
    data.outstandingAmount = (loan.outstandingAmount).toFixed(2)
    data.interest = (interest).toFixed(2)
    data.penalInterest = (penalInterest).toFixed(2)
    data.payableAmount = (payableAmount).toFixed(2)

    return res.status(200).json({ data });
}

//CALCULATE PAYABLE AMOUNT
exports.payableAmountConfirm = async (req, res, next) => {
    let { masterLoanId, amount } = req.query

    let loan = await models.customerLoanMaster.findOne({
        where: { isActive: true, id: masterLoanId },
        attributes: ['id', 'outstandingAmount', 'finalLoanAmount', 'tenure'],
        order: [
            [models.customerLoan, 'id', 'desc']
        ],
        include: [{
            model: models.customerLoan,
            as: 'customerLoan',
            attributes: ['id', 'loanUniqueId', 'outstandingAmount', 'loanAmount'],
            where: { isActive: true }
        }]
    });
    console.log(amount)
    loan['amount'] = amount
    return res.status(200).json({ data: loan });

}

