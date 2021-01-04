const models = require("../../models");
const sequelize = models.sequelize;

const Sequelize = models.Sequelize;
const Op = Sequelize.Op;
const { createReferenceCode } = require("../../utils/referenceCode");
const _ = require('lodash');
const request = require("request");
const moment = require("moment");
const CONSTANT = require("../../utils/constant");
var uniqid = require('uniqid');
const getRazorPayDetails = require('../../utils/razorpay');
let crypto = require('crypto');
const qs = require('qs');

const check = require("../../lib/checkLib");
const { paginationWithFromTo } = require("../../utils/pagination");
let sms = require('../../utils/sendSMS');
let { mergeInterestTable, getCustomerInterestAmount, payableAmountForLoan, customerLoanDetailsByMasterLoanDetails, allInterestPayment, nextDueDateInterest, getAmountLoanSplitUpData, stepDown, intrestCalculationForSelectedLoan, penalInterestCalculationForSelectedLoan, penalInterestCalculationForSelectedLoanWithOutT, intrestCalculationForSelectedLoanWithOutT, getCustomerLoanId, customerNameNumberLoanId, interestSplit } = require('../../utils/loanFunction')

let { sendPaymentMessage } = require('../../utils/SMS')


exports.razorPayCreateOrder = async (req, res, next) => {
    try {
        let { amount, masterLoanId } = req.body;
        const razorpay = await getRazorPayDetails();
        let transactionUniqueId = uniqid.time().toUpperCase();
        let payableAmount = await Math.round(amount * 100);
        let loanData = await models.customerLoan.findOne({ where: { masterLoanId: masterLoanId }, order: [['id', 'asc']] });
        let razorPayOrder = await razorpay.instance.orders.create({ amount: payableAmount, currency: "INR", receipt: `${transactionUniqueId}`, payment_capture: 1, notes: { product: "gold loan", loanId: loanData.loanUniqueId } });
        return res.status(200).json({ razorPayOrder, razerPayConfig: razorpay.razorPayConfig.key_id });
    } catch (err) {
        await models.errorLogger.create({
            message: err.message,
            url: req.url,
            method: req.method,
            host: req.hostname,
            body: req.body,
            userData: req.userData
        });
        res.status(500).send({ message: err.message });
    }
}

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

    // let lastPayment = await models.customerLoanTransaction.findAll({
    //     where: { masterLoanId: masterLoanId, depositStatus: "Completed", paymentFor: 'quickPay' },
    //     order: [
    //         ['id', 'asc']
    //     ]
    // })

    let secureHighestSlabRate = await models.customerLoanSlabRate.findOne({
        where: {
            loanId: interestInfo.loan.customerLoan[0].id
        },
        order: [['id', 'desc']],
        attributes: ['interestRate']
    })
    interestInfo.loan.dataValues.secureHighestSlabRate = secureHighestSlabRate

    if (interestInfo.loan.customerLoan.length > 1) {
        var unsecureHighestSlabRate = await models.customerLoanSlabRate.findOne({
            where: {
                loanId: interestInfo.loan.customerLoan[1].id
            },
            order: [['id', 'desc']],
            attributes: ['interestRate']

        })
        interestInfo.loan.dataValues.unsecureHighestSlabRate = unsecureHighestSlabRate

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

    return res.status(200).json({ message: "success", data: interestInfo.loan })


}

//CALCULATE PAYABLE AMOUNT
exports.payableAmount = async (req, res, next) => {
    let { masterLoanId } = req.query;
    let amount = await getCustomerInterestAmount(masterLoanId);

    let loan = await customerLoanDetailsByMasterLoanDetails(masterLoanId);

    let interest = await nextDueDateInterest(loan.loan)

    let data = await payableAmountForLoan(amount, loan.loan)
    data.unsecuredTotalInterest = interest.unsecuredTotalInterest
    data.securedTotalInterest = interest.securedTotalInterest
    data.securedRebate = interest.securedRebate
    data.unsecuredRebate = interest.unsecuredRebate
    data.totalInterest = interest.totalInterest
    data.outstandingAmount = loan.loan.outstandingAmount
    return res.status(200).json({ data });
}

