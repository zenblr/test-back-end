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
let { mergeInterestTable, getCustomerInterestAmount, payableAmountForLoan, customerLoanDetailsByMasterLoanDetails, allInterestPayment } = require('../../utils/loanFunction')

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

    return res.status(200).json({ message: "success", data: interestInfo.loan })


}

//CALCULATE PAYABLE AMOUNT
exports.payableAmount = async (req, res, next) => {
    let { masterLoanId } = req.query;
    let amount = await getCustomerInterestAmount(masterLoanId);

    let loan = await customerLoanDetailsByMasterLoanDetails(masterLoanId);

    let data = await payableAmountForLoan(amount, loan.loan)

    return res.status(200).json({ data });
}

//CALCULATE PAYABLE AMOUNT
exports.payableAmountConfirm = async (req, res, next) => {
    let { masterLoanId, amount } = req.query
    let loan = await customerLoanDetailsByMasterLoanDetails(masterLoanId)

    return res.status(200).json({ data: loan });
}


exports.quickPayment = async (req, res, next) => {

    let createdBy = req.userData.id

    let { transacationId, paymentType, masterLoanId, payableAmount } = req.body;

    let { transactionDetails, securedLoanDetails, unsecuredLoanDetails } = await allInterestPayment(transacationId)


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
    return res.status(200).json({ transactionDetails, securedLoanDetails, unsecuredLoanDetails, penalDate })

}

exports.confirmationForPayment = async (req, res, next) => {

    let { transactionId, status } = req.body
    let modifiedBy = req.userData.id

    if (status == 'approved') {



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
                        let paid = await models.customerTransactionDetail.create({ masterLoanId: amount.masterLoanId, loanId: amount.loanId, isPenalInterest: amount.isPenalInterest, credit: amount.credit, description:description, paymentDate: moment() }, { transaction: t });
                        await models.customerTransactionDetail.update({ referenceId: `${amount.loanUniqueId}-${paid.id}` }, { where: { id: paid.id }, transaction: t });
                    } else {
                        let description = "interest for customer loan"      
                        let paid = await models.customerTransactionDetail.create({ masterLoanId: amount.masterLoanId, loanId: amount.loanId, credit: amount.credit,description:description, paymentDate: moment(), }, { transaction: t });
                        await models.customerTransactionDetail.update({ referenceId: `${amount.loanUniqueId}-${paid.id}` }, { where: { id: paid.id }, transaction: t });
                    }
                }
            }
            
          
        })

        return res.status(200).json({ message: "success" });
    }

}

