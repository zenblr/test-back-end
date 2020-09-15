const models = require("../../models");
const sequelize = models.sequelize;

const Sequelize = models.Sequelize;
const Op = Sequelize.Op;
const { createReferenceCode } = require("../../utils/referenceCode");
var uniqid = require('uniqid');

const request = require("request");
const moment = require("moment");
const CONSTANT = require("../../utils/constant");
const _ = require('lodash');
const check = require("../../lib/checkLib");
const { paginationWithFromTo } = require("../../utils/pagination");
let sms = require('../../utils/sendSMS');
let { checkPaidInterest, getCustomerInterestAmount, newSlabRateInterestCalcultaion, getAmountLoanSplitUpData, payableAmountForLoan, customerLoanDetailsByMasterLoanDetails, allInterestPayment, getAllNotPaidInterest, getAllInterestLessThanDate, getPendingNoOfDaysInterest, getTransactionPrincipalAmount, calculationDataOneLoan, splitAmountIntoSecuredAndUnsecured,intrestCalculationForSelectedLoanWithOutT,penalInterestCalculationForSelectedLoan } = require('../../utils/loanFunction')
const razorpay = require('../../utils/razorpay');
let crypto = require('crypto');

exports.getInterestInfo = async (req, res, next) => {
    let { loanId, masterLoanId } = req.query;

    let interestInfo = await customerLoanDetailsByMasterLoanDetails(masterLoanId);

    let lastPayment = await models.customerLoanTransaction.findAll({
        where: { masterLoanId: masterLoanId, depositStatus: "Completed", paymentFor: 'partPayment' },
        order: [
            ['id', 'asc']
        ]
    })
    let lastPaymentDate = null

    if (lastPayment.length != 0) {
        lastPaymentDate = lastPayment[lastPayment.length - 1].depositDate
    }

    interestInfo.loan.dataValues.lastPaymentDate = lastPaymentDate

    return res.status(200).json({ message: "success", data: interestInfo })

}

