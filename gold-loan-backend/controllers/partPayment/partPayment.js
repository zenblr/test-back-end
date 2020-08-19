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
let { mergeInterestTable, getCustomerInterestAmount, getLoanDetails, payableAmount, customerLoanDetailsByMasterLoanDetails, allInterestPayment, penalInterestPayment, getInterestTableOfSingleLoan } = require('../../utils/loanFunction')


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

exports.checkPartAmount = async (req, res, next) => {
    let { paidAmount, masterLoanId } = req.body

    let amount = await getCustomerInterestAmount(masterLoanId);
    let loan = await getLoanDetails(masterLoanId);

    let data = await payableAmount(amount, loan)
    if (data.payableAmount > paidAmount) {
        return res.status(200).json({ message: `Your payable amount is greater than paid amount. You have to pay ${data.payableAmount}` })
    }
    let partPaymentAmount = Number(paidAmount) - Number(data.payableAmount)
    data.partPaymentAmount = (partPaymentAmount.toFixed(2))
    return res.status(200).json({ message: data })
}


exports.partPayment = async (req, res, next) => {
    let { masterLoanId, paidAmount, payableAmount } = req.body
    let createdBy = req.userData.id
    let { transactionDetails, securedLoanDetails, unsecuredLoanDetails, penalDate } = await allInterestPayment(masterLoanId, payableAmount, createdBy)



    let partPaymentamount = paidAmount - payableAmount

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

    //     let secure = await models.customerLoanInterest.bulkCreate(securedLoanDetails, {
    //         updateOnDuplicate: ['emiStatus', 'outstandingInterest', 'paidAmount', 'penalOutstanding', 'penalPaid', 'emiReceivedDate']
    //     }, { transaction: t })

    //     if (loanDetails.loan.customerLoan.length > 1) {

    //         let unsecure = await models.customerLoanInterest.bulkCreate(unsecuredLoanDetails, {
    //             updateOnDuplicate: ['emiStatus', 'outstandingInterest', 'paidAmount', 'penalOutstanding', 'penalPaid', 'emiReceivedDate']
    //         }, { transaction: t })

    //     }

    //     // penal date change
    //     if (penalDate) {
    //         await models.customerLoan.update({ penalInterestLastReceivedDate: penalDate.securedPenalData.securedPenalDate }, { where: { id: penalDate.securedPenalData.loanId }, transaction: t })
    //         if (penalDate.unsecuredPenalData) {
    //             await models.customerLoan.update({ penalInterestLastReceivedDate: penalDate.unsecuredPenalData.unsecuredPenalDate }, { where: { id: penalDate.unsecuredPenalData.loanId }, transaction: t })
    //         }
    //     }
    //     //penal date change

    // })

    return res.status(200).json({ message: data })
}