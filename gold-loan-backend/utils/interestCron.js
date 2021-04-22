const models = require('../models');
const sequelize = models.sequelize;
const Sequelize = models.Sequelize;
const Op = Sequelize.Op;
const check = require("../lib/checkLib");
const moment = require("moment");
const _ = require('lodash');
let { getFirstInterestToPay, getExtraInterest, getAllInterestGreaterThanDate, getInterestTableOfSingleLoan, calculationData, checkPaidInterest, getFirstInterest, calculation, newSlabRateInterestCalcultaion, getStepUpslab, getAllNotPaidInterest, getAllInterestLessThanDate, getPendingNoOfDaysInterest, getLastInterest, getAllInterest, getAllPaidInterestForCalculation, calculationDataForReleasedLoan, getAllPaidPartialyPaidInterest, calculateInterestForParticularDueDate } = require('./loanFunction')

//cron for daily interest calculation
exports.dailyIntrestCalculation = async (date) => {
    //for rebate
    //If rebate is not added
    let rebateData = await calculationData();
    let loanInfoRebate = rebateData.loanInfo;
    await sequelize.transaction(async t => {
        for (const loan of loanInfoRebate) {
            if (!loan.rebateInterestRate) {
                let scheme = await models.scheme.findOne({
                    where: { id: loan.schemeId },
                    attributes: ['schemeName'],
                    order: [[models.schemeInterest, 'id', 'desc']],
                    include: [{
                        model: models.schemeInterest,
                        as: 'schemeInterest'
                    }]
                })
                if (scheme) {
                    let rebateInterestRate = scheme.schemeInterest[0].interestRate;
                    await models.customerLoan.update({ rebateInterestRate }, { where: { id: loan.id }, transaction: t });
                    let allInterest = await getAllInterest(loan.id);
                    let interest = await newSlabRateInterestCalcultaion(loan.outstandingAmount, rebateInterestRate, loan.selectedSlab, loan.masterLoan.tenure);
                    //update rebate and rebateInterestAmount 3 60
                    for (const interestData of allInterest) {
                        let highestInterestAmount = interest.amount;
                        let rebateAmount = highestInterestAmount - interestData.interestAmount;
                        await models.customerLoanInterest.update({ rebateInterestRate: rebateInterestRate, highestInterestAmount, rebateAmount }, { where: { id: interestData.id }, transaction: t });
                    }
                    //update last interest if changed
                    if (!Number.isInteger(interest.length)) {
                        const noOfMonths = (((loan.masterLoan.tenure * 30) - ((allInterest.length - 1) * loan.selectedSlab)) / 30)
                        let oneMonthAmount = interest.amount / (loan.selectedSlab / 30);
                        let highestInterestAmount = (oneMonthAmount * noOfMonths).toFixed(2);
                        let lastInterest = await getLastInterest(loan.id, loan.masterLoanId)
                        let rebateAmount = highestInterestAmount - lastInterest.interestAmount;
                        await models.customerLoanInterest.update({ rebateAmount, highestInterestAmount, rebateInterestRate }, { where: { id: lastInterest.id }, transaction: t });
                    }
                }
            }
        }
    })
    ///

    let data = await calculationData();
    let loanInfo = data.loanInfo;
    let currentDate = moment(date);
    let noOfDays = 0;
    let releasedLoanData = await calculationDataForReleasedLoan()
    let releasedLoanInfo = releasedLoanData.loanInfo;
    for (const loan of loanInfo) {
        await sequelize.transaction(async t => {
            let allInterestTable = await getAllInterest(loan.id);
            let allPaidInterest = await getAllPaidInterestForCalculation(loan.id);
            let lastPaidEmi = await checkPaidInterest(loan.id, loan.masterLoanId);
            let firstInterestToPay = await getFirstInterestToPay(loan.id, loan.masterLoanId);
            let loanStartDate;
            if (!lastPaidEmi) {
                loanStartDate = moment(loan.masterLoan.loanStartDate);
                noOfDays = currentDate.diff(loanStartDate, 'days');
                noOfDays += 1;
            } else {
                loanStartDate = moment(lastPaidEmi.emiDueDate);
                noOfDays = currentDate.diff(loanStartDate, 'days');
            }
            if (firstInterestToPay) {
                date = moment(date).format('YYYY-MM-DD')
                var checkDueDateForSlab = moment(date).isAfter(firstInterestToPay.emiDueDate);//check due date to change slab
            }
            //step up
            if (noOfDays > loan.currentSlab && checkDueDateForSlab) {
                //scenario 2 slab changed
                let stepUpSlab = await getStepUpslab(loan.id, noOfDays);
                let interest = await newSlabRateInterestCalcultaion(loan.outstandingAmount, stepUpSlab.interestRate, loan.selectedSlab, loan.masterLoan.tenure);
                let allInterest = await getAllNotPaidInterest(loan.id)//get all interest
                let interestLessThanDate = await getAllInterestLessThanDate(loan.id, date);
                let interestGreaterThanDate = await getAllInterestGreaterThanDate(loan.id, date);
                //update interestAccrual & interest amount //here to debit amount
                for (const interestData of interestLessThanDate) {
                    let checkDebitEntry = await models.customerTransactionDetail.findAll({ where: { masterLoanId: loan.masterLoanId, loanId: loan.id, loanInterestId: interestData.id, credit: 0.00, isPenalInterest: false } });
                    if (checkDebitEntry.length == 0) {
                        let rebateAmount = interestData.highestInterestAmount - interest.amount;
                        let debit = await models.customerTransactionDetail.create({ masterLoanId: loan.masterLoanId, loanId: loan.id, loanInterestId: interestData.id, debit: interest.amount, description: `Net interest due (after rebate) ${moment(interestData.emiDueDate).format('DD/MM/YYYY')}`, paymentDate: moment(), rebateAmount: rebateAmount }, { transaction: t });
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
                        interestAmount = await calculateInterestForParticularDueDate(interestData.emiReceivedDate, interestData.emiDueDate, stepUpSlab.interestRate, loan.outstandingAmount, false)


                        outstandingInterest = interestAmount - interestData.interestAmtPaidDuringQuickPay;
                        interestAccrual = interestAmount - interestData.interestAmtPaidDuringQuickPay;

                    } else {
                        outstandingInterest = interest.amount - interestData.interestAmtPaidDuringQuickPay;
                        interestAccrual = interest.amount - interestData.interestAmtPaidDuringQuickPay;
                        interestAmount = interest.amount
                    }


                    if (interestAccrual < 0) {
                        await models.customerLoanInterest.update({ interestAmount: interestAmount, totalInterestAccrual: interestAmount, outstandingInterest, interestAccrual: 0, interestRate: stepUpSlab.interestRate }, { where: { id: interestData.id, emiStatus: { [Op.notIn]: ['paid'] } }, transaction: t });
                    } else {
                        await models.customerLoanInterest.update({ interestAmount: interestAmount, totalInterestAccrual: interestAmount, outstandingInterest, interestAccrual, interestRate: stepUpSlab.interestRate }, { where: { id: interestData.id, emiStatus: { [Op.notIn]: ['paid'] } }, transaction: t });
                    }
                }
                //cal interest accural by no of days
                if (allInterest.length != interestLessThanDate.length) {
                    let pendingNoOfDays = noOfDays - (interestLessThanDate.length * loan.selectedSlab);
                    if (pendingNoOfDays > 0) {
                        let oneDayInterest = stepUpSlab.interestRate / 30;
                        let oneDayAmount = loan.outstandingAmount * (oneDayInterest / 100);
                        let pendingDaysAmount = pendingNoOfDays * oneDayAmount;
                        let nextInterest = await getPendingNoOfDaysInterest(loan.id, date);
                        if (nextInterest) {
                            let amount
                            let interestAccrual
                            if (nextInterest.interestPaidFrom == 'partPayment') {
                                pendingDaysAmount = await calculateInterestForParticularDueDate(nextInterest.emiReceivedDate, nextInterest.emiDueDate, stepUpSlab.interestRate, loan.outstandingAmount, false)
                                interestAccrual = await calculateInterestForParticularDueDate(nextInterest.emiReceivedDate, currentDate, stepUpSlab.interestRate, loan.outstandingAmount, false)
                                if (interestAccrual < 0) {
                                    await models.customerLoanInterest.update({ interestAccrual: 0.00, totalInterestAccrual: pendingDaysAmount, interestRate: stepUpSlab.interestRate, outstandingInterest: amount }, { where: { id: nextInterest.id, emiStatus: { [Op.notIn]: ['paid'] } }, transaction: t });
                                } else {
                                    await models.customerLoanInterest.update({ interestAccrual: interestAccrual, totalInterestAccrual: pendingDaysAmount, interestRate: stepUpSlab.interestRate, outstandingInterest: pendingDaysAmount }, { where: { id: nextInterest.id, emiStatus: { [Op.notIn]: ['paid'] } }, transaction: t });
                                }
                            } else {

                                if (nextInterest.isPartPaymentEverReceived) {
                                    pendingDaysAmount = await calculateInterestForParticularDueDate(nextInterest.emiReceivedDate, nextInterest.emiDueDate, stepUpSlab.interestRate, loan.outstandingAmount, false)
                                    interestAccrual = await calculateInterestForParticularDueDate(nextInterest.emiReceivedDate, currentDate, stepUpSlab.interestRate, loan.outstandingAmount, false)
                                }

                                if (interestAccrual == undefined) {
                                    interestAccrual = pendingDaysAmount
                                }

                                if (interestAccrual > Number(nextInterest.interestAmtPaidDuringQuickPay)) {
                                    amount = interestAccrual - nextInterest.interestAmtPaidDuringQuickPay;

                                    await models.customerLoanInterest.update({ interestAccrual: amount, totalInterestAccrual: pendingDaysAmount, interestRate: stepUpSlab.interestRate }, { where: { id: nextInterest.id, emiStatus: { [Op.notIn]: ['paid'] } }, transaction: t });
                                } else {
                                    amount = nextInterest.interestAmtPaidDuringQuickPay - pendingDaysAmount;

                                    await models.customerLoanInterest.update({ interestAccrual: 0.00, totalInterestAccrual: pendingDaysAmount, interestRate: stepUpSlab.interestRate }, { where: { id: nextInterest.id, emiStatus: { [Op.notIn]: ['paid'] } }, transaction: t });
                                }
                            }
                        }
                    }
                }

                //calculate extra interest
                if (interestGreaterThanDate.length == 0) {
                    let pendingNoOfDays = noOfDays - (interestLessThanDate.length * loan.selectedSlab);
                    if (pendingNoOfDays > 0) {
                        let oneDayInterest = stepUpSlab.interestRate / 30;
                        let oneDayAmount = loan.outstandingAmount * (oneDayInterest / 100);
                        let pendingDaysAmount = pendingNoOfDays * oneDayAmount;
                        let extraInterest = await getExtraInterest(loan.id);
                        //rebate
                        let oneDayInterestRebate = loan.rebateInterestRate / 30;
                        let oneDayAmountRebate = loan.outstandingAmount * (oneDayInterestRebate / 100);
                        let highestInterestAmount = pendingNoOfDays * oneDayAmountRebate;
                        let rebateAmount = highestInterestAmount - pendingDaysAmount;
                        //
                        if (!extraInterest) {
                            let amount = pendingDaysAmount;
                            await models.customerLoanInterest.create({ loanId: loan.id, masterLoanId: loan.masterLoanId, emiStartDate: date, emiDueDate: date, emiEndDate: date, interestRate: stepUpSlab.interestRate, interestAmount: amount, interestAccrual: amount, totalInterestAccrual: amount, outstandingInterest: amount, isExtraDaysInterest: true, rebateAmount, highestInterestAmount, rebateInterestRate: loan.rebateInterestRate }, { transaction: t });
                        } else {
                            let amount;
                            let interestAccrual
                            if (extraInterest.interestPaidFrom == 'partPayment' || extraInterest.isPartPaymentEverReceived) {
                                let startDate
                                let daysPlusOne = false
                                if (extraInterest.emiReceivedDate) {
                                    startDate = extraInterest.emiReceivedDate
                                } else {
                                    startDate = extraInterest.emiStartDate
                                    daysPlusOne = true
                                }
                                amount = await calculateInterestForParticularDueDate(startDate, currentDate, stepUpSlab.interestRate, loan.outstandingAmount, daysPlusOne)
                            } else {
                                amount = pendingDaysAmount
                            }
                            interestAccrual = amount - extraInterest.interestAmtPaidDuringQuickPay;

                            if (interestAccrual < 0) {
                                interestAccrual = 0
                            }
                            let outstandingInterest = amount - extraInterest.interestAmtPaidDuringQuickPay;
                            if (amount > Number(extraInterest.interestAmtPaidDuringQuickPay)) {
                                interestAccrual = amount - extraInterest.interestAmtPaidDuringQuickPay;
                                outstandingInterest = amount - extraInterest.interestAmtPaidDuringQuickPay;
                            } else {
                                interestAccrual = extraInterest.interestAmtPaidDuringQuickPay - amount;
                                outstandingInterest = extraInterest.interestAmtPaidDuringQuickPay - amount;
                            }
                            await models.customerLoanInterest.update({ interestAmount: amount, emiDueDate: date, emiEndDate: date, interestAccrual, totalInterestAccrual: amount, outstandingInterest, interestRate: stepUpSlab.interestRate, rebateAmount, highestInterestAmount, rebateInterestRate: loan.rebateInterestRate }, { where: { id: extraInterest.id }, transaction: t });
                        }
                    }
                }

                //update all interest amount
                for (const interestData of allInterest) {
                    let rebateAmount = interestData.highestInterestAmount - interest.interestAmtPaidDuringQuickPay;
                    let outstandingInterest
                    let interestAmount
                    if (interestData.interestPaidFrom == 'partPayment' || interestData.isPartPaymentEverReceived) {
                        // cal interest from emi received date 
                        outstandingInterest = await calculateInterestForParticularDueDate(interestData.emiReceivedDate, interestData.emiDueDate, stepUpSlab.interestRate, loan.outstandingAmount, false)

                        interestAmount = outstandingInterest
                        outstandingInterest = outstandingInterest - interestData.interestAmtPaidDuringQuickPay;
                    } else {
                        interestAmount = interest.amount
                        outstandingInterest = interest.amount - interestData.interestAmtPaidDuringQuickPay;
                    }

                    if (outstandingInterest > 0) {
                        await models.customerLoanInterest.update({ interestAmount: interestAmount, outstandingInterest, interestRate: stepUpSlab.interestRate, rebateAmount }, { where: { id: interestData.id, emiStatus: { [Op.notIn]: ['paid'] } }, transaction: t });
                    } else {
                        await models.customerLoanInterest.update({ interestAmount: interestAmount, outstandingInterest: 0.00, interestRate: stepUpSlab.interestRate, rebateAmount, emiStatus: "paid" }, { where: { id: interestData.id, emiStatus: { [Op.notIn]: ['paid'] } }, transaction: t });
                    }
                }
                //update last interest if does not match payment frequency changed
                if (!Number.isInteger(interest.length)) {
                    const noOfMonths = (((loan.masterLoan.tenure * 30) - ((allInterestTable.length - 1) * loan.selectedSlab)) / 30)
                    let oneMonthAmount = interest.amount / (loan.selectedSlab / 30);
                    let amount = (oneMonthAmount * noOfMonths).toFixed(2);
                    let lastInterest = await getLastInterest(loan.id, loan.masterLoanId)
                    let outstandingInterest
                    if (lastInterest.interestPaidFrom == 'partPayment' || lastInterest.isPartPaymentEverReceived) {
                        amount = await calculateInterestForParticularDueDate(lastInterest.emiReceivedDate, lastInterest.emiDueDate, stepUpSlab.interestRate, loan.outstandingAmount)
                        outstandingInterest = amount
                    } else {
                        outstandingInterest = amount - lastInterest.interestAmtPaidDuringQuickPay
                    }
                    let rebateAmount = lastInterest.highestInterestAmount - amount;
                    if (amount > 0) {
                        await models.customerLoanInterest.update({ interestAmount: amount, outstandingInterest, interestRate: stepUpSlab.interestRate, rebateAmount }, { where: { id: lastInterest.id, emiStatus: { [Op.notIn]: ['paid'] } }, transaction: t });
                    } else {
                        await models.customerLoanInterest.update({ interestAmount: amount, outstandingInterest: 0.00, interestRate: stepUpSlab.interestRate, rebateAmount,emiStatus:'paid' }, { where: { id: lastInterest.id, emiStatus: { [Op.notIn]: ['paid'] } }, transaction: t });
                    }
                }
                //update current slab in customer loan table
                await models.customerLoan.update({ currentInterestRate: stepUpSlab.interestRate, currentSlab: stepUpSlab.days }, { where: { id: loan.id }, transaction: t });
            } else {
                // scenario 1
                if (noOfDays > 0) {
                    let interest = await newSlabRateInterestCalcultaion(loan.outstandingAmount, loan.currentInterestRate, loan.selectedSlab, loan.masterLoan.tenure);
                    let allInterest = await getAllNotPaidInterest(loan.id)//get all interest
                    let interestLessThanDate = await getAllInterestLessThanDate(loan.id, date);
                    let interestGreaterThanDate = await getAllInterestGreaterThanDate(loan.id, date);
                    //update interestAccrual 
                    for (const interestData of interestLessThanDate) {
                        let isDueDate = moment(date).isSame(interestData.emiDueDate);
                        if (isDueDate) {
                            let checkDebitEntry = await models.customerTransactionDetail.findOne({ where: { masterLoanId: loan.masterLoanId, loanId: loan.id, loanInterestId: interestData.id, credit: 0.00, isPenalInterest: false } });
                            if (!checkDebitEntry) {
                                let debit = await models.customerTransactionDetail.create({ masterLoanId: loan.masterLoanId, loanId: loan.id, loanInterestId: interestData.id, debit: interestData.interestAmount, description: `Net interest due (after rebate) ${moment(interestData.emiDueDate).format('DD/MM/YYYY')}`, paymentDate: moment(), rebateAmount: interestData.rebateAmount }, { transaction: t });
                                await models.customerTransactionDetail.update({ referenceId: `${loan.loanUniqueId}-${debit.id}` }, { where: { id: debit.id }, transaction: t });
                            }
                        }

                        if (!Number.isInteger(interest.length) && interestGreaterThanDate.length == 0) {
                            const noOfMonths = (((loan.masterLoan.tenure * 30) - ((allInterestTable.length - 1) * loan.selectedSlab)) / 30)
                            let oneMonthAmount = interest.amount / (loan.selectedSlab / 30);
                            let amount = (oneMonthAmount * noOfMonths).toFixed(2);
                            let lastInterest = await getLastInterest(loan.id, loan.masterLoanId)
                            let interestAccrual = amount;
                            if (lastInterest.interestPaidFrom == 'partPayment') {
                                amount = await calculateInterestForParticularDueDate(lastInterest.emiReceivedDate, currentDate, loan.currentInterestRate, loan.outstandingAmount)
                            } else {
                                amount = amount - lastInterest.interestAmtPaidDuringQuickPay
                            }

                            if (interestAccrual < 0) {
                                await models.customerLoanInterest.update({ interestAccrual: 0, totalInterestAccrual: amount }, { where: { id: lastInterest.id, emiStatus: { [Op.notIn]: ['paid'] } }, transaction: t });
                            } else {
                                await models.customerLoanInterest.update({ interestAccrual, totalInterestAccrual: amount }, { where: { id: lastInterest.id, emiStatus: { [Op.notIn]: ['paid'] } }, transaction: t });
                            }
                        } else {
                            let interestAccrual = interest.amount;
                            if (interestData.interestPaidFrom == 'partPayment') {
                                interestAccrual = await calculateInterestForParticularDueDate(interestData.emiReceivedDate, currentDate, loan.currentInterestRate, loan.outstandingAmount)
                            } else {
                                interestAccrual = interestData.interestAmtPaidDuringQuickPay
                            }

                            if (interestAccrual < 0) {
                                await models.customerLoanInterest.update({ interestAccrual: 0, totalInterestAccrual: interest.amount }, { where: { id: interestData.id, emiStatus: { [Op.notIn]: ['paid'] } }, transaction: t });
                            } else {
                                await models.customerLoanInterest.update({ interestAccrual, totalInterestAccrual: interest.amount }, { where: { id: interestData.id, emiStatus: { [Op.notIn]: ['paid'] } }, transaction: t });
                            }
                        }
                        //current date == selected interest emi due date then debit
                    }

                    //update last interest if changed
                    // if (!Number.isInteger(interest.length)) {
                    //     const noOfMonths = (((loan.masterLoan.tenure * 30) - ((allInterestTable.length - 1) * loan.selectedSlab)) / 30)
                    //     let oneMonthAmount = interest.amount / (loan.selectedSlab / 30);
                    //     let amount = (oneMonthAmount * noOfMonths).toFixed(2);
                    //     let lastInterest = await getLastInterest(loan.id, loan.masterLoanId)
                    //     let interestAccrual = amount - lastInterest.paidAmount;
                    //     if(interestAccrual < 0){
                    //         await models.customerLoanInterest.update({ interestAccrual : 0,totalInterestAccrual:amount}, { where: { id: lastInterest.id, emiStatus: { [Op.notIn]: ['paid'] } }, transaction: t });
                    //     }else{
                    //         await models.customerLoanInterest.update({ interestAccrual,totalInterestAccrual:amount }, { where: { id: lastInterest.id, emiStatus: { [Op.notIn]: ['paid'] } }, transaction: t });
                    //     }
                    // }


                    if (allInterest.length != interestLessThanDate.length) {
                        let pendingNoOfDays = noOfDays - (interestLessThanDate.length * loan.selectedSlab);
                        if (pendingNoOfDays > 0) {
                            let oneDayInterest = loan.currentInterestRate / 30;
                            let oneDayAmount = loan.outstandingAmount * (oneDayInterest / 100);
                            let pendingDaysAmount = pendingNoOfDays * oneDayAmount;
                            let nextInterest = await getPendingNoOfDaysInterest(loan.id, date);
                            if (nextInterest) {
                                let amount
                                let interestAccrual
                                if (nextInterest.interestPaidFrom == 'partPayment') { //if previous interest settlement is done during part payment
                                    // cal interest from emi received date 
                                    pendingDaysAmount = await calculateInterestForParticularDueDate(nextInterest.emiReceivedDate, nextInterest.emiDueDate, loan.currentInterestRate, loan.outstandingAmount, false)
                                    interestAccrual = await calculateInterestForParticularDueDate(nextInterest.emiReceivedDate, currentDate, loan.currentInterestRate, loan.outstandingAmount, false)
                                    if (interestAccrual < 0) {
                                        await models.customerLoanInterest.update({ interestAccrual: 0.00, totalInterestAccrual: pendingDaysAmount, interestRate: loan.currentInterestRate, outstandingInterest: amount }, { where: { id: nextInterest.id, emiStatus: { [Op.notIn]: ['paid'] } }, transaction: t });
                                    } else {
                                        await models.customerLoanInterest.update({ interestAccrual: interestAccrual, totalInterestAccrual: pendingDaysAmount, interestRate: loan.currentInterestRate, outstandingInterest: pendingDaysAmount }, { where: { id: nextInterest.id, emiStatus: { [Op.notIn]: ['paid'] } }, transaction: t });
                                    }
                                } else {
                                    //if previous interest settlement is done during quick payment
                                    if (nextInterest.isPartPaymentEverReceived) {
                                        //if interest is ever received during part payments
                                        pendingDaysAmount = await calculateInterestForParticularDueDate(nextInterest.emiReceivedDate, nextInterest.emiDueDate, loan.currentInterestRate, loan.outstandingAmount, false)
                                        interestAccrual = await calculateInterestForParticularDueDate(nextInterest.emiReceivedDate, currentDate, loan.currentInterestRate, loan.outstandingAmount, false)
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
                    //Extra interest
                    //calculate extra interest
                    if (interestGreaterThanDate.length == 0) {
                        let pendingNoOfDays = 0;
                        if (!Number.isInteger(interest.length) && interestGreaterThanDate.length == 0) {
                            const noOfMonths = (((loan.masterLoan.tenure * 30) - ((allInterestTable.length - 1) * loan.selectedSlab)) / 30);
                            pendingNoOfDays = noOfDays - (30 * noOfMonths)
                        } else {
                            pendingNoOfDays = noOfDays - (interestLessThanDate.length * loan.selectedSlab);
                        }
                        if (pendingNoOfDays > 0) {
                            let oneDayInterest = loan.currentInterestRate / 30;
                            let oneDayAmount = loan.outstandingAmount * (oneDayInterest / 100);
                            let pendingDaysAmount = pendingNoOfDays * oneDayAmount;
                            let extraInterest = await getExtraInterest(loan.id);
                            if (!extraInterest) {
                                let amount = pendingDaysAmount;
                                await models.customerLoanInterest.create({ loanId: loan.id, masterLoanId: loan.masterLoanId, emiStartDate: date, emiDueDate: date, emiEndDate: date, interestRate: loan.currentInterestRate, interestAmount: amount, interestAccrual: amount, totalInterestAccrual: amount, outstandingInterest: amount, isExtraDaysInterest: true }, { transaction: t });
                            } else {
                                let amount;
                                let interestAccrual
                                let outstandingInterest
                                if (extraInterest.interestPaidFrom == 'partPayment' || extraInterest.isPartPaymentEverReceived) {
                                    let startDate
                                    let daysPlusOne = false
                                    if (extraInterest.emiReceivedDate) {
                                        startDate = extraInterest.emiReceivedDate
                                    } else {
                                        startDate = extraInterest.emiStartDate
                                        daysPlusOne = true
                                    }
                                    amount = await calculateInterestForParticularDueDate(startDate, currentDate, loan.currentInterestRate, loan.outstandingAmount, daysPlusOne)
                                } else {
                                    amount = pendingDaysAmount
                                }
                                if (amount > Number(extraInterest.interestAmtPaidDuringQuickPay)) {
                                    interestAccrual = amount - extraInterest.interestAmtPaidDuringQuickPay;
                                    outstandingInterest = amount - extraInterest.interestAmtPaidDuringQuickPay;
                                }
                                else {
                                    interestAccrual = extraInterest.interestAmtPaidDuringQuickPay - amount;
                                    outstandingInterest = extraInterest.interestAmtPaidDuringQuickPay - amount;
                                }
                                await models.customerLoanInterest.update({ interestAmount: amount, interestAccrual, emiDueDate: date, emiEndDate: date, totalInterestAccrual: amount, outstandingInterest }, { where: { id: extraInterest.id }, transaction: t });
                            }
                        }
                    }
                }
            }

            for (const interestData of allPaidInterest) {
                let checkDebitEntry = await models.customerTransactionDetail.findAll({ where: { masterLoanId: loan.masterLoanId, loanId: loan.id, loanInterestId: interestData.id, credit: 0.00, isPenalInterest: false } });
                if (checkDebitEntry.length == 0) {
                    let debit = await models.customerTransactionDetail.create({ masterLoanId: loan.masterLoanId, loanId: loan.id, loanInterestId: interestData.id, debit: interestData.interestAmount, description: `interest due ${moment(interestData.emiDueDate).format('DD/MM/YYYY')}`, paymentDate: interestData.updatedAt }, { transaction: t });
                    await models.customerTransactionDetail.update({ referenceId: `${loan.loanUniqueId}-${debit.id}` }, { where: { id: debit.id }, transaction: t });
                } else {
                    let debitedAmount = await checkDebitEntry.map((data) => Number(data.debit));
                    let totalDebitedAmount = _.sum(debitedAmount);
                    let newDebitAmount = interestData.interestAmount - totalDebitedAmount;
                    if (newDebitAmount > 0) {
                        let debit = await models.customerTransactionDetail.create({ masterLoanId: loan.masterLoanId, loanId: loan.id, loanInterestId: interestData.id, debit: newDebitAmount, description: `interest due ${moment(interestData.emiDueDate).format('DD/MM/YYYY')}`, paymentDate: interestData.updatedAt }, { transaction: t });
                        await models.customerTransactionDetail.update({ referenceId: `${loan.loanUniqueId}-${debit.id}` }, { where: { id: debit.id }, transaction: t });
                    }
                }
            }
        });

    }

    for (const loan of releasedLoanInfo) {
        await sequelize.transaction(async t => {

            let allpaidPartialyPaidInterest = await getAllPaidPartialyPaidInterest(loan.id);
            for (const interestData of allpaidPartialyPaidInterest) {
                let checkDebitEntry = await models.customerTransactionDetail.findAll({ where: { masterLoanId: loan.masterLoanId, loanId: loan.id, loanInterestId: interestData.id, credit: 0.00, isPenalInterest: false } });
                if (checkDebitEntry.length == 0) {
                    let debit = await models.customerTransactionDetail.create({ masterLoanId: loan.masterLoanId, loanId: loan.id, loanInterestId: interestData.id, debit: interestData.paidAmount, description: `interest due ${moment(interestData.emiDueDate).format('DD/MM/YYYY')}`, paymentDate: interestData.updatedAt }, { transaction: t });
                    await models.customerTransactionDetail.update({ referenceId: `${loan.loanUniqueId}-${debit.id}` }, { where: { id: debit.id }, transaction: t });
                } else {
                    let debitedAmount = await checkDebitEntry.map((data) => Number(data.debit));
                    let totalDebitedAmount = _.sum(debitedAmount);
                    let newDebitAmount = interestData.paidAmount - totalDebitedAmount;
                    if (newDebitAmount > 0) {
                        let debit = await models.customerTransactionDetail.create({ masterLoanId: loan.masterLoanId, loanId: loan.id, loanInterestId: interestData.id, debit: newDebitAmount, description: `interest due ${moment(interestData.emiDueDate).format('DD/MM/YYYY')}`, paymentDate: interestData.updatedAt }, { transaction: t });
                        await models.customerTransactionDetail.update({ referenceId: `${loan.loanUniqueId}-${debit.id}` }, { where: { id: debit.id }, transaction: t });
                    }
                }
            }
        })
    }
    return noOfDays;
}


//cron for daily penal interest calculation
exports.cronForDailyPenalInterest = async (date) => {

    let info = await calculationData();
    let data = info.loanInfo

    let penalData = []

    let { gracePeriodDays, noOfDaysInYear } = info
    for (let i = 0; i < data.length; i++) {
        let penal = (data[i].penalInterest / 100)
        let selectedSlab = data[i].selectedSlab
        let dataInfo = await getInterestTableOfSingleLoan(data[i].id)
        for (let j = 0; j < dataInfo.length; j++) {

            let penalObject = {}

            //due date from db
            const dueDate = moment(dataInfo[j].emiDueDate);
            let nextDueDate
            if (dataInfo[j + 1] == undefined) {
                nextDueDate = moment(date);
            } else {
                nextDueDate = moment(dataInfo[j + 1].emiDueDate)
            }
            //current date
            const currentDate = moment(date);
            let daysCount = currentDate.diff(dueDate, 'days');
            let daysCount2 = nextDueDate.diff(dueDate, 'days');
            if (daysCount <= gracePeriodDays) {
                break
            }
            if (daysCount < selectedSlab) {
                daysCount2 = currentDate.diff(dueDate, 'days');
            }
            if (dueDate > currentDate) {
                break
            }
            let penelInterest = Number((((data[i].outstandingAmount * penal) / noOfDaysInYear) * daysCount2).toFixed(2))
            let penalAccrual = penelInterest
            let penalOutstanding;
            if (dataInfo[j + 1] != undefined) {
                penalOutstanding = penalAccrual - dataInfo[j + 1].penalPaid
                // console.log("update", penalAccrual, dataInfo[j + 1].id)
                await models.customerLoanInterest.update({ penalInterest: penalAccrual, penalAccrual: penalAccrual, penalOutstanding: (penalOutstanding).toFixed(2) }, { where: { id: dataInfo[j + 1].id } })
                penalObject.id = dataInfo[j + 1].id
                penalObject.penalInterest = penalAccrual
                penalObject.penalAccrual = penalAccrual
                penalObject.penalOutstanding = (penalOutstanding).toFixed(2)
                penalData.push(penalObject)
            } else {
                penalAccrual = Number(penalAccrual) + Number(dataInfo[dataInfo.length - 1].penalAccrual)
                penalOutstanding = penalAccrual - dataInfo[j].penalPaid

                await models.customerLoanInterest.update({ penalInterest: penalAccrual, penalAccrual: penalAccrual, penalOutstanding: (penalOutstanding).toFixed(2) }, { where: { id: dataInfo[j].id } })

                penalObject.id = dataInfo[j].id
                penalObject.penalInterest = penalAccrual
                penalObject.penalAccrual = penalAccrual
                penalObject.penalOutstanding = (penalOutstanding).toFixed(2)
                penalData.push(penalObject)

            }
        }

        //add penal next code
        let transaction = []
        for (let j = 0; j < dataInfo.length; j++) {

            let detail = {}
            const currentDate = moment(date);
            const dueDate = moment(dataInfo[j].emiDueDate);
            if (dataInfo[j + 1] == undefined) {
                break;
            }
            const nextDueDate = moment(dataInfo[j + 1].emiDueDate)
            let daysCount = currentDate.diff(dueDate, 'days');
            let daysCount2 = nextDueDate.diff(dueDate, 'days');
            if (daysCount < selectedSlab) {
                // daysCount2 = currentDate.diff(dueDate, 'days');
                break;
            }
            if (dueDate > currentDate) {
                break
            }

            let checkDebitEntry = await models.customerTransactionDetail.findAll({ where: { masterLoanId: data[i].masterLoanId, loanId: data[i].id, loanInterestId: dataInfo[j + 1].id, credit: 0.00, isPenalInterest: true } });
            let penelInterest
            if (!check.isEmpty(checkDebitEntry)) {
                penelInterest = Number((((data[i].outstandingAmount * penal) / noOfDaysInYear) * daysCount2).toFixed(2))
                let debitedAmount = await checkDebitEntry.map((data) => Number(data.debit));
                let totalDebitedAmount = _.sum(debitedAmount);
                penelInterest = penelInterest - totalDebitedAmount;
            } else {
                penelInterest = Number((((data[i].outstandingAmount * penal) / noOfDaysInYear) * daysCount2).toFixed(2))
            }

            detail.masterLoanId = data[i].masterLoanId
            detail.loanId = data[0].id
            detail.loanInterestId = dataInfo[j + 1].id
            detail.debit = penelInterest
            detail.description = `penal interest`
            detail.isPenalInterest = true
            transaction.push(detail)
            detail = {}

        }
        if (transaction.length != 0) {
            await models.customerTransactionDetail.bulkCreate(transaction);
        }
        //add penal next code

        console.log(transaction)
    }
}
