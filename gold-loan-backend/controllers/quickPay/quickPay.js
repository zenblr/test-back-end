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

    let data = await allInterestPayment(masterLoanId, payableAmount, createdBy)

    
    // let quickPayData = await sequelize.transaction(async (t) => {

    //     var transaction = await models.customerLoanTransaction.create({
    //         paymentType: paymentDetails.paymentType,
    //         bankName: paymentDetails.bankName,
    //         branchName: paymentDetails.branchName,
    //         transactionAmont: payableAmount,
    //         createdBy: createdBy,
    //         chequeNumber: paymentDetails.chequeNumber,
    //         paymentReceivedDate: paymentDetails.depositDate,
    //         transactionUniqueId: paymentDetails.transactionId,
    //         masterLoanId
    //     }, { transaction: t })

    //     for (let index = 0; index < transactionDetails.length; index++) {
    //         const element = transactionDetails[index];
    //         element.customerLoanTransactionId = transaction.id
    //     }

    //     for (let index = 0; index < transactionDetails.length; index++) {


    //         let customerLoanTransactionDetails = await models.customerTransactionDetail.create(transactionDetails[index], { transaction: t })

    //         let referenceId = `${transactionDetails[index].loanUniqueId}-${customerLoanTransactionDetails.id}`

    //         let id = await models.customerTransactionDetail.update({ referenceId }, {
    //             where: { id: customerLoanTransactionDetails.id }, transaction: t
    //         })
    //     }

    //     console.log(securedLoanDetails)

    //     let secure = await models.customerLoanInterest.bulkCreate(securedLoanDetails, {
    //         updateOnDuplicate: ['emiStatus', 'outstandingInterest', 'paidAmount', 'penalOutstanding', 'penalPaid', 'emiReceivedDate']
    //     }, { transaction: t })

    //     if (loanDetails.loan.customerLoan.length > 1) {

    //         let unsecure = await models.customerLoanInterest.bulkCreate(unsecuredLoanDetails, {
    //             updateOnDuplicate: ['emiStatus', 'outstandingInterest', 'paidAmount', 'penalOutstanding', 'penalPaid', 'emiReceivedDate']
    //         }, { transaction: t })

    //     }

    //     let masterLoan = 
    // })
    return res.status(200).json({ data })

}

