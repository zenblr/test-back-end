const models = require("../../models");
const sequelize = models.sequelize;

const Sequelize = models.Sequelize;
const Op = Sequelize.Op;
const { createReferenceCode } = require("../../utils/referenceCode");
var uniqid = require('uniqid');
const getRazorPayDetails = require('../../utils/razorpay');
const request = require("request");
const moment = require("moment");
const CONSTANT = require("../../utils/constant");
const _ = require('lodash');
const check = require("../../lib/checkLib");
const { paginationWithFromTo } = require("../../utils/pagination");
let sms = require('../../utils/sendSMS');
let { checkPaidInterest, getCustomerInterestAmount, newSlabRateInterestCalcultaion,
    getLastInterest, getAmountLoanSplitUpData, payableAmountForLoan, customerLoanDetailsByMasterLoanDetails, allInterestPayment, getAllNotPaidInterest, getAllInterestLessThanDate, getPendingNoOfDaysInterest, getTransactionPrincipalAmount, calculationDataOneLoan, splitAmountIntoSecuredAndUnsecured, intrestCalculationForSelectedLoanWithOutT, penalInterestCalculationForSelectedLoan, stepDown, penalInterestCalculationForSelectedLoanWithOutT, customerNameNumberLoanId, getFirstInterestToPay, getStepUpslab, nextDueDateInterest, getAllInterest, partPaymnetSettlement,calculateInterestForParticularDueDate } = require('../../utils/loanFunction')
let crypto = require('crypto');
const qs = require('qs');

let { sendPaymentMessage } = require('../../utils/SMS');

exports.getInterestInfo = async (req, res, next) => {
    let { loanId, masterLoanId } = req.query;

    let interestInfo = await customerLoanDetailsByMasterLoanDetails(masterLoanId);

    let amount = await getCustomerInterestAmount(masterLoanId);

    let interest = await nextDueDateInterest(interestInfo.loan);

    let data = await payableAmountForLoan(amount, interestInfo.loan)

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

    let nextDueDate = null



    nextDueDate = await models.customerLoanInterest.findOne({

        where: {
            emiDueDate: { [Op.gte]: moment().format('YYYY-MM-DD') },
            masterLoanId: masterLoanId,
            emiStatus: { [Op.not]: 'paid' }
        },
        attributes: ['emiDueDate', 'emiStatus'],
        order: [['id', 'asc']]
    })

    // if (lastPayment.length != 0) {
    //     lastPaymentDate = lastPayment[lastPayment.length - 1].depositDate
    // }
    if (nextDueDate) {
        interestInfo.loan.dataValues.nextDueDate = nextDueDate.emiDueDate
        interestInfo.loan.dataValues.status = nextDueDate.emiStatus
    } else {
        interestInfo.loan.dataValues.nextDueDate = nextDueDate
        interestInfo.loan.dataValues.status = nextDueDate


    }

    interestInfo.loan.dataValues.lastPaymentDate = lastPaymentDate
    amount.unsecuredTotalInterest = interest.unsecuredTotalInterest
    amount.securedTotalInterest = interest.securedTotalInterest
    amount.securedRebate = interest.securedRebate
    amount.unsecuredRebate = interest.unsecuredRebate
    amount.minimumAmount = data.payableAmount


    return res.status(200).json({ message: "Success", data: { loan: interestInfo.loan, amount } })

}

