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
let { checkPaidInterest, getCustomerInterestAmount, newSlabRateInterestCalcultaion, getAmountLoanSplitUpData, payableAmountForLoan, customerLoanDetailsByMasterLoanDetails, allInterestPayment, getAllNotPaidInterest, getAllInterestLessThanDate, getPendingNoOfDaysInterest,getTransactionPrincipalAmount,calculationDataOneLoan } = require('../../utils/loanFunction')


exports.getInterestInfo = async (req, res, next) => {
    let { loanId, masterLoanId } = req.query;

    let interestInfo = await models.customerLoanTransaction.findAll({
        where: { masterLoanId: masterLoanId, depositStatus: 'Completed', paymentFor: 'partPayment' },
        order: [
            [
                [{ model: models.customerTransactionSplitUp, as: 'transactionSplitUp' }, 'loanId', 'asc']
            ]
        ],
        include: [
            {
                model: models.customerTransactionSplitUp,
                as: 'transactionSplitUp',
                include: [
                    {
                        model: models.customerLoan,
                        as: 'customerLoan',
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
        return res.status(400).json({ message: `Your payable amount is greater than paid amount. You have to pay ${payableAmount}` })
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

exports.confirmPartPaymentTranscation = async (req, res, next) => {

    let modifiedBy = req.userData.id
    let { transactionId, status, masterLoanId } = req.body;

    if (status == 'approved') {



        let payment = await allInterestPayment(transactionId);
        let { securedPayableOutstanding, unSecuredPayableOutstanding, transactionDataSecured, transactionDataUnSecured, securedOutstandingAmount, unSecuredOutstandingAmount, outstandingAmount, securedLoanUniqueId, unSecuredLoanUniqueId } = await getTransactionPrincipalAmount(transactionId);

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
                        let paid = await models.customerTransactionDetail.create({ masterLoanId: amount.masterLoanId, loanId: amount.loanId, isPenalInterest: amount.isPenalInterest, description: description, credit: amount.credit, paymentDate: moment() }, { transaction: t });
                        await models.customerTransactionDetail.update({ referenceId: `${amount.loanUniqueId}-${paid.id}` }, { where: { id: paid.id }, transaction: t });
                    } else {
                        let description = "interest for customer loan"
                        let paid = await models.customerTransactionDetail.create({ masterLoanId: amount.masterLoanId, loanId: amount.loanId, description: description, credit: amount.credit, paymentDate: moment() }, { transaction: t });
                        await models.customerTransactionDetail.update({ referenceId: `${amount.loanUniqueId}-${paid.id}` }, { where: { id: paid.id }, transaction: t });
                    }
                }
            }
            //credit part release ornament amount
            let securedTransaction = await models.customerTransactionDetail.create({ masterLoanId: masterLoanId, customerLoanTransactionId: transactionId, loanId: transactionDataSecured.loanId, credit: securedPayableOutstanding, paymentDate: moment(), description: "part payment for customer loan" }, { transaction: t });
            await models.customerTransactionDetail.update({ referenceId: `${securedLoanUniqueId}-${securedTransaction.id}` }, { where: { id: securedTransaction.id }, transaction: t })
            if (transactionDataUnSecured) {
                let unSecuredTransaction = await models.customerTransactionDetail.create({ masterLoanId: masterLoanId, customerLoanTransactionId: transactionId, loanId: transactionDataUnSecured.loanId, credit: unSecuredPayableOutstanding, paymentDate: moment(), description: "part payment for customer loan" }, { transaction: t });
                await models.customerTransactionDetail.update({ referenceId: `${unSecuredLoanUniqueId}-${unSecuredTransaction.id}` }, { where: { id: unSecuredTransaction.id }, transaction: t })
            }
            await models.customerLoanTransaction.update({ depositStatus: "Completed", paymentReceivedDate: moment() }, { where: { id: transactionId }, transaction: t });
            await models.customerLoan.update({ outstandingAmount: securedOutstandingAmount }, { where: { id: transactionDataSecured.loanId }, transaction: t });
            if (transactionDataUnSecured) {
                await models.customerLoan.update({ outstandingAmount: unSecuredOutstandingAmount }, { where: { id: transactionDataUnSecured.loanId }, transaction: t });
            }
            await models.customerLoanMaster.update({ outstandingAmount: outstandingAmount }, { where: { id: masterLoanId }, transaction: t });


            // interest calculation after part payment
            // let updateInterestAftertOutstandingAmount = async (date, masterLoanId) => {
            let data = await calculationDataOneLoan(masterLoanId);
            let loanInfo = data.loanInfo;
            let currentDate = moment();
            let date = moment()
            let noOfDays = 0;
            // await sequelize.transaction(async t => {
            for (const loan of loanInfo) {
                let lastPaidEmi = await checkPaidInterest(loan.id, loan.masterLoanId);
                let loanStartDate;
                if (!lastPaidEmi) {
                    loanStartDate = moment(loan.masterLoan.loanStartDate);
                    noOfDays = currentDate.diff(loanStartDate, 'days');
                } else {
                    loanStartDate = moment(lastPaidEmi.emiDueDate);
                    noOfDays = currentDate.diff(loanStartDate, 'days');
                }
                let interest = await newSlabRateInterestCalcultaion(loan.outstandingAmount, loan.currentInterestRate, loan.selectedSlab, loan.masterLoan.tenure);
                let allInterest = await getAllNotPaidInterest(loan.id)//get all interest
                let interestLessThanDate = await getAllInterestLessThanDate(loan.id, date);
                //update interestAccrual & interest amount
                for (const interestData of interestLessThanDate) {
                    let outstandingInterest = interest.amount - interestData.paidAmount;
                    let interestAccrual = interest.amount - interestData.paidAmount;
                    await models.customerLoanInterest.update({ interestAmount: interest.amount, outstandingInterest, interestAccrual }, { where: { id: interestData.id, emiStatus: { [Op.notIn]: ['paid'] } }, transaction: t });
                }
                if (allInterest.length != interestLessThanDate.length) {
                    let pendingNoOfDays = noOfDays - (interestLessThanDate.length * loan.selectedSlab);
                    if (pendingNoOfDays > 0) {
                        let oneDayInterest = loan.currentInterestRate / 30;
                        let oneDayAmount = loan.outstandingAmount * (oneDayInterest / 100);
                        let pendingDaysAmount = pendingNoOfDays * oneDayAmount;
                        let nextInterest = await getPendingNoOfDaysInterest(loan.id, date);
                        if (nextInterest) {
                            let amount = pendingDaysAmount - nextInterest.paidAmount;
                            await models.customerLoanInterest.update({ interestAccrual: amount, outstandingInterest: amount }, { where: { id: nextInterest.id, emiStatus: { [Op.notIn]: ['paid'] } }, transaction: t });
                        }
                    }
                }
                //update all interest amount
                for (const interestData of allInterest) {
                    let outstandingInterest = interest.amount - interestData.paidAmount;
                    await models.customerLoanInterest.update({ interestAmount: interest.amount, outstandingInterest }, { where: { id: interestData.id, emiStatus: { [Op.notIn]: ['paid'] } }, transaction: t });
                }
                //update last interest if changed
                if (!Number.isInteger(interest.length)) {
                    let oneMonthAmount = interest.amount / (loan.selectedSlab / 30);
                    let amount = oneMonthAmount * Math.ceil(interest.length).toFixed(2);
                    let lastInterest = await getLastInterest(loan.id, loan.masterLoanId)
                    let outstandingInterest = amount - lastInterest.paidAmount;
                    await models.customerLoanInterest.update({ interestAmount: amount, outstandingInterest }, { where: { id: lastInterest.id, emiStatus: { [Op.notIn]: ['paid'] } }, transaction: t });
                }
            }
            // });
            // return noOfDays;



        })
        // let interest = await updateInterestAftertOutstandingAmount(moment(),masterLoanId)

        return res.status(200).json({ message: "success" });
    }

}