const models = require('../models');
const sequelize = models.sequelize;
const Sequelize = models.Sequelize;
const Op = Sequelize.Op;
const check = require("../lib/checkLib");
const moment = require("moment");

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
                //update interestAccrual & interest amount
                for (const interestData of interestLessThanDate) {
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
                            let outstandingInterest = interest.amount - nextInterest.paidAmount;
                            await models.customerLoanInterest.update({ interestAccrual: amount, interestRate: stepUpSlab.interestRate, outstandingInterest }, { where: { id: nextInterest.id, emiStatus: { [Op.notIn]: ['paid'] } }, transaction: t });
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
                    let oneMonthAmount = interest.amount / masterLoan.tenure;
                    let amount = oneMonthAmount * Math.ceil(interest.length).toFixed(2);
                    let lastInterest = await getLastInterest(loan.id, loan.masterLoanId)
                    let outstandingInterest = interest.amount - lastInterest.paidAmount;
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
                        let interestAccrual = interest.amount - interestData.paidAmount;
                        await models.customerLoanInterest.update({ interestAccrual }, { where: { id: interestData.id, emiStatus: { [Op.notIn]: ['paid'] } }, transaction: t });
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
exports.cronForDailyPenalInterest = async () => {
    let info = await calculationData();
    let data = info.loanInfo
    let { gracePeriodDays, noOfDaysInYear } = info
    for (let i = 0; i < data.length; i++) {
        let penal = (data[i].penalInterest / 100)
        console.log(penal)
        let dataInfo = await getInterestTableOfSingleLoan(data[i].id)
        //due date from db
        let dueDateFromDb = dataInfo[0].emiDueDate
        const dueDate = moment(dueDateFromDb);
        //current date
        let inDate = moment(moment.utc(moment(new Date())).toDate()).format('YYYY-MM-DD');
        const currentDate = moment(inDate);
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
                console.log(penelInterest, data[i].id, daysCount)
                await models.customerLoanInterest.update({ PenalAccrual: penelInterest }, { where: { id: dataInfo[0].id } })
            }
        }
    }
}
