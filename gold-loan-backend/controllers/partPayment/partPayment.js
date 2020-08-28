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

    let { isUnsecuredSchemeApplied, securedOutstandingAmount, unsecuredOutstandingAmount, totalOutstandingAmount, securedRatio, unsecuredRatio, newSecuredOutstandingAmount, newUnsecuredOutstandingAmount, newMasterOutstandingAmount, securedPenalInterest, unsecuredPenalInterest, securedInterest, unsecuredInterest, securedLoanId, unsecuredLoanId } = await getAmountLoanSplitUpData(loan, amount, partPaymentAmount)

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
    let { isUnsecuredSchemeApplied, securedOutstandingAmount, unsecuredOutstandingAmount, totalOutstandingAmount, securedRatio, unsecuredRatio, newSecuredOutstandingAmount, newUnsecuredOutstandingAmount, newMasterOutstandingAmount, securedPenalInterest, unsecuredPenalInterest, securedInterest, unsecuredInterest, securedLoanId, unsecuredLoanId } = await getAmountLoanSplitUpData(loan, amount, partPaymentAmount)

    paymentDetails.masterLoanId = masterLoanId
    paymentDetails.transactionAmont = paidAmount
    paymentDetails.depositDate = depositDate
    paymentDetails.transactionUniqueId = transactionId
    paymentDetails.depositStatus = "Pending"
    paymentDetails.paymentFor = 'partPayment'
    paymentDetails.createdBy = createdBy

    let data = await sequelize.transaction(async t => {
        let customerLoanTransaction = await models.customerLoanTransaction.create(paymentDetails, { transaction: t })

        await models.customerTransactionSplitUp.create({
            customerLoanTransactionId: customerLoanTransaction.id,
            loanId: securedLoanId,
            masterLoanId: masterLoanId,
            payableOutstanding: securedRatio,
            penal: securedPenalInterest,
            interest: securedInterest,
            isSecured: true
        }, { transaction: t })

        if (isUnsecuredSchemeApplied) {
            await models.customerTransactionSplitUp.create({
                customerLoanTransactionId: customerLoanTransaction.id,
                loanId: unsecuredLoanId,
                masterLoanId: masterLoanId,
                payableOutstanding: unsecuredRatio,
                penal: unsecuredPenalInterest,
                interest: unsecuredInterest,
                isSecured: false
            }, { transaction: t })
        }

        return customerLoanTransaction
    })

    return res.status(200).json({ message: 'success' })
}

exports.confirmPartPaymentTranscation = async (req,res,next) =>{

    let {transactionId , status} = req.body

    let createdBy = req.userData.id

    if(status == 'approved'){
        let { transactionDetails, securedLoanDetails, unsecuredLoanDetails } = await allInterestPayment(transactionId,createdBy)
        let quickPayData = await sequelize.transaction(async (t) => {

                var transaction = await models.customerLoanTransaction.create({
                    paymentType: paymentDetails.paymentType,
                    bankName: paymentDetails.bankName,
                    branchName: paymentDetails.branchName,
                    transactionAmont: payableAmount,
                    createdBy: createdBy,
                    chequeNumber: paymentDetails.chequeNumber,
                    paymentReceivedDate: paymentDetails.depositDate,
                    transactionUniqueId: paymentDetails.transactionId,
                    masterLoanId
                }, { transaction: t })
        
                for (let index = 0; index < transactionDetails.length; index++) {
                    const element = transactionDetails[index];
                    element.customerLoanTransactionId = transaction.id
                }
        
                for (let index = 0; index < transactionDetails.length; index++) {
        
                    let customerLoanTransactionDetails = await models.customerTransactionDetail.create(transactionDetails[index], { transaction: t })
        
                    let referenceId = `${transactionDetails[index].loanUniqueId}-${customerLoanTransactionDetails.id}`
                    let description = "part payment for customer loan"
                    
                    let id = await models.customerTransactionDetail.update({ referenceId ,description}, {
                        where: { id: customerLoanTransactionDetails.id }, transaction: t
                    })
                }
        
                let secure = await models.customerLoanInterest.bulkCreate(securedLoanDetails, {
                    updateOnDuplicate: ['emiStatus', 'outstandingInterest', 'paidAmount', 'penalOutstanding', 'penalPaid', 'emiReceivedDate']
                }, { transaction: t })
        
                if (unsecuredLoanDetails) {
        
                    let unsecure = await models.customerLoanInterest.bulkCreate(unsecuredLoanDetails, {
                        updateOnDuplicate: ['emiStatus', 'outstandingInterest', 'paidAmount', 'penalOutstanding', 'penalPaid', 'emiReceivedDate']
                    }, { transaction: t })
        
                }
        
                // penal date change
                // if (penalDate) {
                //     await models.customerLoan.update({ penalInterestLastReceivedDate: penalDate.securedPenalData.securedPenalDate }, { where: { id: penalDate.securedPenalData.loanId }, transaction: t })
                //     if (penalDate.unsecuredPenalData) {
                //         await models.customerLoan.update({ penalInterestLastReceivedDate: penalDate.unsecuredPenalData.unsecuredPenalDate }, { where: { id: penalDate.unsecuredPenalData.loanId }, transaction: t })
                //     }
                // }
                //penal date change
        
            })
        return res.status(200).json({ message:"success" });
    }

}