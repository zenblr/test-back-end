const models = require('../models');
const sequelize = models.sequelize;
const Sequelize = models.Sequelize;
const Op = Sequelize.Op;
const check = require("../lib/checkLib");
const moment = require("moment");
const _ = require('lodash');
let { getFirstInterestToPay, getExtraInterest, getAllInterestGreaterThanDate, getInterestTableOfSingleLoan, calculationData, checkPaidInterest, getFirstInterest, calculation, newSlabRateInterestCalcultaion, getStepUpslab, getAllNotPaidInterest, getAllInterestLessThanDate, getPendingNoOfDaysInterest, getLastInterest } = require('./loanFunction')

//cron for daily interest calculation
exports.dailyIntrestCalculation = async (date) => {
    let data = await calculationData();
    let loanInfo = data.loanInfo;
    let currentDate = moment(date);
    let noOfDays = 0;
    await sequelize.transaction(async t => {
        for (const loan of loanInfo) {
            let lastPaidEmi = await checkPaidInterest(loan.id, loan.masterLoanId);
            let firstInterestToPay = await getFirstInterestToPay(loan.id, loan.masterLoanId);
            let loanStartDate;
            if (!lastPaidEmi) {
                loanStartDate = moment(loan.masterLoan.loanStartDate);
                noOfDays = currentDate.diff(loanStartDate, 'days');
            } else {
                loanStartDate = moment(lastPaidEmi.emiDueDate);
                noOfDays = currentDate.diff(loanStartDate, 'days');
            }
            if (firstInterestToPay) {
                var checkDueDateForSlab = moment(date).isAfter(firstInterestToPay.emiDueDate);//check due date to change slab
            }
            if (noOfDays > loan.currentSlab && checkDueDateForSlab) {
                //scenario 2 slab changed
                let stepUpSlab = await getStepUpslab(loan.id, noOfDays);
                let interest = await newSlabRateInterestCalcultaion(loan.outstandingAmount, stepUpSlab.interestRate, loan.selectedSlab, loan.masterLoan.tenure);
                let allInterest = await getAllNotPaidInterest(loan.id)//get all interest
                let interestLessThanDate = await getAllInterestLessThanDate(loan.id, date);
                let interestGreaterThanDate = await getAllInterestGreaterThanDate(loan.id, date);
                //update interestAccrual & interest amount //here to debit amount
                for (const interestData of interestLessThanDate) {
                    let checkDebitEntry = await models.customerTransactionDetail.findAll({ where: { masterLoanId: loan.masterLoanId, loanId: loan.id, loanInterestId: interestData.id, description: { [Op.in]: [`interest due ${interestData.emiDueDate}`, `stepUpInterest ${interestData.emiDueDate}`] } } });
                    if (checkDebitEntry.length == 0) {
                        let debit = await models.customerTransactionDetail.create({ masterLoanId: loan.masterLoanId, loanId: loan.id, loanInterestId: interestData.id, debit: interest.amount, description: `interest due ${interestData.emiDueDate}` }, { transaction: t });
                        await models.customerTransactionDetail.update({ referenceId: `${loan.loanUniqueId}-${debit.id}` }, { where: { id: debit.id }, transaction: t });
                    } else {
                        let debitedAmount = await checkDebitEntry.map((data) => Number(data.debit));
                        let totalDebitedAmount = _.sum(debitedAmount);
                        let newDebitAmount = interest.amount - totalDebitedAmount;
                        if (newDebitAmount > 0) {
                            let debit = await models.customerTransactionDetail.create({ masterLoanId: loan.masterLoanId, loanId: loan.id, loanInterestId: interestData.id, debit: newDebitAmount, description: `stepUpInterest ${interestData.emiDueDate}` }, { transaction: t });
                            await models.customerTransactionDetail.update({ referenceId: `${loan.loanUniqueId}-${debit.id}` }, { where: { id: debit.id }, transaction: t });
                        }
                    }
                    let outstandingInterest = interest.amount - interestData.paidAmount;
                    let interestAccrual = interest.amount - interestData.paidAmount;
                    await models.customerLoanInterest.update({ interestAmount: interest.amount, totalInterestAccrual: interest.amount, outstandingInterest, interestAccrual, interestRate: stepUpSlab.interestRate }, { where: { id: interestData.id, emiStatus: { [Op.notIn]: ['paid'] } }, transaction: t });
                }

                if (allInterest.length != interestLessThanDate.length) {
                    let pendingNoOfDays = noOfDays - (interestLessThanDate.length * loan.selectedSlab);
                    if (pendingNoOfDays > 0) {
                        let oneDayInterest = stepUpSlab.interestRate / 30;
                        let oneDayAmount = loan.outstandingAmount * (oneDayInterest / 100);
                        let pendingDaysAmount = pendingNoOfDays * oneDayAmount;
                        let nextInterest = await getPendingNoOfDaysInterest(loan.id, date);
                        if (nextInterest) {
                            let amount = pendingDaysAmount - nextInterest.paidAmount;
                            await models.customerLoanInterest.update({ totalInterestAccrual: pendingDaysAmount, interestAccrual: amount, interestRate: stepUpSlab.interestRate, outstandingInterest: amount }, { where: { id: nextInterest.id, emiStatus: { [Op.notIn]: ['paid'] } }, transaction: t });
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
                        if (!extraInterest) {
                            let amount = pendingDaysAmount;
                            await models.customerLoanInterest.create({ loanId: loan.id, masterLoanId: loan.masterLoanId, emiStartDate: date, emiDueDate: date, emiEndDate: date, interestRate: stepUpSlab.interestRate, interestAmount: amount, interestAccrual: amount, totalInterestAccrual: amount, outstandingInterest: amount, isExtraDaysInterest: true }, { transaction: t });
                        } else {
                            let amount = pendingDaysAmount;
                            let interestAccrual = amount - extraInterest.paidAmount;
                            let outstandingInterest = amount - extraInterest.paidAmount;
                            await models.customerLoanInterest.update({ interestAmount: amount, emiDueDate: date, emiEndDate: date, interestAccrual, totalInterestAccrual: amount, outstandingInterest, interestRate: stepUpSlab.interestRate }, { where: { id: extraInterest.id }, transaction: t });
                        }
                    }
                }
                //update all interest amount
                for (const interestData of allInterest) {
                    let outstandingInterest = interest.amount - interestData.paidAmount;
                    await models.customerLoanInterest.update({ interestAmount: interest.amount, outstandingInterest, interestRate: stepUpSlab.interestRate }, { where: { id: interestData.id, emiStatus: { [Op.notIn]: ['paid'] } }, transaction: t });
                }
                //update last interest if changed
                if (!Number.isInteger(interest.length)) {
                    const noOfMonths = (((loan.masterLoan.tenure * 30) - ((interest.length - 1) * loan.selectedSlab)) / 30)
                    let oneMonthAmount = interest.amount / (stepUpSlab.days / 30);
                    let amount = (oneMonthAmount * noOfMonths).toFixed(2);
                    let lastInterest = await getLastInterest(loan.id, loan.masterLoanId)
                    let outstandingInterest = amount - lastInterest.paidAmount;
                    await models.customerLoanInterest.update({ interestAmount: amount, outstandingInterest, interestRate: stepUpSlab.interestRate }, { where: { id: lastInterest.id, emiStatus: { [Op.notIn]: ['paid'] } }, transaction: t });
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
                            let checkDebitEntry = await models.customerTransactionDetail.findOne({ where: { masterLoanId: loan.masterLoanId, loanId: loan.id, loanInterestId: interestData.id, description: `interest due ${interestData.emiDueDate}` } });
                            if (!checkDebitEntry) {
                                let debit = await models.customerTransactionDetail.create({ masterLoanId: loan.masterLoanId, loanId: loan.id, loanInterestId: interestData.id, debit: interestData.interestAmount, description: `interest due ${interestData.emiDueDate}` }, { transaction: t });
                                await models.customerTransactionDetail.update({ referenceId: `${loan.loanUniqueId}-${debit.id}` }, { where: { id: debit.id }, transaction: t });
                            }
                        }
                        let interestAccrual = interest.amount - interestData.paidAmount;
                        await models.customerLoanInterest.update({ interestAccrual, totalInterestAccrual: interest.amount }, { where: { id: interestData.id, emiStatus: { [Op.notIn]: ['paid'] } }, transaction: t });
                        //current date == selected interest emi due date then debit
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
                                await models.customerLoanInterest.update({ interestAccrual: amount, totalInterestAccrual: pendingDaysAmount }, { where: { id: nextInterest.id, emiStatus: { [Op.notIn]: ['paid'] } }, transaction: t });
                            }
                        }
                    }
                    //Extra interest
                    //calculate extra interest
                    if (interestGreaterThanDate.length == 0) {
                        let pendingNoOfDays = noOfDays - (interestLessThanDate.length * loan.selectedSlab);
                        if (pendingNoOfDays > 0) {
                            let oneDayInterest = loan.currentInterestRate / 30;
                            let oneDayAmount = loan.outstandingAmount * (oneDayInterest / 100);
                            let pendingDaysAmount = pendingNoOfDays * oneDayAmount;
                            let extraInterest = await getExtraInterest(loan.id);
                            if (!extraInterest) {
                                let amount = pendingDaysAmount;
                                await models.customerLoanInterest.create({ loanId: loan.id, masterLoanId: loan.masterLoanId, emiStartDate: date, emiDueDate: date, emiEndDate: date, interestRate: loan.currentInterestRate, interestAmount: amount, interestAccrual: amount, totalInterestAccrual: amount, outstandingInterest: amount, isExtraDaysInterest: true }, { transaction: t });
                            } else {
                                let amount = pendingDaysAmount;
                                let interestAccrual = amount - extraInterest.paidAmount;
                                let outstandingInterest = amount - extraInterest.paidAmount;
                                await models.customerLoanInterest.update({ interestAmount: amount, interestAccrual, emiDueDate: date, emiEndDate: date, totalInterestAccrual: amount, outstandingInterest }, { where: { id: extraInterest.id }, transaction: t });
                            }
                        }
                    }
                }
            }
        }
    });
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
                await models.customerLoanInterest.update({ penalInterest: penalAccrual, penalAccrual: penalAccrual, penalOutstanding: penalOutstanding }, { where: { id: dataInfo[j + 1].id } })
                penalObject.id = dataInfo[j + 1].id
                penalObject.penalInterest = penalAccrual
                penalObject.penalAccrual = penalAccrual
                penalObject.penalOutstanding = penalOutstanding
                penalData.push(penalObject)
            } else {
                penalAccrual = Number(penalAccrual) + Number(dataInfo[dataInfo.length - 1].penalAccrual)
                penalOutstanding = penalAccrual - dataInfo[j].penalPaid
                // console.log("update", penalAccrual, dataInfo[j].id)
                await models.customerLoanInterest.update({ penalInterest: penalAccrual, penalAccrual: penalAccrual, penalOutstanding: penalOutstanding }, { where: { id: dataInfo[j].id } })
                
                penalObject.id = dataInfo[j + 1].id
                penalObject.penalInterest = penalAccrual
                penalObject.penalAccrual = penalAccrual
                penalObject.penalOutstanding = penalOutstanding
                penalData.push(penalObject)

            }


        }
    }
}