//CALCULATE PAYABLE AMOUNT
exports.payableAmountConfirm = async (req, res, next) => {
    let { masterLoanId, amount } = req.query

    let payableAmount = 0;

    // let interestTable = await models.customerLoanInterest.findAll({
    //     where: {
    //         masterLoanId: masterLoanId,
    //         emiStatus: { [Op.notIn]: ['paid'] },
    //     }
    // })

    // for (const emi of interestTable) {
    //     payableAmount += Number(emi.outstandingInterest)
    //     if (emi.penalInterest) {
    //         payableAmount += Number(emi.penalInterest)

    //     }
    // }
    let loan = await customerLoanDetailsByMasterLoanDetails(masterLoanId);

    let interest = await nextDueDateInterest(loan.loan)
    payableAmount = (Number(interest.unsecuredTotalInterest) + Number(interest.securedTotalInterest)).toFixed(2)

    if (Number(payableAmount) < Number(amount)) {
        return res.status(403).json({ message: "Please opt for Part Payment option to pay more amount" });

    }


    loan = await customerLoanDetailsByMasterLoanDetails(masterLoanId)

    return res.status(200).json({ data: loan });
}

exports.quickPayment = async (req, res, next) => {
    try {
        // let createdBy = req.userData.id;
        let modifiedBy = null;
        let { paymentDetails, payableAmount, masterLoanId, transactionDetails, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
        const razorpay = await getRazorPayDetails();
        let isAdmin 
        let transactionUniqueId = uniqid.time().toUpperCase();
        if (razorpay_order_id) {
            var tempRazorData = await models.tempRazorPayDetails.findOne({ where: { razorPayOrderId: razorpay_order_id } })
            depositDate = tempRazorData.depositDate
            masterLoanId = tempRazorData.masterLoanId
            paymentType = tempRazorData.paymentType
            payableAmount = tempRazorData.amount
            transactionId = tempRazorData.transactionUniqueId
        } else {
            var { bankName, branchName, chequeNumber, depositDate, depositTransactionId, paymentType, transactionId } = paymentDetails
        }
        let amount = await getCustomerInterestAmount(masterLoanId);
        let { loan } = await customerLoanDetailsByMasterLoanDetails(masterLoanId);
        if (!['cash', 'IMPS', 'NEFT', 'RTGS', 'cheque', 'upi', 'card', 'netbanking', 'wallet'].includes(paymentType)) {
            return res.status(400).json({ message: "Invalid payment type" })
        }
        let signatureVerification = false;
        let razorPayTransactionId;
        let isRazorPay = false;

        if (paymentType == 'upi' || paymentType == 'netbanking' || paymentType == 'wallet' || paymentType == 'card') {
            paymentDetails = {}

            let razerpayData
            if (razorpay_order_id) {
                isAdmin = false
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
        }else{
            isAdmin = true
        }
        // // let { penalInterest } = await payableAmountForLoan(amount, loan)
        // // let splitUpAmount = payableAmount - penalInterest
        // // let penalInterestRatio;
        // // if (splitUpAmount <= 0) {
        // //     penalInterestRatio = await getAmountLoanSplitUpData(loan, amount, payableAmount)
        // //     splitUpAmount = 0
        // // }


        // // let data = await getAmountLoanSplitUpData(loan, amount, splitUpAmount);
        // let { isUnsecuredSchemeApplied, securedOutstandingAmount, unsecuredOutstandingAmount, totalOutstandingAmount, securedRatio, unsecuredRatio, newSecuredOutstandingAmount, newUnsecuredOutstandingAmount, newMasterOutstandingAmount, securedInterest, unsecuredInterest, securedLoanId, unsecuredLoanId } = data

        // let securedPenalInterest = 0;
        // let unsecuredPenalInterest = 0;
        // if (splitUpAmount <= 0) {
        //     securedPenalInterest = penalInterestRatio.securedRatio
        //     unsecuredPenalInterest = penalInterestRatio.unsecuredRatio
        // } else {
        //     securedPenalInterest = data.securedPenalInterest
        //     unsecuredPenalInterest = data.unsecuredPenalInterest
        // }

        paymentDetails.masterLoanId = masterLoanId
        paymentDetails.depositDate = depositDate
        paymentDetails.paymentType = paymentType
        paymentDetails.transactionAmont = payableAmount
        paymentDetails.depositDate = moment(moment(depositDate).format("YYYY-MM-DD"));
        paymentDetails.transactionUniqueId = transactionUniqueId //ye change karna h
        if (isRazorPay) {
            paymentDetails.razorPayTransactionId = razorPayTransactionId
        }
        paymentDetails.bankTransactionUniqueId = transactionId
        paymentDetails.depositStatus = "Pending"
        paymentDetails.paymentFor = 'quickPay'

        await sequelize.transaction(async t => {
            let customerLoanTransaction = await models.customerLoanTransaction.create(paymentDetails, { transaction: t });
            //////razorPay
            if (isRazorPay) {
                //new loan
                let status = "Completed";
                let receivedDate = moment(moment(depositDate).format("YYYY-MM-DD"));
                let transactionId = customerLoanTransaction.id;
                let depositAmount = payableAmount;
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

                let { penalInterest } = await payableAmountForLoan(amount, newLoan)
                let splitUpAmount = depositAmount - penalInterest
                let penalInterestRatio;
                if (splitUpAmount <= 0) {
                    penalInterestRatio = await getAmountLoanSplitUpData(newLoan, amount, depositAmount)
                    splitUpAmount = 0
                }


                let data = await interestSplit(newLoan, amount, splitUpAmount);
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

                let newTransactionSplitUp = []

                let securedTransactionSplit = await models.customerTransactionSplitUp.create({
                    customerLoanTransactionId: transactionId,
                    loanId: securedLoanId,
                    masterLoanId: masterLoanId,
                    penal: securedPenalInterest.toFixed(2),
                    interest: securedRatio,
                    isSecured: true
                }, { transaction: t })

                newTransactionSplitUp.push(securedTransactionSplit)

                if (isUnsecuredSchemeApplied) {
                    let unsecuredTransactionSplit = await models.customerTransactionSplitUp.create({
                        customerLoanTransactionId: transactionId,
                        loanId: unsecuredLoanId,
                        masterLoanId: masterLoanId,
                        penal: unsecuredPenalInterest.toFixed(2),
                        interest: unsecuredRatio,
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
                payment = await allInterestPayment(transactionId, newTransactionSplitUp, securedLoanDetails, unsecuredLoanDetails, receivedDate);

                await models.customerLoanTransaction.update({ depositStatus: status, paymentReceivedDate: receivedDate }, { where: { id: transactionId }, transaction: t });
                if (payment.securedLoanDetails) {
                    for (const interest of payment.securedLoanDetails) {
                        await models.customerLoanInterest.update({ paidAmount: interest.paidAmount, interestAccrual: interest.interestAccrual, outstandingInterest: interest.outstandingInterest, emiReceivedDate: interest.emiReceivedDate, penalAccrual: interest.penalAccrual, penalOutstanding: interest.penalOutstanding, penalPaid: interest.penalPaid, modifiedBy, emiStatus: interest.emiStatus }, { where: { id: interest.id }, transaction: t });
                    }
                }
                if (payment.unsecuredLoanDetails) {
                    for (const interest of payment.unsecuredLoanDetails) {
                        await models.customerLoanInterest.update({ paidAmount: interest.paidAmount, interestAccrual: interest.interestAccrual, outstandingInterest: interest.outstandingInterest, emiReceivedDate: interest.emiReceivedDate, penalAccrual: interest.penalAccrual, penalOutstanding: interest.penalOutstanding, penalPaid: interest.penalPaid, modifiedBy, emiStatus: interest.emiStatus }, { where: { id: interest.id }, transaction: t });
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
                            // let description = "Penal interest received"
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
                //all credit
                //
                let paid = await models.customerTransactionDetail.create({ customerLoanTransactionId: transactionId, masterLoanId: masterLoanId, credit: depositAmount, description: `Quick pay amount received`, paymentDate: receivedDate, }, { transaction: t });
                await models.customerTransactionDetail.update({ referenceId: `${uniqid.time().toUpperCase()}-${paid.id}` }, { where: { id: paid.id }, transaction: t });
                // 
                let sendLoanMessage = await customerNameNumberLoanId(masterLoanId)

                await sendPaymentMessage(sendLoanMessage.mobileNumber, sendLoanMessage.customerName, sendLoanMessage.sendLoanUniqueId, depositAmount)
            }
            /////

            return customerLoanTransaction
        })

        await intrestCalculationForSelectedLoan(moment(), masterLoanId)
        await penalInterestCalculationForSelectedLoan(moment(), masterLoanId)
        if (isAdmin) {
            return res.status(200).json({ data: 'success' })
        } else {
            res.redirect(`${process.env.BASE_URL_CUSTOMER}/gold-loan/loan-details`)
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
        res.status(500).send({ message: "something went wrong" });
    }
}

exports.confirmationForPayment = async (req, res, next) => {
    var payment
    let { transactionId, status, paymentReceivedDate, masterLoanId, depositAmount } = req.body
    let modifiedBy = req.userData.id

    let transactionDetail = await models.customerLoanTransaction.findOne({ where: { id: transactionId } })

    // if (transactionDetail.depositStatus == "Completed" || transactionDetail.depositStatus == "Rejected") {
    //     return res.status(400).json({ message: `You can not change the status from this stage.` })
    // }

    if (status == "Rejected") {
        await models.customerLoanTransaction.update({ depositStatus: status }, { where: { id: transactionId } });
    }
    if (status == "Pending") {
        await models.customerLoanTransaction.update({ depositStatus: status }, { where: { id: transactionId } });
    }

    if (status == 'Completed') {

        let { loan } = await customerLoanDetailsByMasterLoanDetails(masterLoanId);

        let receivedDate = moment(paymentReceivedDate)
        let todaysDate = moment(new Date()).format('YYYY-MM-DD')

        let quickPayData = await sequelize.transaction(async (t) => {
            if (receivedDate != todaysDate) {
                var a = moment(receivedDate);
                var b = moment(todaysDate);
                let difference = a.diff(b, 'days')
                if (difference != 0) {
                    var { newEmiTable, currentSlabRate, securedInterest, unsecuredInterest } = await stepDown(receivedDate, loan, difference)
                    if (newEmiTable.length > 0) {
                        for (let stepDownIndex = 0; stepDownIndex < newEmiTable.length; stepDownIndex++) {
                            const element = newEmiTable[stepDownIndex];
                            await models.customerLoanInterest.update({ interestRate: element.interestRate }, { where: { id: element.id }, transaction: t })
                        }
                    }
                    if (currentSlabRate) {
                        await models.customerLoan.update({ currentSlab: currentSlabRate, currentInterestRate: securedInterest }, { where: { id: loan.customerLoan[0].id }, transaction: t })

                        if (loan.customerLoan.length > 1) {
                            await models.customerLoan.update({ currentSlab: currentSlabRate, currentInterestRate: unsecuredInterest }, { where: { id: loan.customerLoan[1].id }, transaction: t })
                        }
                    }
                    let interestCal = await intrestCalculationForSelectedLoanWithOutT(receivedDate, loan.id, securedInterest, unsecuredInterest, currentSlabRate)

                    for (let i = 0; i < interestCal.transactionData.length; i++) {
                        let element = interestCal.transactionData[i]
                        let transactionNew = await models.customerTransactionDetail.create(element, { transaction: t })
                        await models.customerTransactionDetail.update({ referenceId: `${element.loanUniqueId}-${transactionNew.id}` }, { where: { id: transactionNew.id }, transaction: t });
                    }

                    let interestAccrualId = []
                    for (let i = 0; i < interestCal.interestDataObject.length; i++) {
                        const element = interestCal.interestDataObject[i]
                        if (element.id) {
                            if (element.interestAccrual) {
                                interestAccrualId.push(element.id)
                            }
                            let z = await models.customerLoanInterest.update(element, { where: { id: element.id }, transaction: t })
                            console.log(z)
                        } else {
                            await models.customerLoanInterest.create(element, { transaction: t })
                        }
                    }

                    await models.customerLoanInterest.update({ interestAccrual: 0.00, totalInterestAccural: 0.00 }, { where: { masterLoanId: masterLoanId, id: { [Op.notIn]: interestAccrualId }, emiStatus: 'pending' }, transaction: t })


                    //removed
                    // for (let i = 0; i < interestCal.customerLoanData.length; i++) {
                    //     let element = interestCal.customerLoanData[i]
                    //     await models.customerLoan.update(element, { where: { id: element.id }, transaction: t })
                    // }

                    let penalCal = await penalInterestCalculationForSelectedLoanWithOutT(receivedDate, loan.id)
                    if (penalCal.penalData.length == 0) {

                        let j = await models.customerLoanInterest.update({ penalInterest: 0, penalAccrual: 0, penalOutstanding: 0 }, { where: { masterLoanId: masterLoanId, emiStatus: { [Op.not]: ['paid'] } }, transaction: t })

                    } else {
                        for (let i = 0; i < penalCal.penalData.length; i++) {
                            console.log(penalCal)
                            //penal calculation pending
                            const element = penalCal.penalData[i]
                            await models.customerLoanInterest.update({ penalInterest: element.penalInterest, penalAccrual: element.penalAccrual, penalOutstanding: element.penalOutstanding }, { where: { id: element.id }, transaction: t })
                        }
                    }
                }
            }

            // for (let i = 0; i < penalCal.transactionPenal.length; i++) {
            //     let element = penalCal.transactionPenal[i]
            //     let transactionNew = await models.customerTransactionDetail.create(element, { transaction: t })
            //     await models.customerTransactionDetail.update({ referenceId: `${element.loanUniqueId}-${transactionNew.id}` }, { where: { id: transactionNew.id }, transaction: t });
            // }


            let loanDataNew = await models.customerLoanMaster.findOne({
                where: { id: masterLoanId },
                transaction: t,
                order: [
                    [models.customerLoan, 'id', 'asc'],
                ],
                include: [{
                    model: models.customerLoan,
                    as: 'customerLoan',
                    attributes: ['id', 'loanType'],
                    where: { isActive: true },
                }]
            });
            let dataLoan = {}
            await loanDataNew.customerLoan.map((data) => {
                if (data.loanType == "secured") {
                    dataLoan.secured = data.id;
                } else {
                    dataLoan.unsecured = data.id
                }
            });
            let amount = {};
            if (dataLoan.secured) {
                let totalAmount = {
                    interest: 0,
                    penalInterest: 0
                }

                let interest = await models.customerLoanInterest.findAll({ where: { emiStatus: { [Op.notIn]: ["paid"] }, loanId: dataLoan.secured }, transaction: t });
                let interestAmount = await interest.map((data) => Number(data.interestAccrual));
                let penalInterest = await interest.map((data) => Number(data.penalOutstanding));
                totalAmount.interest = Number((_.sum(interestAmount)).toFixed(2));
                totalAmount.penalInterest = Number((_.sum(penalInterest)).toFixed(2));
                amount.secured = totalAmount
            }
            if (dataLoan.unsecured) {
                let totalAmount = {
                    interest: 0,
                    penalInterest: 0
                }
                let interest = await models.customerLoanInterest.findAll({ where: { emiStatus: { [Op.notIn]: ["paid"] }, loanId: dataLoan.unsecured }, transaction: t });
                let interestAmount = await interest.map((data) => Number(data.interestAccrual));
                let penalInterest = await interest.map((data) => Number(data.penalOutstanding));
                totalAmount.interest = Number((_.sum(interestAmount)).toFixed(2));
                totalAmount.penalInterest = Number((_.sum(penalInterest)).toFixed(2));

                amount.unsecured = totalAmount
            }

            //new loan
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

            let { penalInterest } = await payableAmountForLoan(amount, newLoan)
            let splitUpAmount = depositAmount - penalInterest
            let penalInterestRatio;
            if (splitUpAmount <= 0) {
                penalInterestRatio = await getAmountLoanSplitUpData(newLoan, amount, depositAmount)
                splitUpAmount = 0
            }


            let data = await interestSplit(newLoan, amount, splitUpAmount);
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

            let newTransactionSplitUp = []

            let securedTransactionSplit = await models.customerTransactionSplitUp.create({
                customerLoanTransactionId: transactionId,
                loanId: securedLoanId,
                masterLoanId: masterLoanId,
                penal: securedPenalInterest.toFixed(2),
                interest: securedRatio,
                isSecured: true
            }, { transaction: t })

            newTransactionSplitUp.push(securedTransactionSplit)

            if (isUnsecuredSchemeApplied) {
                let unsecuredTransactionSplit = await models.customerTransactionSplitUp.create({
                    customerLoanTransactionId: transactionId,
                    loanId: unsecuredLoanId,
                    masterLoanId: masterLoanId,
                    penal: unsecuredPenalInterest.toFixed(2),
                    interest: unsecuredRatio,
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
            payment = await allInterestPayment(transactionId, newTransactionSplitUp, securedLoanDetails, unsecuredLoanDetails, receivedDate);

            await models.customerLoanTransaction.update({ depositStatus: status, paymentReceivedDate: receivedDate }, { where: { id: transactionId }, transaction: t });
            if (payment.securedLoanDetails) {
                for (const interest of payment.securedLoanDetails) {
                    await models.customerLoanInterest.update({ paidAmount: interest.paidAmount, interestAccrual: interest.interestAccrual, outstandingInterest: interest.outstandingInterest, emiReceivedDate: interest.emiReceivedDate, penalAccrual: interest.penalAccrual, penalOutstanding: interest.penalOutstanding, penalPaid: interest.penalPaid, modifiedBy, emiStatus: interest.emiStatus }, { where: { id: interest.id }, transaction: t });
                }
            }
            if (payment.unsecuredLoanDetails) {
                for (const interest of payment.unsecuredLoanDetails) {
                    await models.customerLoanInterest.update({ paidAmount: interest.paidAmount, interestAccrual: interest.interestAccrual, outstandingInterest: interest.outstandingInterest, emiReceivedDate: interest.emiReceivedDate, penalAccrual: interest.penalAccrual, penalOutstanding: interest.penalOutstanding, penalPaid: interest.penalPaid, modifiedBy, emiStatus: interest.emiStatus }, { where: { id: interest.id }, transaction: t });
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
                        // let description = "Penal interest received"
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
            //all credit
            //
            let transactionData = await models.customerLoanTransaction.findOne({ where: { id: transactionId } });
            let paid = await models.customerTransactionDetail.create({ customerLoanTransactionId: transactionId, masterLoanId: masterLoanId, credit: transactionData.transactionAmont, description: `Quick pay amount received`, paymentDate: receivedDate, }, { transaction: t });
            await models.customerTransactionDetail.update({ referenceId: `${uniqid.time().toUpperCase()}-${paid.id}` }, { where: { id: paid.id }, transaction: t });
            // 


            let sendLoanMessage = await customerNameNumberLoanId(masterLoanId)

            await sendPaymentMessage(sendLoanMessage.mobileNumber, sendLoanMessage.customerName, sendLoanMessage.sendLoanUniqueId, depositAmount)

        })

        await intrestCalculationForSelectedLoan(moment(), masterLoanId)
        await penalInterestCalculationForSelectedLoan(moment(), masterLoanId)

    }
    return res.status(200).json({ message: "success", data: payment });



}

exports.transcationHistory = async (req, res, next) => {

    let { masterLoanId } = req.query;

    let data = await models.customerLoanTransaction.findAll({
        where: {
            masterLoanId: masterLoanId,
            paymentFor: 'quickPay',
        },
        attributes: ['transactionUniqueId', 'transactionAmont', 'paymentReceivedDate', 'depositStatus']
    })

    return res.status(200).json({ data: data })

}


