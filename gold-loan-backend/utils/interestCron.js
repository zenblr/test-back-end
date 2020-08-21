const models = require('../models');
const sequelize = models.sequelize;
const Sequelize = models.Sequelize;
const Op = Sequelize.Op;
const check = require("../lib/checkLib");
const moment = require("moment");
const _ = require('lodash');
let { getInterestTableOfSingleLoan, calculationData, checkPaidInterest, getFirstInterest, calculation, newSlabRateInterestCalcultaion, getStepUpslab, getAllNotPaidInterest, getAllInterestLessThanDate, getPendingNoOfDaysInterest, getLastInterest } = require('./loanFunction')

//cron for daily interest calculation
exports.dailyIntrestCalculation = async (date) => {
    let data = await calculationData();
    let loanInfo = data.loanInfo;
    let currentDate = moment(date);
    let noOfDays = 0;
    await sequelize.transaction(async t => {
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
            if (noOfDays > loan.currentSlab) {
                //scenario 2 slab changed
                let stepUpSlab = await getStepUpslab(loan.id, noOfDays);
                let interest = await newSlabRateInterestCalcultaion(loan.outstandingAmount, stepUpSlab.interestRate, loan.selectedSlab, loan.masterLoan.tenure);
                let allInterest = await getAllNotPaidInterest(loan.id)//get all interest
                let interestLessThanDate = await getAllInterestLessThanDate(loan.id, date);
                //update interestAccrual & interest amount //here to debit amount
                for (const interestData of interestLessThanDate) {
                    let checkDebitEntry = await models.customerTransactionDetail.findAll({ where: { masterLoanId: loan.masterLoanId, loanId: loan.id, loanInterestId: interestData.id, description: { [Op.in]: [`interest ${interestData.emiDueDate}`, `stepUpInterest ${interestData.emiDueDate}`] } } });
                    if (checkDebitEntry.length==0) {
                        let  debit = await models.customerTransactionDetail.create({ masterLoanId: loan.masterLoanId, loanId: loan.id, loanInterestId: interestData.id, debit: interest.amount, description: `interest ${interestData.emiDueDate}` }, { transaction: t });
                        await models.customerTransactionDetail.update({referenceId:`${loan.loanUniqueId}-${debit.id}`},{where:{id:debit.id},transaction: t});
                    } else {
                        let debitedAmount = await checkDebitEntry.map((data) => Number(data.debit));
                        let totalDebitedAmount = _.sum(debitedAmount);
                        let newDebitAmount = interest.amount - totalDebitedAmount;
                        if (newDebitAmount > 0) {
                            let debit = await models.customerTransactionDetail.create({ masterLoanId: loan.masterLoanId, loanId: loan.id, loanInterestId: interestData.id, debit: newDebitAmount, description: `stepUpInterest ${interestData.emiDueDate}` }, { transaction: t });
                            await models.customerTransactionDetail.update({referenceId:`${loan.loanUniqueId}-${debit.id}`},{where:{id:debit.id},transaction: t});
                        }
                    }
                    let outstandingInterest = interest.amount - interestData.paidAmount;
                    let interestAccrual = interest.amount - interestData.paidAmount;
                    await models.customerLoanInterest.update({ interestAmount: interest.amount, outstandingInterest, interestAccrual, interestRate: stepUpSlab.interestRate }, { where: { id: interestData.id, emiStatus: { [Op.notIn]: ['paid'] } }, transaction: t });
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
                            await models.customerLoanInterest.update({ interestAccrual: amount, interestRate: stepUpSlab.interestRate, outstandingInterest: amount }, { where: { id: nextInterest.id, emiStatus: { [Op.notIn]: ['paid'] } }, transaction: t });
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
                    let oneMonthAmount = interest.amount / (stepUpSlab.days / 30);
                    let amount = oneMonthAmount * Math.ceil(interest.length).toFixed(2);
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
                    //update interestAccrual 
                    for (const interestData of interestLessThanDate) {
                        let isDueDate = moment(date).isSame(interestData.emiDueDate);
                        if (isDueDate) {
                            let checkDebitEntry = await models.customerTransactionDetail.findOne({ where: { masterLoanId: loan.masterLoanId, loanId: loan.id, loanInterestId: interestData.id, description: `interest ${interestData.emiDueDate}` } });
                            if (!checkDebitEntry) {
                                let debit = await models.customerTransactionDetail.create({ masterLoanId: loan.masterLoanId, loanId: loan.id, loanInterestId: interestData.id, debit: interestData.interestAmount, description: `interest ${interestData.emiDueDate}` }, { transaction: t });
                                await models.customerTransactionDetail.update({referenceId:`${loan.loanUniqueId}-${debit.id}`},{where:{id:debit.id},transaction: t});
                            }
                        }
                        let interestAccrual = interest.amount - interestData.paidAmount;
                        await models.customerLoanInterest.update({ interestAccrual }, { where: { id: interestData.id, emiStatus: { [Op.notIn]: ['paid'] } }, transaction: t });
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
                                await models.customerLoanInterest.update({ interestAccrual: amount }, { where: { id: nextInterest.id, emiStatus: { [Op.notIn]: ['paid'] } }, transaction: t });
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
    let { gracePeriodDays, noOfDaysInYear } = info
    for (let i = 0; i < data.length; i++) {
        let penal = (data[i].penalInterest / 100)
        let dataInfo = await getInterestTableOfSingleLoan(data[i].id)
        //due date from db
        let dueDateFromDb = dataInfo[0].emiDueDate
        const dueDate = moment(dueDateFromDb);
        //current date
        // let inDate = moment(moment.utc(moment(new Date())).toDate()).format('YYYY-MM-DD');
        const currentDate = moment(date);
        //diff between current and last emiDueDate date
        let daysCount = currentDate.diff(dueDateFromDb, 'days');
        if (currentDate > dueDate) {
            if (daysCount > gracePeriodDays) {
                var penelInterest
                //last penal paid date
                var lastPenalPaid = moment(data[i].penalInterestLastReceivedDate)
                if (data[i].penalInterestLastReceivedDate == null) {
                    penelInterest = Number((((data[i].outstandingAmount * penal) / noOfDaysInYear) * daysCount).toFixed(2))
                } else {
                    //diff between current and last penal paid date
                    daysCount = currentDate.diff(lastPenalPaid, 'days');
                    penelInterest = Number((((data[i].outstandingAmount * penal) / noOfDaysInYear) * daysCount).toFixed(2))
                }
                let penalOutstanding = penelInterest - dataInfo[0].penalPaid
                // console.log(penelInterest, data[i].id, daysCount, penalOutstanding, dataInfo[0].penalPaid)
                await models.customerLoanInterest.update({ PenalAccrual: penelInterest, penalOutstanding }, { where: { id: dataInfo[0].id } })
            }
        }
    }
}