exports.viewLog = async (req, res, next) => {
    let { loanId, masterLoanId } = req.query;

    let logs = await models.customerLoanTransaction.findAll({
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
    return res.status(200).json({ message: "success", data: logs })


}

exports.checkPartAmount = async (req, res, next) => {
    let { paidAmount, masterLoanId } = req.body

    let amount = await getCustomerInterestAmount(masterLoanId);
    let loan = await customerLoanDetailsByMasterLoanDetails(masterLoanId);
    let data = await payableAmountForLoan(amount, loan.loan)

    if (data.payableAmount > paidAmount) {
        return res.status(400).json({ message: `Your payable amount is greater than paid amount. You have to pay ${data.payableAmount}` })
    }

    let partPaymentAmount = Number(paidAmount) - Number(data.payableAmount)
    data.partPaymentAmount = (partPaymentAmount.toFixed(2))
    data.paidAmount = paidAmount
    data.loanDetails = loan.loan
    let { securedRatio, unsecuredRatio, isUnsecuredSchemeApplied } = await getAmountLoanSplitUpData(loan.loan, amount, paidAmount);

    data.securedRatio = (securedRatio.toFixed(2))
    if (isUnsecuredSchemeApplied) {
        data.unsecuredRatio = (unsecuredRatio.toFixed(2))

    }


    return res.status(200).json({ data })
}

//CALCULATE PAYABLE AMOUNT
exports.payableAmountConfirmPartPayment = async (req, res, next) => {
    let { masterLoanId, paidAmount } = req.body
    let amount = await getCustomerInterestAmount(masterLoanId);
    let { loan } = await customerLoanDetailsByMasterLoanDetails(masterLoanId)
    let { payableAmount, securedPenalInterest, unsecuredPenalInterest, securedInterest, unsecuredInterest } = await payableAmountForLoan(amount, loan)
    let partPaymentAmount = paidAmount - payableAmount
    if (payableAmount > paidAmount) {
        return res.status(400).json({ message: `Your payable amount is greater than paid amount. You have to pay ${payableAmount}` })
    }

    let { securedRatio, unsecuredRatio } = await getAmountLoanSplitUpData(loan, amount, paidAmount)
    loan.dataValues.customerLoan[0].dataValues.partPayment = (securedRatio - securedInterest - securedPenalInterest).toFixed(2)

    if (loan.isUnsecuredSchemeApplied) {
        loan.dataValues.customerLoan[1].dataValues.partPayment = (unsecuredRatio - unsecuredInterest - unsecuredPenalInterest).toFixed(2)
    }

    return res.status(200).json({ data: loan });
}


exports.partPayment = async (req, res, next) => {
    let { masterLoanId, paidAmount, paymentDetails, transactionDetails } = req.body
    let { bankName, branchName, chequeNumber, depositDate, depositTransactionId, paymentType, transactionId } = paymentDetails
    let createdBy = req.userData.id
    let amount = await getCustomerInterestAmount(masterLoanId);
    let { loan } = await customerLoanDetailsByMasterLoanDetails(masterLoanId);
    let { payableAmount, securedPenalInterest, unsecuredPenalInterest, securedInterest, unsecuredInterest } = await payableAmountForLoan(amount, loan)

    if (payableAmount > paidAmount) {
        return res.status(400).json({ message: `Your payable amount is greater than paid amount. You have to pay ${payableAmount}` })
    }

    let transactionUniqueId = uniqid.time().toUpperCase();

    if (!['cash', 'IMPS', 'NEFT', 'RTGS', 'cheque', 'UPI', 'gateway'].includes(paymentType)) {
        return res.status(400).json({ message: "Invalid payment type" })
    }
    let signatureVerification = false;
    let razorPayTransactionId;
    let isRazorPay = false;
    if (paymentType == 'gateway') {
        let razerpayData = await razorpay.instance.orders.fetch(transactionDetails.razorpay_order_id);
        transactionUniqueId = razerpayData.receipt;
        const generated_signature = crypto
            .createHmac(
                "SHA256",
                razorpay.razorPayConfig.key_secret
            )
            .update(transactionDetails.razorpay_order_id + "|" + transactionDetails.razorpay_payment_id)
            .digest("hex");
        if (generated_signature == transactionDetails.razorpay_signature) {
            signatureVerification = true;
            isRazorPay = true;
            razorPayTransactionId = transactionDetails.razorpay_order_id;
        }
        if (signatureVerification == false) {
            return res.status(422).json({ message: "razorpay payment verification failed" });
        }
    }

    let partPaymentAmount = paidAmount - payableAmount
    if (payableAmount > paidAmount) {
        return res.status(400).json({ message: `Your payable amount is greater than paid amount. You have to pay ${payableAmount}` })
    }
    let { securedRatio, unsecuredRatio, isUnsecuredSchemeApplied } = await getAmountLoanSplitUpData(loan, amount, paidAmount)

    paymentDetails.masterLoanId = masterLoanId
    paymentDetails.transactionAmont = paidAmount
    paymentDetails.depositDate = moment(depositDate).utcOffset("+05:30").format("YYYY-MM-DD");
    paymentDetails.transactionUniqueId = transactionUniqueId //ye chanege hoyega
    if (isRazorPay) {
        paymentDetails.razorPayTransactionId = razorPayTransactionId
    }
    paymentDetails.bankTransactionUniqueId = transactionId
    paymentDetails.depositStatus = "Pending"
    paymentDetails.paymentFor = 'partPayment'

    let securedPayableOutstanding = (Number(securedRatio - securedInterest - securedPenalInterest)).toFixed(2)
    let unsecuredPayableOutstanding = 0
    if (isUnsecuredSchemeApplied) {
        unsecuredPayableOutstanding = (Number(unsecuredRatio - unsecuredInterest - unsecuredPenalInterest)).toFixed(2)
    }


    let data = await sequelize.transaction(async t => {
        let customerLoanTransaction = await models.customerLoanTransaction.create(paymentDetails, { transaction: t })

        await models.customerTransactionSplitUp.create({
            customerLoanTransactionId: customerLoanTransaction.id,
            loanId: loan.customerLoan[0].id,
            masterLoanId: masterLoanId,
            payableOutstanding: securedPayableOutstanding,
            penal: securedPenalInterest,
            interest: securedInterest,
            isSecured: true,
            loanOutstanding: Number(loan.customerLoan[0].outstandingAmount) - Number(securedPayableOutstanding)
        }, { transaction: t })

        if (isUnsecuredSchemeApplied) {
            await models.customerTransactionSplitUp.create({
                customerLoanTransactionId: customerLoanTransaction.id,
                loanId: loan.customerLoan[1].id,
                masterLoanId: masterLoanId,
                payableOutstanding: unsecuredPayableOutstanding,
                penal: unsecuredPenalInterest,
                interest: unsecuredInterest,
                isSecured: false,
                loanOutstanding: Number(loan.customerLoan[1].outstandingAmount) - Number(unsecuredPayableOutstanding)
            }, { transaction: t })
        }

        return customerLoanTransaction
    })

    return res.status(200).json({ message: 'success' })
}

exports.confirmPartPaymentTranscation = async (req, res, next) => {

    let modifiedBy = req.userData.id
    let { transactionId, status, paymentReceivedDate, masterLoanId, depositAmount } = req.body;

    let transactionDetail = await models.customerLoanTransaction.findOne({ where: { id: transactionId } })

    if (transactionDetail.depositStatus == "Completed" || transactionDetail.depositStatus == "Rejected") {
        return res.status(400).json({ message: `You can not change the status from this stage.` })
    }

    if (status == "Rejected") {
        await models.customerLoanTransaction.update({ depositStatus: status }, { where: { id: transactionId } });
    }
    if (status == "Pending") {
        await models.customerLoanTransaction.update({ depositStatus: status }, { where: { id: transactionId } });
    }

    if (status == 'Completed') {

        let { loan } = await customerLoanDetailsByMasterLoanDetails(masterLoanId);

        let receivedDate = moment(paymentReceivedDate).format('YYYY-MM-DD')
        let todaysDate = moment(new Date()).format('YYYY-MM-DD')

        // let payment = await allInterestPayment(transactionId);
        let { securedPayableOutstanding, unSecuredPayableOutstanding, transactionDataSecured, transactionDataUnSecured, securedOutstandingAmount, unSecuredOutstandingAmount, outstandingAmount, securedLoanUniqueId, unSecuredLoanUniqueId } = await getTransactionPrincipalAmount(transactionId);

        let quickPayData = await sequelize.transaction(async (t) => {

            let loanIds = loan.customerLoan.map(ele => ele.id)
            if (receivedDate != todaysDate) {
                var a = moment(receivedDate);
                var b = moment(todaysDate);
                let difference = a.diff(b, 'days')
                var { newEmiTable, currentSlabRate, securedInterest, unsecuredInterest } = await stepDown(receivedDate, loan, difference)
                console.log(newEmiTable)
                if (newEmiTable.length > 0) {
                    for (let stepDownIndex = 0; stepDownIndex < newEmiTable.length; stepDownIndex++) {
                        const element = newEmiTable[stepDownIndex];

                        let c = await models.customerLoanInterest.update({ interestRate: element.interestRate },
                            { where: { id: element.id } })
                    }
                }

                let d = await models.customerLoan.update({ currentSlab: currentSlabRate, currentInterestRate: securedInterest },
                    { where: { id: loan.customerLoan[0].id } })

                if (loan.customerLoan.length > 1) {
                    await models.customerLoan.update({ currentSlab: currentSlabRate, currentInterestRate: unsecuredInterest },
                        { where: { id: loan.customerLoan[1].id } })
                }
            }

            await intrestCalculationForSelectedLoanWithOutT(receivedDate, loan.id,securedInterest, unsecuredInterest,currentSlabRate)
            await penalInterestCalculationForSelectedLoan(receivedDate, loan.id) // right
            let amount = await getCustomerInterestAmount(masterLoanId);

            let newLoan = await customerLoanDetailsByMasterLoanDetails(masterLoanId);

            let { penalInterest } = await payableAmountForLoan(amount, newLoan.loan)
            let splitUpAmount = depositAmount - penalInterest
            let penalInterestRatio;
            if (splitUpAmount <= 0) {
                penalInterestRatio = await getAmountLoanSplitUpData(newLoan.loan, amount, depositAmount)
                splitUpAmount = 0
            }


            let data = await getAmountLoanSplitUpData(loan, amount, splitUpAmount);
            let { isUnsecuredSchemeApplied, securedRatio, unsecuredRatio, securedLoanId, unsecuredLoanId } = data

            let securedPenalInterest = 0;
            let unsecuredPenalInterest = 0;
            if (splitUpAmount <= 0) {
                securedPenalInterest = penalInterestRatio.securedRatio
                unsecuredPenalInterest = penalInterestRatio.unsecuredRatio
            } else {
                securedPenalInterest = data.securedPenalInterest
                unsecuredPenalInterest = data.unsecuredPenalInterest
            }

            await models.customerTransactionSplitUp.create({
                customerLoanTransactionId: transactionId,
                loanId: securedLoanId,
                masterLoanId: masterLoanId,
                penal: securedPenalInterest.toFixed(2),
                interest: securedRatio,
                isSecured: true
            }, { transaction: t })

            if (isUnsecuredSchemeApplied) {
                await models.customerTransactionSplitUp.create({
                    customerLoanTransactionId: transactionId,
                    loanId: unsecuredLoanId,
                    masterLoanId: masterLoanId,
                    penal: unsecuredPenalInterest.toFixed(2),
                    interest: unsecuredRatio,
                    isSecured: false
                }, { transaction: t })
            }

        let payment = await allInterestPayment(transactionId);


            await models.customerLoanTransaction.update({ depositStatus: status, paymentReceivedDate: receivedDate }, { where: { id: transactionId }, transaction: t });

            if (payment.securedLoanDetails) {
                for (const interest of payment.securedLoanDetails) {
                    await models.customerLoanInterest.update({ paidAmount: interest.paidAmount, interestAccrual: interest.interestAccrual, outstandingInterest: interest.outstandingInterest, emiReceivedDate: receivedDate, penalAccrual: interest.penalAccrual, penalOutstanding: interest.penalOutstanding, penalPaid: interest.penalPaid, modifiedBy, emiStatus: interest.emiStatus }, { where: { id: interest.id }, transaction: t });
                }
            }
            if (payment.unsecuredLoanDetails) {
                for (const interest of payment.unsecuredLoanDetails) {
                    await models.customerLoanInterest.update({ paidAmount: interest.paidAmount, interestAccrual: interest.interestAccrual, outstandingInterest: interest.outstandingInterest, emiReceivedDate: receivedDate, penalAccrual: interest.penalAccrual, penalOutstanding: interest.penalOutstanding, penalPaid: interest.penalPaid, modifiedBy, emiStatus: interest.emiStatus }, { where: { id: interest.id }, transaction: t });
                }
            }
            //update in transaction
            if (payment.transactionDetails) {
                for (const amount of payment.transactionDetails) {
                    if (amount.isPenalInterest) {
                        //debit
                        let checkDebitEntry = await models.customerTransactionDetail.findAll({ where: { masterLoanId: amount.masterLoanId, loanId: amount.loanId, loanInterestId: amount.loanInterestId, isPenalInterest: true } });
                        if (checkDebitEntry.length == 0) {
                            let debit = await models.customerTransactionDetail.create({ masterLoanId: amount.masterLoanId, loanId: amount.loanId, loanInterestId: amount.loanInterestId, isPenalInterest: true, debit: amount.penalInterest, description: `Penal interest` }, { transaction: t });
                            await models.customerTransactionDetail.update({ referenceId: `${amount.loanUniqueId}-${debit.id}` }, { where: { id: debit.id }, transaction: t });
                        } else {
                            let debitedAmount = await checkDebitEntry.map((data) => Number(data.debit));
                            let totalDebitedAmount = _.sum(debitedAmount);
                            let newDebitAmount = amount.penalInterest - totalDebitedAmount;
                            if (newDebitAmount > 0) {
                                let debit = await models.customerTransactionDetail.create({ masterLoanId: amount.masterLoanId, loanId: amount.loanId, loanInterestId: amount.loanInterestId, isPenalInterest: true, debit: newDebitAmount, description: `Penal interest` }, { transaction: t });
                                await models.customerTransactionDetail.update({ referenceId: `${amount.loanUniqueId}-${debit.id}` }, { where: { id: debit.id }, transaction: t });
                            }
                        }
                        //credit
                        let description = "penal interest Received"
                        let paid = await models.customerTransactionDetail.create({ customerLoanTransactionId: transactionId, masterLoanId: amount.masterLoanId, loanId: amount.loanId, isPenalInterest: amount.isPenalInterest, credit: amount.credit, description: description, paymentDate: receivedDate }, { transaction: t });
                        await models.customerTransactionDetail.update({ referenceId: `${amount.loanUniqueId}-${paid.id}` }, { where: { id: paid.id }, transaction: t });
                    } else {
                        if (amount.isExtraDaysInterest) {
                            //debit
                            let checkDebitEntry = await models.customerTransactionDetail.findAll({ where: { masterLoanId: amount.masterLoanId, loanId: amount.loanId, loanInterestId: amount.loanInterestId, isPenalInterest: false } });
                            if (checkDebitEntry.length == 0) {
                                let debit = await models.customerTransactionDetail.create({ masterLoanId: amount.masterLoanId, loanId: amount.loanId, loanInterestId: amount.loanInterestId, debit: amount.interestAmount, description: `Extra days interest` }, { transaction: t });
                                await models.customerTransactionDetail.update({ referenceId: `${amount.loanUniqueId}-${debit.id}` }, { where: { id: debit.id }, transaction: t });
                            } else {
                                let debitedAmount = await checkDebitEntry.map((data) => Number(data.debit));
                                let totalDebitedAmount = _.sum(debitedAmount);
                                let newDebitAmount = amount.interestAmount - totalDebitedAmount;
                                if (newDebitAmount > 0) {
                                    let debit = await models.customerTransactionDetail.create({ masterLoanId: amount.masterLoanId, loanId: amount.loanId, loanInterestId: amount.loanInterestId, debit: newDebitAmount, description: `Extra days interest` }, { transaction: t });
                                    await models.customerTransactionDetail.update({ referenceId: `${amount.loanUniqueId}-${debit.id}` }, { where: { id: debit.id }, transaction: t });
                                }
                            }
                            //credit
                            let paid = await models.customerTransactionDetail.create({ customerLoanTransactionId: transactionId, masterLoanId: amount.masterLoanId, loanId: amount.loanId, credit: amount.credit, description: `Extra days interest received`, paymentDate: receivedDate, }, { transaction: t });
                            await models.customerTransactionDetail.update({ referenceId: `${amount.loanUniqueId}-${paid.id}` }, { where: { id: paid.id }, transaction: t });
                        } else {
                            let paid = await models.customerTransactionDetail.create({ customerLoanTransactionId: transactionId, masterLoanId: amount.masterLoanId, loanId: amount.loanId, credit: amount.credit, description: `interest received ${amount.emiDueDate}`,loanInterestId:amount.loanInterestId, paymentDate: moment(), }, { transaction: t });
                            await models.customerTransactionDetail.update({ referenceId: `${amount.loanUniqueId}-${paid.id}` }, { where: { id: paid.id }, transaction: t });
                        }

                    }
                }
            }

            //credit part release ornament amount
            let securedTransaction = await models.customerTransactionDetail.create({ masterLoanId: masterLoanId, customerLoanTransactionId: transactionId, loanId: transactionDataSecured.loanId, credit: securedPayableOutstanding, paymentDate:receivedDate, description: "part payment for customer loan" }, { transaction: t });
            await models.customerTransactionDetail.update({ referenceId: `${securedLoanUniqueId}-${securedTransaction.id}` }, { where: { id: securedTransaction.id }, transaction: t })
            if (transactionDataUnSecured) {
                let unSecuredTransaction = await models.customerTransactionDetail.create({ masterLoanId: masterLoanId, customerLoanTransactionId: transactionId, loanId: transactionDataUnSecured.loanId, credit: unSecuredPayableOutstanding, paymentDate:receivedDate, description: "part payment for customer loan" }, { transaction: t });
                await models.customerTransactionDetail.update({ referenceId: `${unSecuredLoanUniqueId}-${unSecuredTransaction.id}` }, { where: { id: unSecuredTransaction.id }, transaction: t })
            }

            let x = await models.customerLoan.update({ outstandingAmount: securedOutstandingAmount }, { where: { id: transactionDataSecured.loanId }, transaction: t });

            if (transactionDataUnSecured) {
                let y = await models.customerLoan.update({ outstandingAmount: unSecuredOutstandingAmount }, { where: { id: transactionDataUnSecured.loanId }, transaction: t });
            }
            let z = await models.customerLoanMaster.update({ outstandingAmount: outstandingAmount }, { where: { id: masterLoanId }, transaction: t });
            let loanOf = await models.customerLoanMaster.findOne({ where: { id: masterLoanId } })

            // interest calculation after part payment
            // let updateInterestAftertOutstandingAmount = async (date, masterLoanId) => {
            let loanData = await calculationDataOneLoan(masterLoanId);
            let loanInfo = loanData.loanInfo;
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
                let outstandingAmount
                if (loan.loanType == 'secured') {
                    outstandingAmount = securedOutstandingAmount
                } else {
                    outstandingAmount = unSecuredOutstandingAmount

                }
                let interest = await newSlabRateInterestCalcultaion(outstandingAmount, loan.currentInterestRate, loan.selectedSlab, loan.masterLoan.tenure);
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

            await penalInterestCalculationForSelectedLoan(moment(), loan.id) // right


        })
        // let interest = await updateInterestAftertOutstandingAmount(moment(),masterLoanId)

    }
    return res.status(200).json({ message: "success" });

}