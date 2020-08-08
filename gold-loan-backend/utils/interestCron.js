const models = require('../models');
const sequelize = models.sequelize;
const Sequelize = models.Sequelize;
const Op = Sequelize.Op;
const check = require("../lib/checkLib");
const moment = require("moment");

let {  getInterestTableOfSingleLoan, calculationData, checkPaidInterest, getFirstInterest, calculation, newSlabRateInterestCalcultaion, getStepUpslab } = require('./loanFunction')

//cron for daily interest calculation
exports.dailyIntrestCalculation = async (date) => {
    let data = await calculationData();
    let loanInfo = data.loanInfo;
    let currentDate = moment(date);
    await sequelize.transaction(async t => {
        for (const loan of loanInfo) {
            let lastPaidEmi = await checkPaidInterest(loan.id, loan.masterLoanId);
            let noOfDays = 0;
            let loanStartDate;
            if (!lastPaidEmi) {
                loanStartDate = moment(loan.masterLoan.loanStartDate);
                noOfDays = currentDate.diff(loanStartDate, 'days');
            } else {
                loanStartDate = moment(lastPaidEmi.emiDueDate);
                noOfDays = currentDate.diff(loanStartDate, 'days');
            }
            if (noOfDays > loan.currentSlab) {
                //scenario 2
                let stepUpSlab = await getStepUpslab(loan.id, noOfDays);
                let interest = await newSlabRateInterestCalcultaion(loan.outstandingAmount, stepUpSlab.interestRate, loan.selectedSlab, loan.masterLoan.tenure);
                let allInterest = await getAllNotPaidInterest(loan.id)//get all interest
                let interestLessThanDate = await getAllInterestLessThanDate(loan.id, date);
                //update interestAccrual & interest amount
                for (const interestData of interestLessThanDate) {
                    let outstandingInterest = interest.amount - interestData.paidAmount;
                    await models.customerLoanInterest.update({ interestAmount: interest.amount, outstandingInterest, interestAccrual: interest.amount }, { where: { id: interestData.id, emiStatus: { [Op.notIn]: ['paid'] } }, transaction: t });
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
                            await models.customerLoanInterest.update({ interestAccrual: amount }, { where: { id: nextInterest.id, emiStatus: { [Op.notIn]: ['paid'] } }, transaction: t });
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
                    let oneMonthAmount = interest.amount / masterLoan.tenure;
                    let amount = oneMonthAmount * Math.ceil(interest.length).toFixed(2);
                    let lastInterest = await getLastInterest(loan.id, loan.masterLoanId)
                    let outstandingInterest = amount - lastInterest.paidAmount
                    await models.customerLoanInterest.update({ interestAmount: amount, outstandingInterest }, { where: { id: lastInterest.id, emiStatus: { [Op.notIn]: ['paid'] } }, transaction: t });
                }
            } else {
                // scenario 1
                if (noOfDays > 0) {
                    let firstInterest = await getFirstInterest(loan.id, loan.masterLoanId);
                    let amount = await calculation(noOfDays, loan.currentInterestRate, loan.outstandingAmount, firstInterest.paidAmount);
                    await models.customerLoanInterest.update({ interestAccrual: amount }, { where: { id: firstInterest.id }, emiStatus: { [Op.notIn]: ['paid'] }, transaction: t });
                }
            }
        }
    });
    return "success";
}


//cron for daily penal interest calculation
exports.cronForDailyPenalInterest = async () => {
    let info = await calculationData();
    let data = info.loanInfo
    let { gracePeriodDays, noOfDaysInYear } = info
    for (let i = 0; i < data.length; i++) {
        let penal = (data[i].scheme.penalInterest / 100)
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