exports.viewLog = async (req, res, next) => {
    let { loanId, masterLoanId } = req.query;

    let logs = await models.customerLoanTransaction.findAll({
        where: { masterLoanId: masterLoanId, paymentFor: 'partPayment' },
        order: [
            [
                [{ model: models.customerTransactionSplitUp, as: 'transactionSplitUp' }, 'loanId', 'asc']
            ]
        ],
        include: [
            {
                model: models.customerLoanMaster,
                as: 'masterLoan',
                attributes: ['id'],
                include: [{
                    model: models.customerLoan,
                    as: 'customerLoan',
                    attributes: ['loanUniqueId', 'loanAmount']
                }]
            },
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
    return res.status(200).json({ message: "Success", data: logs })


}

exports.checkPartAmount = async (req, res, next) => {
    let { paidAmount, masterLoanId } = req.body

    let amount = await getCustomerInterestAmount(masterLoanId);
    let loan = await customerLoanDetailsByMasterLoanDetails(masterLoanId);
    let data = await payableAmountForLoan(amount, loan.loan)

    if (data.payableAmount > paidAmount) {
        return res.status(400).json({ message: `Your payable amount is greater than paid amount. You have to pay ${data.payableAmount}` })
    }

    if ((Number(data.payableAmount) + Number(loan.loan.outstandingAmount)) < paidAmount) {
        return res.status(400).json({ message: `Your payable amount is greater than outstanding amount` })
    }

    let partPaymentAmount = Number(paidAmount) - Number(data.payableAmount)
    data.partPaymentAmount = (partPaymentAmount.toFixed(2))
    data.paidAmount = paidAmount
    data.loanDetails = loan.loan
    let { securedRatio, unsecuredRatio, isUnsecuredSchemeApplied,securedInterest,unsecuredInterest } = await getAmountLoanSplitUpData(loan.loan, amount, paidAmount);

    data.securedRatio = (securedRatio-securedInterest).toFixed(2)
    data.newSecuredOutstanding = (data.securedOutstandingAmount - data.securedRatio).toFixed(2)
    if (isUnsecuredSchemeApplied) {
        data.unsecuredRatio = (unsecuredRatio-unsecuredInterest).toFixed(2)
        data.newUnSecuredOutstanding = (data.unsecuredOutstandingAmount - data.unsecuredRatio).toFixed(2)

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
    let { masterLoanId, paidAmount, paymentDetails, transactionDetails, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    try {
        // let createdBy = req.userData.id;
        let isAdmin
        let modifiedBy = null;
        const razorpay = await getRazorPayDetails();
        if (razorpay_order_id) {
            var tempRazorData = await models.tempRazorPayDetails.findOne({ where: { razorPayOrderId: razorpay_order_id } })
            depositDate = tempRazorData.depositDate
            masterLoanId = tempRazorData.masterLoanId
            paymentType = tempRazorData.paymentType
            paidAmount = tempRazorData.amount
            transactionId = tempRazorData.transactionUniqueId
        } else {
            var { bankName, branchName, chequeNumber, depositDate, depositTransactionId, paymentType, transactionId } = paymentDetails

        }
        let amount = await getCustomerInterestAmount(masterLoanId);
        let { loan } = await customerLoanDetailsByMasterLoanDetails(masterLoanId);
        let { payableAmount, securedPenalInterest, unsecuredPenalInterest, securedInterest, unsecuredInterest } = await payableAmountForLoan(amount, loan)

        if (payableAmount > paidAmount) {
            return res.status(400).json({ message: `Your payable amount is greater than paid amount. You have to pay ${payableAmount}` })
        }



        let transactionUniqueId = uniqid.time().toUpperCase();


        if (!['cash', 'IMPS', 'NEFT', 'RTGS', 'cheque', 'upi', 'card', 'netbanking', 'wallet'].includes(paymentType)) {
            return res.status(400).json({ message: "Invalid payment type" })
        }
        let signatureVerification = false;
        let razorPayTransactionId;
        let isRazorPay = false;
        if (paymentType == 'upi' || paymentType == 'netbanking' || paymentType == 'wallet' || paymentType == 'card') {
            let razerpayData
            if (razorpay_order_id) {
                isAdmin = false
                paymentDetails = {}
                transactionDetails = {}
                razerpayData = await razorpay.instance.orders.fetch(razorpay_order_id);
                transactionDetails.razorpay_order_id = razorpay_order_id
                transactionDetails.razorpay_payment_id = razorpay_payment_id
                transactionDetails.razorpay_signature = razorpay_signature

            } else {
                isAdmin = true
                razerpayData = await razorpay.instance.orders.fetch(transactionDetails.razorpay_order_id);
            }
            transactionUniqueId = razerpayData.receipt;
            const generated_signature = crypto
                .createHmac(
                    "SHA256",
                    razorpay.razorPayConfig.key_secret
                )
                .update(transactionDetails.razorpay_order_id + "|" + transactionDetails.razorpay_payment_id)
                .digest("hex");
            if (generated_signature == transactionDetails.razorpay_signature) {
                let loanData = await models.customerLoan.findOne({ where: { masterLoanId: masterLoanId }, order: [['id', 'asc']] });
                await models.axios({
                    method: 'PATCH',
                    url: `https://api.razorpay.com/v1/payments/${transactionDetails.razorpay_payment_id}`,
                    auth: {
                        username: razorpay.razorPayConfig.key_id,
                        password: razorpay.razorPayConfig.key_secret
                    },
                    data: qs.stringify({ notes: { transactionId: transactionUniqueId, product: "LOAN", loanId: loanData.loanUniqueId } })
                })
                signatureVerification = true;
                isRazorPay = true;
                razorPayTransactionId = transactionDetails.razorpay_order_id;
            }
            if (signatureVerification == false) {
                return res.status(422).json({ message: "razorpay payment verification failed" });
            }
        } else {
            isAdmin = true
        }

        let partPaymentAmount = paidAmount - payableAmount
        if (payableAmount > paidAmount) {
            return res.status(400).json({ message: `Your payable amount is greater than paid amount. You have to pay ${payableAmount}` })
        }
        let { securedRatio, unsecuredRatio, isUnsecuredSchemeApplied } = await getAmountLoanSplitUpData(loan, amount, paidAmount)
        paymentDetails.masterLoanId = masterLoanId
        paymentDetails.paymentType = paymentType
        paymentDetails.transactionAmont = paidAmount
        paymentDetails.depositDate = moment(moment(depositDate).format("YYYY-MM-DD"));
        paymentDetails.transactionUniqueId = transactionUniqueId

        if (isRazorPay) {

        } else {

        }

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
            let customerLoanTransaction
            if (isRazorPay) {
                await models.customerLoanTransaction.update(paymentDetails, { where: { razorPayTransactionId }, transaction: t });
                customerLoanTransaction = await models.customerLoanTransaction.findOne({ where: { razorPayTransactionId }, transaction: t })
            } else {

                customerLoanTransaction = await models.customerLoanTransaction.create(paymentDetails, { transaction: t });
            }
            //////razorPay
            if (isRazorPay) {
                //new loan
                let status = "Completed";
                let receivedDate = moment(depositDate).format("YYYY-MM-DD");
                let transactionId = customerLoanTransaction.id;
                let depositAmount = paidAmount;
                let newLoan = await models.customerLoanMaster.findOne({
                    where: { isActive: true, id: masterLoanId },
                    transaction: t,
                    order: [
                        [models.customerLoan, 'id', 'asc']
                    ],
                    include: [{
                        model: models.customerLoan,
                        as: 'customerLoan',
                        where: { isActive: true },
                        include: [
                            {
                                model: models.scheme,
                                as: 'scheme',
                                attributes: { exclude: ['createdAt', 'updatedAt', 'createdBy', 'modifiedBy', 'isActive'] },
                            }
                        ]
                    }]
                });

                let splitAmount = await payableAmountForLoan(amount, newLoan)
                let splitUpAmount = depositAmount - splitAmount.payableAmount


                let data = await getAmountLoanSplitUpData(newLoan, amount, splitUpAmount);
                let { isUnsecuredSchemeApplied, securedRatio, unsecuredRatio, securedLoanId, unsecuredLoanId } = data

                let securedPayableOutstanding = (Number(securedRatio)).toFixed(2)
                let securedLoanOutstanding = Number(newLoan.customerLoan[0].outstandingAmount) - Number(securedPayableOutstanding)
                let unsecuredPayableOutstanding = 0
                let unsecuredLoanOutstanding = 0
                if (isUnsecuredSchemeApplied) {
                    unsecuredPayableOutstanding = (Number(unsecuredRatio)).toFixed(2)
                    unsecuredLoanOutstanding = Number(newLoan.customerLoan[1].outstandingAmount) - Number(unsecuredPayableOutstanding)

                }

                let newTransactionSplitUp = []
                let securedTransactionSplit;
                let unsecuredTransactionSplit;
                securedTransactionSplit = await models.customerTransactionSplitUp.create({
                    customerLoanTransactionId: transactionId,
                    loanId: securedLoanId,
                    masterLoanId: masterLoanId,
                    payableOutstanding: securedPayableOutstanding,
                    penal: splitAmount.securedPenalInterest.toFixed(2),
                    loanOutstanding: securedLoanOutstanding,
                    interest: splitAmount.securedInterest,
                    isSecured: true
                }, { transaction: t })

                newTransactionSplitUp.push(securedTransactionSplit)

                if (isUnsecuredSchemeApplied) {
                    unsecuredTransactionSplit = await models.customerTransactionSplitUp.create({
                        customerLoanTransactionId: transactionId,
                        loanId: unsecuredLoanId,
                        masterLoanId: masterLoanId,
                        payableOutstanding: unsecuredPayableOutstanding,
                        penal: splitAmount.unsecuredPenalInterest.toFixed(2),
                        loanOutstanding: unsecuredLoanOutstanding,
                        interest: splitAmount.unsecuredInterest,
                        isSecured: false
                    }, { transaction: t })
                    newTransactionSplitUp.push(unsecuredTransactionSplit)
                }

                //payment adjustment

                let securedLoanDetails = await models.customerLoanInterest.findAll({
                    where: {
                        loanId: securedLoanId,
                        emiStatus: { [Op.in]: ['pending', 'partially paid'] }
                    },
                    transaction: t,
                    order: [['emiDueDate']],
                    include: {
                        model: models.customerLoan,
                        as: 'customerLoan',
                        attributes: ['loanUniqueId']
                    }
                })
                let unsecuredLoanDetails
                if (isUnsecuredSchemeApplied) {
                    unsecuredLoanDetails = await models.customerLoanInterest.findAll({
                        where: {
                            loanId: unsecuredLoanId,
                            emiStatus: { [Op.in]: ['pending', 'partially paid'] }
                        },
                        transaction: t,
                        order: [['emiDueDate']],
                        include: {
                            model: models.customerLoan,
                            as: 'customerLoan',
                            attributes: ['loanUniqueId']
                        }
                    })
                }
                let isInterestSettledFromQuickPay = false
                payment = await allInterestPayment(isInterestSettledFromQuickPay, transactionId, newTransactionSplitUp, securedLoanDetails, unsecuredLoanDetails, receivedDate);

                await models.customerLoanTransaction.update({ depositStatus: status, paymentReceivedDate: receivedDate }, { where: { id: transactionId }, transaction: t });
                if (razorpay_order_id)
                    await models.tempRazorPayDetails.update({ orderStatus: status }, {
                        where: { razorPayOrderId: razorpay_order_id }, transaction: t
                    });
                if (payment.securedLoanDetails) {
                    for (const interest of payment.securedLoanDetails) {
                        await models.customerLoanInterest.update({isPartPaymentEverReceived:interest.isPartPaymentEverReceived, interestPaidFrom: interest.interestPaidFrom?interest.interestPaidFrom:'quickPay', paidAmount: interest.paidAmount, interestAccrual: interest.interestAccrual, outstandingInterest: interest.outstandingInterest, emiReceivedDate: interest.emiReceivedDate, penalAccrual: interest.penalAccrual, penalOutstanding: interest.penalOutstanding, penalPaid: interest.penalPaid, modifiedBy, emiStatus: interest.emiStatus, interestAmtPaidDuringQuickPay: interest.interestAmtPaidDuringQuickPay }, { where: { id: interest.id }, transaction: t });
                    }
                }
                if (payment.unsecuredLoanDetails) {
                    for (const interest of payment.unsecuredLoanDetails) {
                        await models.customerLoanInterest.update({isPartPaymentEverReceived:interest.isPartPaymentEverReceived, interestPaidFrom: interest.interestPaidFrom?interest.interestPaidFrom:'quickPay', paidAmount: interest.paidAmount, interestAccrual: interest.interestAccrual, outstandingInterest: interest.outstandingInterest, emiReceivedDate: interest.emiReceivedDate, penalAccrual: interest.penalAccrual, penalOutstanding: interest.penalOutstanding, penalPaid: interest.penalPaid, modifiedBy, emiStatus: interest.emiStatus, interestAmtPaidDuringQuickPay: interest.interestAmtPaidDuringQuickPay }, { where: { id: interest.id }, transaction: t });
                    }
                }
                //update in transaction
                if (payment.transactionDetails) {
                    for (const amount of payment.transactionDetails) {
                        if (amount.isPenalInterest) {
                            //debit
                            let checkDebitEntry = await models.customerTransactionDetail.findAll({ where: { masterLoanId: amount.masterLoanId, loanId: amount.loanId, loanInterestId: amount.loanInterestId, isPenalInterest: true, credit: 0.00 } });
                            if (checkDebitEntry.length == 0) {
                                let debit = await models.customerTransactionDetail.create({ masterLoanId: amount.masterLoanId, loanId: amount.loanId, loanInterestId: amount.loanInterestId, isPenalInterest: true, debit: amount.penalInterest, description: `Penal interest`, paymentDate: moment() }, { transaction: t });
                                await models.customerTransactionDetail.update({ referenceId: `${amount.loanUniqueId}-${debit.id}` }, { where: { id: debit.id }, transaction: t });
                            } else {
                                let debitedAmount = await checkDebitEntry.map((data) => Number(data.debit));
                                let totalDebitedAmount = _.sum(debitedAmount);
                                let newDebitAmount = amount.penalInterest - totalDebitedAmount;
                                if (newDebitAmount > 0) {
                                    let debit = await models.customerTransactionDetail.create({ masterLoanId: amount.masterLoanId, loanId: amount.loanId, loanInterestId: amount.loanInterestId, isPenalInterest: true, debit: newDebitAmount, description: `Penal interest`, paymentDate: moment() }, { transaction: t });
                                    await models.customerTransactionDetail.update({ referenceId: `${amount.loanUniqueId}-${debit.id}` }, { where: { id: debit.id }, transaction: t });
                                }
                            }
                            //credit
                            let description = "Penal interest received"
                            // let paid = await models.customerTransactionDetail.create({ customerLoanTransactionId: transactionId, masterLoanId: amount.masterLoanId, loanId: amount.loanId, isPenalInterest: amount.isPenalInterest, credit: amount.credit, description: description, paymentDate: receivedDate }, { transaction: t });
                            // await models.customerTransactionDetail.update({ referenceId: `${amount.loanUniqueId}-${paid.id}` }, { where: { id: paid.id }, transaction: t });
                        } else {
                            if (amount.isExtraDaysInterest) {
                                //debit
                                let checkDebitEntry = await models.customerTransactionDetail.findAll({ where: { masterLoanId: amount.masterLoanId, loanId: amount.loanId, loanInterestId: amount.loanInterestId, isPenalInterest: false, credit: 0.00 } });
                                if (checkDebitEntry.length == 0) {
                                    let rebateAmount = amount.highestInterestAmount - amount.interestAmount;
                                    let debit = await models.customerTransactionDetail.create({ masterLoanId: amount.masterLoanId, loanId: amount.loanId, loanInterestId: amount.loanInterestId, debit: amount.interestAmount, description: `Extra days interest`, paymentDate: moment(), rebateAmount }, { transaction: t });
                                    await models.customerTransactionDetail.update({ referenceId: `${amount.loanUniqueId}-${debit.id}` }, { where: { id: debit.id }, transaction: t });
                                } else {
                                    let debitedAmount = await checkDebitEntry.map((data) => Number(data.debit));
                                    let totalDebitedAmount = _.sum(debitedAmount);
                                    let newDebitAmount = amount.interestAmount - totalDebitedAmount;
                                    if (newDebitAmount > 0) {
                                        let rebateAmount = -Math.abs(newDebitAmount)
                                        let debit = await models.customerTransactionDetail.create({ masterLoanId: amount.masterLoanId, loanId: amount.loanId, loanInterestId: amount.loanInterestId, debit: newDebitAmount, description: `Extra days interest`, paymentDate: moment(), rebateAmount }, { transaction: t });
                                        await models.customerTransactionDetail.update({ referenceId: `${amount.loanUniqueId}-${debit.id}` }, { where: { id: debit.id }, transaction: t });
                                    }
                                }
                                //credit
                                // let paid = await models.customerTransactionDetail.create({ customerLoanTransactionId: transactionId, masterLoanId: amount.masterLoanId, loanId: amount.loanId, credit: amount.credit, description: `Extra days interest received`, paymentDate: receivedDate, }, { transaction: t });
                                // await models.customerTransactionDetail.update({ referenceId: `${amount.loanUniqueId}-${paid.id}` }, { where: { id: paid.id }, transaction: t });
                            } else {
                                // let paid = await models.customerTransactionDetail.create({ customerLoanTransactionId: transactionId, masterLoanId: amount.masterLoanId, loanId: amount.loanId, credit: amount.credit, description: `Interest received ${amount.emiDueDate}`, paymentDate: receivedDate, }, { transaction: t });
                                // await models.customerTransactionDetail.update({ referenceId: `${amount.loanUniqueId}-${paid.id}` }, { where: { id: paid.id }, transaction: t });
                            }

                        }
                    }
                }

                //outstanding payment 
                let transactionDataSecured = securedTransactionSplit;
                let transactionDataUnSecured = unsecuredTransactionSplit;
                let securedPayableOutstandingNew = 0;
                let unSecuredPayableOutstandingNew = 0;
                let totalPayableOutstanding = 0;
                securedPayableOutstandingNew = transactionDataSecured.payableOutstanding;
                if (transactionDataUnSecured) {
                    unSecuredPayableOutstandingNew = transactionDataUnSecured.payableOutstanding;
                }
                totalPayableOutstanding = Number(securedPayableOutstandingNew) + Number(unSecuredPayableOutstandingNew);
                let loanInfo = await models.customerLoanMaster.findOne({
                    where: { id: transactionDataSecured.masterLoanId },
                    transaction: t,
                    order: [
                        [models.customerLoan, 'id', 'asc']
                    ],
                    attributes: ['id', 'outstandingAmount'],
                    include: [{
                        model: models.customerLoan,
                        as: 'customerLoan',
                        attributes: ['id', 'outstandingAmount', 'loanUniqueId']
                    }]
                });
                let securedOutstandingAmount = Number(loanInfo.customerLoan[0].outstandingAmount - securedPayableOutstandingNew);
                let securedLoanUniqueId = loanInfo.customerLoan[0].loanUniqueId;
                let unSecuredOutstandingAmount = 0;
                let unSecuredLoanUniqueId;
                if (transactionDataUnSecured) {
                    unSecuredOutstandingAmount = Number(loanInfo.customerLoan[1].outstandingAmount - unSecuredPayableOutstandingNew);
                    unSecuredLoanUniqueId = loanInfo.customerLoan[1].loanUniqueId;
                }
                let outstandingAmount = Number(loanInfo.outstandingAmount - totalPayableOutstanding);


                //credit part release ornament amount
                // let securedTransaction = await models.customerTransactionDetail.create({ masterLoanId: masterLoanId, customerLoanTransactionId: transactionId, loanId: transactionDataSecured.loanId, credit: securedPayableOutstandingNew, paymentDate: receivedDate, description: "part payment for customer loan" }, { transaction: t });
                // await models.customerTransactionDetail.update({ referenceId: `${securedLoanUniqueId}-${securedTransaction.id}` }, { where: { id: securedTransaction.id }, transaction: t })
                // if (transactionDataUnSecured) {
                //     let unSecuredTransaction = await models.customerTransactionDetail.create({ masterLoanId: masterLoanId, customerLoanTransactionId: transactionId, loanId: transactionDataUnSecured.loanId, credit: unSecuredPayableOutstandingNew, paymentDate: receivedDate, description: "part payment for customer loan" }, { transaction: t });
                //     await models.customerTransactionDetail.update({ referenceId: `${unSecuredLoanUniqueId}-${unSecuredTransaction.id}` }, { where: { id: unSecuredTransaction.id }, transaction: t })
                // }

                //credit all amount
                let paid = await models.customerTransactionDetail.create({ customerLoanTransactionId: transactionId, masterLoanId: masterLoanId, credit: depositAmount, description: `Part payment amount received`, paymentDate: receivedDate, }, { transaction: t });
                await models.customerTransactionDetail.update({ referenceId: `${uniqid.time().toUpperCase()}-${paid.id}` }, { where: { id: paid.id }, transaction: t });

                let x = await models.customerLoan.update({ outstandingAmount: securedOutstandingAmount }, { where: { id: transactionDataSecured.loanId }, transaction: t });

                if (transactionDataUnSecured) {
                    let y = await models.customerLoan.update({ outstandingAmount: unSecuredOutstandingAmount }, { where: { id: transactionDataUnSecured.loanId }, transaction: t });
                }
                let z = await models.customerLoanMaster.update({ outstandingAmount: outstandingAmount }, { where: { id: masterLoanId }, transaction: t });
                let loanOf = await models.customerLoanMaster.findOne({ where: { id: masterLoanId } })


                // interest calculation after part payment
                // let updateInterestAftertOutstandingAmount = async (date, masterLoanId) => {
                //loan new calculation
                //loan new calculation
                let getAllDetailsOfCustomerLoanP = async (customerLoanId) => {
                    let loanData = await models.customerLoan.findOne({
                        where: { id: customerLoanId }, transaction: t,
                        order: [
                            ['id', 'asc'],
                            [models.customerLoanInterest, 'id', 'asc'],
                        ],
                        attributes: ['id', 'masterLoanId', 'loanUniqueId', 'selectedSlab', 'loanAmount', 'outstandingAmount', 'currentSlab', 'currentInterestRate', 'penalInterestLastReceivedDate', 'penalInterest', 'loanType', 'rebateInterestRate', 'schemeId'],
                        include: [{
                            model: models.customerLoanSlabRate,
                            as: 'slab',
                            attributes: ['days', 'interestRate']
                        }, {
                            model: models.customerLoanMaster,
                            as: 'masterLoan',
                            attributes: ['tenure', 'loanStartDate', 'loanEndDate', 'processingCharge', 'totalFinalInterestAmt', 'outstandingAmount']
                        }, {
                            model: models.customerLoanInterest,
                            as: 'customerLoanInterest',
                            attributes: { exclude: ['createdAt', 'createdBy', 'modifiedBy', 'updatedAt'] },
                        }, {
                            model: models.scheme,
                            as: 'scheme',
                            attributes: { exclude: ['createdAt', 'updatedAt'] },
                        }]
                    })
                    return loanData;
                }
    
    
                let getCustomerLoanIdP = async (masterLoanId) => {
                    let masterLona = await models.customerLoanMaster.findAll({
                        order: [
                            [models.customerLoan, 'id', 'asc']
                        ],
                        where: {
                            isActive: true,
                            id: masterLoanId
                        },
                        transaction: t,
                        attributes: ['id'],
                        include: [{
                            model: models.customerLoan,
                            as: 'customerLoan',
                            attributes: ['id']
                        }],
                    });
                    let customerLoanId = [];
                    for (const masterLoanData of masterLona) {
                        await masterLoanData.customerLoan.map((data) => { customerLoanId.push(data.id) });
                    }
                    return customerLoanId
                }
    
                let calculationDataOneLoanP = async (masterLoanId) => {
                    let customerLoanId = await getCustomerLoanIdP(masterLoanId);
                    console.log(customerLoanId)
                    let loanInfo = [];
                    for (const id of customerLoanId) {
                        let info = await getAllDetailsOfCustomerLoanP(id);
                        loanInfo.push(info);
                    }
                    let noOfDaysInYear = 360
                    let global = await models.globalSetting.findAll()
                    let { gracePeriodDays } = global[0]
                    return { noOfDaysInYear, gracePeriodDays, loanInfo };
                }
    
                let data1 = await calculationDataOneLoanP(masterLoanId);
                let loanInfo1 = data1.loanInfo;
                let currentDate = moment();
                let noOfDays = 0;
                for (let index = 0; index < loanInfo1.length; index++) {
                    const loan = loanInfo1[index];
                    let getAllInterest1 = async (loanId) => {
                        let allNotPaidInterest = await models.customerLoanInterest.findAll({
                            transaction: t,
                            where: { loanId: loanId, isExtraDaysInterest: false },
                            attributes: ['id', 'interestAmount', 'paidAmount', 'emiDueDate', 'highestInterestAmount', 'rebateAmount']
                        });
                        return allNotPaidInterest;
                    }
                    let allInterestTable = await getAllInterest1(loan.id);
    
                    let checkPaidInterest1 = async (loanId, masterLaonId) => {
                        let checkDailyAmount = await models.customerLoanInterest.findOne({
                            transaction: t,
                            where: { loanId: loanId, masterLoanId: masterLaonId, emiStatus: 'paid', isExtraDaysInterest: false },
                            order: [['emiDueDate', 'DESC']]
                        })
                        return checkDailyAmount
                    }
                    let lastPaidEmi = await checkPaidInterest1(loan.id, loan.masterLoanId);
    
                    let loanStartDate;
                    if (!lastPaidEmi) {
                        loanStartDate = moment(loan.masterLoan.loanStartDate);
                        noOfDays = currentDate.diff(loanStartDate, 'days');
                        noOfDays += 1;
                    } else {
                        loanStartDate = moment(lastPaidEmi.emiDueDate);
                        noOfDays = currentDate.diff(loanStartDate, 'days');
                    }
                    //scenario 2 slab changed
                    let getStepUpslab1 = async (loanId, noOfDys) => {
                        let stepUpSlab = await models.customerLoanSlabRate.findOne({
                            transaction: t,
                            where: { loanId: loanId, days: { [Op.gte]: noOfDys } },
                            attributes: ['days', 'interestRate'],
                            order: [['days', 'ASC']]
                        });
                        if (!stepUpSlab) {
                            stepUpSlab = await models.customerLoanSlabRate.findOne({
                                where: { loanId: loanId },
                                attributes: ['days', 'interestRate'],
                                order: [['days', 'DESC']]
                            });
                            return stepUpSlab;
                        } else {
                            return stepUpSlab;
                        }
                    }
                    let stepUpSlab = await getStepUpslab1(loan.id, noOfDays);
                    var currentInterestRate = loan.currentInterestRate
    
                    let interest = await newSlabRateInterestCalcultaion(loan.outstandingAmount, currentInterestRate, loan.selectedSlab, loan.masterLoan.tenure);
    
                    let getAllNotPaidInterest1 = async (loanId) => {
                        let allNotPaidInterest = await models.customerLoanInterest.findAll({
                            transaction: t,
                            where: { loanId: loanId, emiStatus: { [Op.notIn]: ['paid'] }, isExtraDaysInterest: false },
                            attributes: ['id', 'interestAmount', 'paidAmount', 'emiDueDate', 'highestInterestAmount', 'rebateAmount', 'emiReceivedDate', 'emiStartDate', 'interestAmtPaidDuringQuickPay', 'interestPaidFrom', 'isPartPaymentEverReceived']
                        });
                        return allNotPaidInterest;
                    }
                    let allInterest = await getAllNotPaidInterest1(loan.id)//get all interest
    
                    let getAllInterestLessThanDate1 = async (loanId, date) => {
                        let allInterestLessThanDate = await models.customerLoanInterest.findAll({
                            transaction: t,
                            where: { loanId: loanId, emiDueDate: { [Op.lte]: date, }, emiStatus: { [Op.notIn]: ['paid'] }, isExtraDaysInterest: false },
                            attributes: ['id', 'interestAmount', 'paidAmount', 'emiDueDate', 'highestInterestAmount', 'rebateAmount', 'emiReceivedDate', 'interestAmtPaidDuringQuickPay', 'interestPaidFrom', 'isPartPaymentEverReceived']
                        });
                        return allInterestLessThanDate;
                    }
                    let interestLessThanDate = await getAllInterestLessThanDate1(loan.id, currentDate);
                    //update interestAccrual & interest amount //here to debit amount
                    for (const interestData of interestLessThanDate) {
                        let checkDebitEntry = await models.customerTransactionDetail.findAll({ where: { masterLoanId: loan.masterLoanId, loanId: loan.id, loanInterestId: interestData.id, credit: 0.00, isPenalInterest: false } });
                        if (checkDebitEntry.length == 0) {
                            let rebateAmount = interestData.highestInterestAmount - interest.amount;
                            let debit = await models.customerTransactionDetail.create({ masterLoanId: loan.masterLoanId, loanId: loan.id, loanInterestId: interestData.id, debit: interest.amount, description: `Net interest due (after rebate) ${moment(interestData.emiDueDate).format('DD/MM/YYYY')}`, paymentDate: moment(), rebateAmount }, { transaction: t });
                            await models.customerTransactionDetail.update({ referenceId: `${loan.loanUniqueId}-${debit.id}` }, { where: { id: debit.id }, transaction: t });
                        } else {
                            let debitedAmount = await checkDebitEntry.map((data) => Number(data.debit));
                            let totalDebitedAmount = _.sum(debitedAmount);
                            let newDebitAmount = interest.amount - totalDebitedAmount;
                            if (newDebitAmount > 0) {
                                let rebateAmount = -Math.abs(newDebitAmount)
                                let debit = await models.customerTransactionDetail.create({ masterLoanId: loan.masterLoanId, loanId: loan.id, loanInterestId: interestData.id, debit: newDebitAmount, description: `stepUpInterest ${moment(interestData.emiDueDate).format('DD/MM/YYYY')}`, paymentDate: moment(), rebateAmount }, { transaction: t });
                                await models.customerTransactionDetail.update({ referenceId: `${loan.loanUniqueId}-${debit.id}` }, { where: { id: debit.id }, transaction: t });
                            } else if (newDebitAmount < 0) {
                                let rebateAmount = Math.abs(newDebitAmount)
                                let credit = await models.customerTransactionDetail.create({ masterLoanId: loan.masterLoanId, loanId: loan.id, loanInterestId: interestData.id, credit: Math.abs(newDebitAmount), description: `stepDownInterest ${moment(interestData.emiDueDate).format('DD/MM/YYYY')}`, paymentDate: moment(), rebateAmount }, { transaction: t });
                                await models.customerTransactionDetail.update({ referenceId: `${loan.loanUniqueId}-${credit.id}` }, { where: { id: credit.id }, transaction: t });
                            }
                        }
                        let outstandingInterest
                        let interestAmount
                        if (interestData.interestPaidFrom == 'partPayment' || interestData.isPartPaymentEverReceived) {
                            // cal interest from emi received date 
                            interestAmount = await calculateInterestForParticularDueDate(interestData.emiReceivedDate, interestData.emiDueDate, currentInterestRate, loan.outstandingAmount, false)
    
    
                            outstandingInterest = interestAmount - interestData.interestAmtPaidDuringQuickPay;
                            interestAccrual = interestAmount - interestData.interestAmtPaidDuringQuickPay;
    
                        } else {
                            outstandingInterest = interest.amount - interestData.interestAmtPaidDuringQuickPay;
                            interestAccrual = interest.amount - interestData.interestAmtPaidDuringQuickPay;
                        }
    
    
                        if (interestAccrual < 0) {
                            await models.customerLoanInterest.update({ interestAmount: interest.amount, totalInterestAccrual: interest.amount, outstandingInterest, interestAccrual: 0, interestRate: currentInterestRate }, { where: { id: interestData.id, emiStatus: { [Op.notIn]: ['paid'] } }, transaction: t });
                        } else {
                            await models.customerLoanInterest.update({ interestAmount: interest.amount, totalInterestAccrual: interest.amount, outstandingInterest, interestAccrual, interestRate: currentInterestRate }, { where: { id: interestData.id, emiStatus: { [Op.notIn]: ['paid'] } }, transaction: t });
                        }
                    }
    
                    if (allInterest.length != interestLessThanDate.length) {
                        let pendingNoOfDays = noOfDays - (interestLessThanDate.length * loan.selectedSlab);
                        if (pendingNoOfDays > 0) {
                            let oneDayInterest = currentInterestRate / 30;
                            let oneDayAmount = loan.outstandingAmount * (oneDayInterest / 100);
                            let pendingDaysAmount = pendingNoOfDays * oneDayAmount;
    
                            let getPendingNoOfDaysInterest1 = async (loanId, date) => {
                                let pendingNoOfDaysInterest = await models.customerLoanInterest.findOne({
                                    transaction: t,
                                    where: { loanId: loanId, emiDueDate: { [Op.gt]: date, }, emiStatus: { [Op.notIn]: ['paid'] }, isExtraDaysInterest: false },
                                    attributes: ['id', 'paidAmount', 'emiDueDate', 'emiReceivedDate', 'emiStartDate', 'interestAmtPaidDuringQuickPay', 'interestPaidFrom', 'isPartPaymentEverReceived'],
                                    order: [['emiDueDate', 'ASC']]
                                });
                                return pendingNoOfDaysInterest;
                            }
                            let nextInterest = await getPendingNoOfDaysInterest1(loan.id, currentDate);
    
                            if (nextInterest) {
                                let amount
                                let interestAccrual
                                if (nextInterest.interestPaidFrom == 'partPayment') {
                                    // cal interest from emi received date 
                                    pendingDaysAmount = await calculateInterestForParticularDueDate(nextInterest.emiReceivedDate, nextInterest.emiDueDate, currentInterestRate, loan.outstandingAmount, false)
                                    interestAccrual = await calculateInterestForParticularDueDate(nextInterest.emiReceivedDate, currentDate, currentInterestRate, loan.outstandingAmount, false)
                                    if (interestAccrual < 0) {
                                        await models.customerLoanInterest.update({ interestAccrual: 0.00, totalInterestAccrual: pendingDaysAmount, interestRate: currentInterestRate, outstandingInterest: amount }, { where: { id: nextInterest.id, emiStatus: { [Op.notIn]: ['paid'] } }, transaction: t });
                                    } else {
                                        await models.customerLoanInterest.update({ interestAccrual: interestAccrual, totalInterestAccrual: pendingDaysAmount, interestRate: currentInterestRate, outstandingInterest: pendingDaysAmount }, { where: { id: nextInterest.id, emiStatus: { [Op.notIn]: ['paid'] } }, transaction: t });
                                    }
                                } else {
                                    if (nextInterest.isPartPaymentEverReceived) {
                                        //if interest is ever received during part payments
                                        pendingDaysAmount = await calculateInterestForParticularDueDate(nextInterest.emiReceivedDate, nextInterest.emiDueDate, currentInterestRate, loan.outstandingAmount, false)
                                        interestAccrual = await calculateInterestForParticularDueDate(nextInterest.emiReceivedDate, currentDate, currentInterestRate, loan.outstandingAmount, false)
                                    }
    
                                    if (interestAccrual == undefined) {
                                        interestAccrual = pendingDaysAmount;
                                    }
    
    
                                    if (interestAccrual > Number(nextInterest.interestAmtPaidDuringQuickPay)) {
                                        amount = interestAccrual - nextInterest.interestAmtPaidDuringQuickPay;
    
                                        await models.customerLoanInterest.update({ interestAccrual: amount, totalInterestAccrual: pendingDaysAmount }, { where: { id: nextInterest.id, emiStatus: { [Op.notIn]: ['paid'] } }, transaction: t });
                                    } else {
                                        amount = nextInterest.interestAmtPaidDuringQuickPay - interestAccrual;
    
                                        await models.customerLoanInterest.update({ interestAccrual: 0.00, totalInterestAccrual: pendingDaysAmount }, { where: { id: nextInterest.id, emiStatus: { [Op.notIn]: ['paid'] } }, transaction: t });
                                    }
                                }
                            }
                        }
                    }
                    //update all interest amount
                    for (const interestData of allInterest) {
                        let outstandingInterest
                        let interestAmount
                        if (interestData.interestPaidFrom == 'partPayment' || interestData.isPartPaymentEverReceived) {
                            outstandingInterest = await calculateInterestForParticularDueDate(interestData.emiReceivedDate, interestData.emiDueDate, currentInterestRate, loan.outstandingAmount, false);
                            interestAmount = outstandingInterest
                            outstandingInterest = outstandingInterest - interestData.interestAmtPaidDuringQuickPay;
                        } else {
                            interestAmount = interest.amount
                            outstandingInterest = interest.amount - interestData.interestAmtPaidDuringQuickPay;
                        }
                        let rebateAmount = interestData.highestInterestAmount - interest.amount;
                        if (outstandingInterest > 0) {
                            await models.customerLoanInterest.update({ interestAmount: interestAmount, outstandingInterest, interestRate: currentInterestRate, rebateAmount }, { where: { id: interestData.id, emiStatus: { [Op.notIn]: ['paid'] } }, transaction: t });
                        } else {
                            await models.customerLoanInterest.update({ interestAmount: interestAmount, outstandingInterest: 0.00, interestRate: currentInterestRate, rebateAmount,emiStatus:'paid' }, { where: { id: interestData.id, emiStatus: { [Op.notIn]: ['paid'] } }, transaction: t });
                        }
    
                    }
                    //update last interest if changed
                    if (!Number.isInteger(interest.length)) {
                        const noOfMonths = (((loan.masterLoan.tenure * 30) - ((allInterestTable.length - 1) * loan.selectedSlab)) / 30)
                        let oneMonthAmount = interest.amount / (loan.selectedSlab / 30);
                        let amount = (oneMonthAmount * noOfMonths).toFixed(2);
    
                        let getLastInterest1 = async (loanId, masterLaonId) => {
                            let lastInterest = await models.customerLoanInterest.findOne({
                                transaction: t,
                                where: { loanId: loanId, masterLoanId: masterLaonId, isExtraDaysInterest: false },
                                order: [['emiDueDate', 'DESC']],
                                attributes: ['id', 'paidAmount', 'highestInterestAmount', 'rebateAmount', 'interestAmount', 'emiReceivedDate', 'emiDueDate', 'interestPaidFrom', 'interestAmtPaidDuringQuickPay', 'isPartPaymentEverReceived']
                            });
                            return lastInterest;
                        }
                        let lastInterest = await getLastInterest1(loan.id, loan.masterLoanId)
    
                        let outstandingInterest
                        if (lastInterest.interestPaidFrom == 'partPayment' || lastInterest.isPartPaymentEverReceived) {
                            amount = await calculateInterestForParticularDueDate(lastInterest.emiReceivedDate, lastInterest.emiDueDate, currentInterestRate, loan.outstandingAmount)
                        }
                        outstandingInterest = amount - interestData.interestAmtPaidDuringQuickPay
                        let rebateAmount = lastInterest.highestInterestAmount - amount;
                        if (outstandingInterest > 0) {
                            await models.customerLoanInterest.update({ interestAmount: amount, outstandingInterest, interestRate: currentInterestRate, rebateAmount }, { where: { id: lastInterest.id, emiStatus: { [Op.notIn]: ['paid'] } }, transaction: t });
                        } else {
                            await models.customerLoanInterest.update({ interestAmount: amount, outstandingInterest: 0.00, interestRate: currentInterestRate, rebateAmount,emiStatus:'paid' }, { where: { id: lastInterest.id, emiStatus: { [Op.notIn]: ['paid'] } }, transaction: t });
                        }
    
                    }
                    //update current slab in customer loan table
                    await models.customerLoan.update({ currentInterestRate: currentInterestRate, currentSlab: stepUpSlab.days }, { where: { id: loan.id }, transaction: t });
                }
    
                //rebate calculation
                let rebateData = await calculationDataOneLoanP(masterLoanId);
                let loanInfoRebate = rebateData.loanInfo;
                for (const loan of loanInfoRebate) {
                    if (loan.rebateInterestRate) {
                        let rebateInterestRate = Number(loan.rebateInterestRate);
                        let getAllInterest2 = async (loanId) => {
                            let allNotPaidInterest = await models.customerLoanInterest.findAll({
                                transaction: t,
                                where: { loanId: loanId, isExtraDaysInterest: false, emiStatus: { [Op.notIn]: ['paid'] }, },
                                attributes: ['id', 'interestAmount', 'paidAmount', 'emiDueDate', 'highestInterestAmount', 'rebateAmount']
                            });
                            return allNotPaidInterest;
                        }
                        let allInterest = await getAllInterest2(loan.id);
                        let interest = await newSlabRateInterestCalcultaion(loan.outstandingAmount, rebateInterestRate, loan.selectedSlab, loan.masterLoan.tenure);
                        //update rebate and rebateInterestAmount 3 60
                        for (const interestData of allInterest) {
                            let highestInterestAmount = interest.amount;
                            let rebateAmount = highestInterestAmount - interestData.interestAmount;
                            await models.customerLoanInterest.update({ highestInterestAmount, rebateAmount }, { where: { id: interestData.id, emiStatus: { [Op.notIn]: ['paid'] } }, transaction: t });
                        }
                        //update last interest if changed
                        if (!Number.isInteger(interest.length)) {
                            const noOfMonths = (((loan.masterLoan.tenure * 30) - ((allInterest.length - 1) * loan.selectedSlab)) / 30)
                            let oneMonthAmount = interest.amount / (loan.selectedSlab / 30);
                            let highestInterestAmount = (oneMonthAmount * noOfMonths).toFixed(2);
                            let getLastInterest2 = async (loanId, masterLaonId) => {
                                let lastInterest = await models.customerLoanInterest.findOne({
                                    transaction: t,
                                    where: { loanId: loanId, masterLoanId: masterLaonId, isExtraDaysInterest: false },
                                    order: [['emiDueDate', 'DESC']],
                                    attributes: ['id', 'paidAmount', 'highestInterestAmount', 'rebateAmount', 'interestAmount']
                                });
                                return lastInterest;
                            }
                            let lastInterest = await getLastInterest2(loan.id, loan.masterLoanId)
                            let rebateAmount = highestInterestAmount - lastInterest.interestAmount;
                            await models.customerLoanInterest.update({ rebateAmount, highestInterestAmount }, { where: { id: lastInterest.id, emiStatus: { [Op.notIn]: ['paid'] } }, transaction: t });
                            
                        }
                    }
                }

                let sendLoanMessage = await customerNameNumberLoanId(masterLoanId)

                await sendPaymentMessage(sendLoanMessage.mobileNumber, sendLoanMessage.customerName, sendLoanMessage.sendLoanUniqueId, depositAmount)
            }
            ///////////
            return customerLoanTransaction
        })

        if (isAdmin) {
            return res.status(200).json({ data: 'success' })
        } else {
            res.redirect(`${process.env.BASE_URL_CUSTOMER}/gold-loan/thank-you?payemntDone=yes&amount=${tempRazorData.amount}`)
        }
    } catch (err) {
        await models.errorLogger.create({
            message: err.message,
            url: req.url,
            method: req.method,
            host: req.hostname,
            body: req.body,
            userData: req.userData
        });
        if (err.statusCode == 400 && err.error.code) {
            return res.status(400).json({ message: err.error.description });
        } else {
            res.status(500).send({ message: "something went wrong" });

        }
    }
}

exports.confirmPartPaymentTranscation = async (req, res, next) => {

    let modifiedBy = req.userData.id
    let { transactionId, status, paymentReceivedDate, masterLoanId, depositAmount } = req.body;

    let partPayment = await partPaymnetSettlement(transactionId, status, paymentReceivedDate, masterLoanId, depositAmount, modifiedBy)



    return res.status(200).json({ message: "Success" });

}

