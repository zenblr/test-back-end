const models = require('../models');
const sequelize = models.sequelize;
const Sequelize = models.Sequelize;
const Op = Sequelize.Op;
const check = require("../lib/checkLib");
const moment = require("moment");

let getGlobalSetting = async () => {
    let globalSettings = await models.globalSetting.getGlobalSetting();
    return globalSettings;
}

let getCustomerLoanId = async (masterLoanId) => {
    let loanData = await models.customerLoanMaster.findOne({
        where: { id: masterLoanId },
        include: [{
            model: models.customerLoan,
            as: 'customerLoan',
            attributes: ['id', 'loanType'],
            where: { isActive: true }
        }]
    });
    let loan = {}
    await loanData.customerLoan.map((data) => {
        if (data.loanType == "secured") {
            loan.secured = data.id;
        } else {
            loan.unsecured = data.id
        }
    });
    return loan
}

let getLoanDetails = async (masterLoanId) => {
    let loanData = await models.customerLoanMaster.findOne({
        where: { id: masterLoanId }
    })
    return loanData;
}

let getSchemeDetails = async (schemeId) => {
    let loanData = await models.scheme.findOne({
        where: { id: schemeId },
        include: [{
            model: models.schemeInterest,
            as: 'schemeInterest'
        }]
    })
    return loanData;
}

let getCustomerLoanDetails = async (loanId) => {
    let loanData = await models.customerLoan.findOne({
        where: { id: loanId }
    })
    return loanData;
}

let interestAmountCalculation = async (masterLoanId, id) => {
    let daysCount;
    let intrest;
    let checkMonths;
    let firstIntrest;
    let currentDate = moment();
    let amount = {
        interest: 0,
        penalInterest: 0
    }
    let globalSettings = await getGlobalSetting();
    let masterLona = await getLoanDetails(masterLoanId);
    let loan = await getCustomerLoanDetails(id);
    let schemeData = await getSchemeDetails(loan.schemeId);
    penalIntrestPercent = schemeData.penalInterest / 100;
    intrest = await models.customerLoanInterest.findOne({ where: { emiStatus: { [Op.in]: ["paid"] }, loanId: id }, order: [['emiDueDate', 'DESC']], attributes: ['emiReceivedDate', 'emiDueDate'] });
    if (intrest == null) {
        firstIntrest = await models.customerLoanInterest.findOne({ where: { loanId: id }, order: [['emiDueDate', 'ASC']], attributes: ['emiDueDate'] });
        let intrestStart = moment(firstIntrest.emiDueDate);
        daysCount = currentDate.diff(intrestStart, 'days');
        if (daysCount != 0) {
            if (globalSettings.gracePeriodDays < daysCount) {
                amount.penalInterest = Number(loan.loanAmount) * penalIntrestPercent / 360 * daysCount;
            }
        }
    } else {
        let lastPaid = moment(intrest.emiDueDate);
        checkMonths = currentDate.diff(lastPaid, "months");
        daysCount = currentDate.diff(lastPaid, 'days');

        if (daysCount != 0) {
            if (checkMonths != 0) {
                if (globalSettings.gracePeriodDays < daysCount) {
                    amount.penalInterest = Number(loan.loanAmount) * penalIntrestPercent / 360 * daysCount;
                }
            } else {
                amount.interest = Number(loan.loanAmount) * (15.96 / 100) / 360 * daysCount;
            }
        }
    }
    return amount
}

