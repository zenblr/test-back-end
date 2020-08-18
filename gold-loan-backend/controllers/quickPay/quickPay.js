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
let { mergeInterestTable, getCustomerInterestAmount, getLoanDetails, payableAmount, customerLoanDetailsByMasterLoanDetails, allInterestPayment, penalInterestPayment } = require('../../utils/loanFunction')

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

    let createdBy = req.userData.id

    let { paymentDetails, paymentType, masterLoanId, payableAmount } = req.body;

    let data = await allInterestPayment(masterLoanId, payableAmount)

    // let amount = await getCustomerInterestAmount(masterLoanId);

    // let loanDetails = await customerLoanDetailsByMasterLoanDetails(masterLoanId)

    // let loan = await getLoanDetails(masterLoanId);

    // // let loan


    // // let outstandingAmount = Number(loan.outstandingAmount.toFixed(2))

    // let securedPenalInterest = amount.secured.penalInterest
    // let securedInterest = amount.secured.interest
    // let securedOutstandingAmount = loanDetails.loan.customerLoan[0].outstandingAmount

    // let unsecuredInterest = 0
    // let unsecuredPenalInterest = 0
    // let unsecuredOutstandingAmount = 0
    // // let payableAmount = amount.secured.interest + amount.secured.penalInterest
    // if (loanDetails.loan.customerLoan.length > 1) {
    //     unsecuredInterest = amount.unsecured.interest
    //     unsecuredPenalInterest = amount.unsecured.penalInterest
    //     unsecuredOutstandingAmount = loanDetails.loan.customerLoan[1].outstandingAmount
    // }
    // let totalOutstandingAmount = Number(securedOutstandingAmount) + Number(unsecuredOutstandingAmount)

    // // divinding in ratio

    // // secure 
    // let securedRatio = securedOutstandingAmount / totalOutstandingAmount * payableAmount;
    // if (Number(securedPenalInterest) > 0) {
    //     securedRatio = Number(securedRatio - securedPenalInterest)
    // }
    // if (amount.unsecured) {

    //     var unsecuredRatio = unsecuredOutstandingAmount / totalOutstandingAmount * payableAmount
    //     if (Number(unsecuredPenalInterest) > 0) {
    //         unsecuredRatio = Number(unsecuredRatio - unsecuredPenalInterest)
    //     }
    // }


    // let transactionDetails = []

    // let securedLoanDetails = await models.customerLoanInterest.findAll({
    //     where: {
    //         loanId: loanDetails.loan.customerLoan[0].id,
    //         emiStatus: { [Op.in]: ['pending', 'partially paid'] }
    //     },
    //     order: [['id']]
    // })
    // let temp = []
    // for (let index = 0; index < securedLoanDetails.length; index++) {
    //     temp.push(securedLoanDetails[index].dataValues)
    // }
    // securedLoanDetails = []
    // if (Number(securedPenalInterest) > 0) {
    //     temp = await penalInterestPayment(temp, securedPenalInterest, createdBy);
    //     Array.prototype.push.apply(transactionDetails, temp.transaction)
    //     securedLoanDetails = temp.loanArray
    // } else {
    //     securedLoanDetails = temp;
    // }
    // console.log(securedLoanDetails)


    // newSecuredDetails = await allInterestPayment(securedLoanDetails, securedRatio, createdBy)
    // securedLoanDetails = newSecuredDetails.loanArray
    // Array.prototype.push.apply(transactionDetails, newSecuredDetails.transaction)

    // // unsecure
    // if (loanDetails.loan.customerLoan.length > 1) {


    //     var unsecuredLoanDetails = await models.customerLoanInterest.findAll({
    //         where: {
    //             loanId: loanDetails.loan.customerLoan[1].id,
    //             emiStatus: { [Op.in]: ['pending', 'partially paid'] }
    //         },
    //         order: [['id']]
    //     })

    //     let temp = []
    //     for (let index = 0; index < unsecuredLoanDetails.length; index++) {
    //         temp.push(unsecuredLoanDetails[index].dataValues)
    //     }
    //     unsecuredLoanDetails = []
    //     if (Number(unsecuredPenalInterest) > 0) {
    //         temp = await penalInterestPayment(temp, unsecuredPenalInterest, createdBy);
    //         Array.prototype.push.apply(transactionDetails, temp.transaction)
    //         unsecuredLoanDetails = temp.loanArray
    //     } else {
    //         unsecuredLoanDetails = temp;
    //         // console.log(securedLoanDetails)
    //     }

    //     let newUnsecuredDetails = await allInterestPayment(unsecuredLoanDetails, unsecuredRatio, createdBy)
    //     unsecuredLoanDetails = newUnsecuredDetails.loanArray
    //     Array.prototype.push.apply(transactionDetails, newUnsecuredDetails.transaction)
    // }



    // let quickPayData = await sequelize.transaction(async (t) => {

    //     var transaction = await models.customerLoanTransaction.create({ 
    //         paymentType: paymentDetails.paymentType, 
    //         bankName:paymentDetails.bankName,
    //         branchName:paymentDetails.branchName,
    //         transactionAmont: payableAmount, 
    //         createdBy:createdBy,
    //         chequeNumber:paymentDetails.chequeNumber,
    //         paymentReceivedDate:paymentDetails.depositDate,
    //         transactionUniqueId:paymentDetails.transactionId,
    //         masterLoanId })

    //    for (let index = 0; index < transactionDetails.length; index++) {
    //        const element = transactionDetails[index];
    //        element.customerLoanTransactionId = transaction.id
    //    }

    //     let customerLoanTransactionDetails = await models.customerTransactionDetail.bulkCreate(transactionDetails, { transaction: t })

    //     console.log(securedLoanDetails)

    //     let secure = await models.customerLoanInterest.bulkCreate(securedLoanDetails, {
    //         updateOnDuplicate: ['emiStatus', 'outstandingInterest', 'paidAmount','penalOutstanding','penalPaid','emiReceivedDate']
    //     }, { transaction: t })

    //     if (loanDetails.loan.customerLoan.length > 1) {

    //         let unsecure = await models.customerLoanInterest.bulkCreate(unsecuredLoanDetails, {
    //             updateOnDuplicate: ['emiStatus', 'outstandingInterest', 'paidAmount','penalOutstanding','penalPaid','emiReceivedDate']
    //         },{ transaction: t })

    //     }
    // })
    return res.status(200).json({ data })

}