let getAllCustomerLoanId = async () => {
    let stageId = await models.loanStage.findOne({ where: { name: 'disbursed' } })
    let masterLona = await models.customerLoanMaster.findAll({
        order: [
            [models.customerLoan, 'id', 'asc']
        ],
        where: {
            isActive: true,
            loanStageId: stageId.id,
            "$partRelease$": null
        },
        attributes: ['id'],
        include: [
            {
                model: models.partRelease,
                as: 'partRelease',
                attributes: ['amountStatus']
            }, {
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

let getAllDetailsOfCustomerLoan = async (customerLoanId) => {
    let loanData = await models.customerLoan.findOne({
        where: { id: customerLoanId },
        order: [
            ['id', 'asc'],
            [models.customerLoanInterest, 'id', 'asc'],
        ],
        attributes: ['id', 'masterLoanId', 'selectedSlab', 'loanAmount', 'outstandingAmount', 'currentSlab', 'currentInterestRate', 'penalInterestLastReceivedDate'],
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

let getInterestTableOfSingleLoan = async (customerLoanId) => {
    let data = await models.customerLoanInterest.findAll({
        where: {
            loanId: customerLoanId,
            emiStatus: { [Op.notIn]: ['paid'] },
        },
        order: [['id', 'asc']],
        attributes: { exclude: ['createdAt', 'updatedAt', 'createdBy', 'modifiedBy', 'isActive'] },
    })
    return data
}

let calculationData = async () => {
    let customerLoanId = await getAllCustomerLoanId();
    let loanInfo = [];
    for (const id of customerLoanId) {
        let info = await getAllDetailsOfCustomerLoan(id);
        loanInfo.push(info);
    }
    let noOfDaysInYear = 360
    let global = await models.globalSetting.findAll()
    let { gracePeriodDays } = global[0]
    return { noOfDaysInYear, gracePeriodDays, loanInfo };
}

let checkPaidInterest = async (loanId, masterLaonId) => {
    let checkDailyAmount = await models.customerLoanInterest.findOne({
        where: { loanId: loanId, masterLoanId: masterLaonId, emiStatus: 'paid' },
        order: [['emiReceivedDate', 'DESC']]
    })
    return checkDailyAmount
}

let getInterestOfSelectedMonth = async (loanId, currentMonth, currentYear) => {
    let getMonthInterest = await models.customerLoanInterest.findAll({
        where: {
            [Op.and]: [
                sequelize.where(sequelize.fn("date_part", 'MONTH', sequelize.col('emi_due_date')), currentMonth),
                sequelize.where(sequelize.fn("date_part", 'YEAR', sequelize.col('emi_due_date')), currentYear),
                { loanId: loanId }
            ]
        },
        order: [['emiDueDate', 'ASC']]
    })

    return getMonthInterest
}

let getFirstInterest = async (loanId, masterLaonId) => {
    let firstInterest = await models.customerLoanInterest.findOne({
        where: { loanId: loanId, masterLoanId: masterLaonId },
        order: [['emiDueDate', 'ASC']]
    })
    return firstInterest
}

let calculation = async (noOfDays, interestRate, loanAmount, paidAmount) => {
    let oneDayInterest = interestRate / 30;
    let oneDayAmount = loanAmount * (oneDayInterest / 100);
    let amount = oneDayAmount * noOfDays;
    let totalAmount = (Math.round(amount * 100) / 100) - paidAmount;
    if (totalAmount < 0) {
        return 0
    } else {
        return totalAmount;
    }
}

let newSlabRateInterestCalcultaion = async (loanAmount, interestRate, paymentFrequency, tenure) => {
    let amount = ((Number(loanAmount) * (Number(interestRate) * 12 / 100)) * Number(paymentFrequency)
        / 360).toFixed(2);
    let length = (tenure * 30) / paymentFrequency
    return { amount, length }
}

let getStepUpslab = async (loanId, noOfDys) => {
    let stepUpSlab = await models.customerLoanSlabRate.findOne({
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

let getLastInterest = async (loanId, masterLaonId) => {
    let lastInterest = await models.customerLoanInterest.findOne({
        where: { loanId: loanId, masterLoanId: masterLaonId },
        order: [['emiDueDate', 'DESC']],
        attributes: ['id', 'paidAmount']
    });
    return lastInterest;
}

let getAllNotPaidInterest = async (loanId) => {
    let allNotPaidInterest = await models.customerLoanInterest.findAll({
        where: { loanId: loanId, emiStatus: { [Op.notIn]: ['paid'] } },
        attributes: ['id', 'paidAmount']
    });
    return allNotPaidInterest;
}

let getAllInterestLessThanDate = async (loanId, date) => {
    let allInterestLessThanDate = await models.customerLoanInterest.findAll({
        where: { loanId: loanId, emiDueDate: { [Op.lte]: date, }, emiStatus: { [Op.notIn]: ['paid'] } },
        attributes: ['id', 'paidAmount']
    });
    return allInterestLessThanDate;
}

let getPendingNoOfDaysInterest = async (loanId, date) => {
    let pendingNoOfDaysInterest = await models.customerLoanInterest.findOne({
        where: { loanId: loanId, emiDueDate: { [Op.gt]: date, }, emiStatus: { [Op.notIn]: ['paid'] } },
        attributes: ['id', 'paidAmount'],
        order: [['emiDueDate', 'ASC']]
    });
    return pendingNoOfDaysInterest;
}

let penal = async (loanId) => {
    console.log(loanId)

}

//cron for daily interest calculation
let dailyIntrestCalculation = async (date) => {
    let data = await calculationData();
    let loanInfo = data.loanInfo;
    let currentDate = moment(date);
    await sequelize.transaction(async t => {
        for (const loan of loanInfo) {
            let lastPaidEmi = await checkPaidInterest(loan.id, loan.masterLoanId);
            if (!lastPaidEmi) {
                let loanStartDate = moment(loan.masterLoan.loanStartDate);
                let noOfDays = currentDate.diff(loanStartDate, 'days');
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
                    let firstInterest = await getFirstInterest(loan.id, loan.masterLoanId);
                    let amount = await calculation(noOfDays, loan.currentInterestRate, loan.outstandingAmount, firstInterest.paidAmount);

                    await models.customerLoanInterest.update({ interestAccrual: amount }, { where: { id: firstInterest.id },emiStatus: { [Op.notIn]: ['paid'] }, transaction: t });

                }
            }
        }
    });
    return "success";
}


//cron for daily penal interest calculation
let cronForDailyPenalInterest = async () => {
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


module.exports = {
    getCustomerLoanId: getCustomerLoanId,
    interestAmountCalculation, interestAmountCalculation,
    getGlobalSetting: getGlobalSetting,
    getLoanDetails: getLoanDetails,
    getSchemeDetails: getSchemeDetails,
    getAllCustomerLoanId: getAllCustomerLoanId,
    getAllDetailsOfCustomerLoan: getAllDetailsOfCustomerLoan,
    calculationData: calculationData,
    cronForDailyPenalInterest: cronForDailyPenalInterest,
    dailyIntrestCalculation: dailyIntrestCalculation,
    penal: penal
}