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
        order: [['emiDueDate', 'DESC']]
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
    let length = (tenure * 30) / paymentFrequency;
    if(amount < 0){
        amount = 0
    }
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

let mergeInterestTable = async (masterLoanId) => {

    let interestTable = await models.customerLoanMaster.findOne({
        where: { id: masterLoanId },
        attributes: ['id', 'isUnsecuredSchemeApplied'],
        order: [
            [models.customerLoan, 'id', 'asc'],
            [models.customerLoan, models.customerLoanInterest, 'id', 'asc'],
        ],
        include: [{
            model: models.customerLoan,
            as: 'customerLoan',
            attributes: ['id'],
            include: [{
                model: models.customerLoanInterest,
                as: 'customerLoanInterest',
                attributes: { exclude: ['createdAt', 'updatedAt', 'createdBy', 'modifiedBy', 'isActive'] },
            }]
        }]
    })
    let securedTable = interestTable.customerLoan[0].customerLoanInterest
    let unsecuredTable
    if (interestTable.isUnsecuredSchemeApplied) {
        unsecuredTable = interestTable.customerLoan[1].customerLoanInterest
    }

    let mergeTble = []

    for (let i = 0; i < securedTable.length; i++) {
        let data = {}
        data.masterLoanId = securedTable[i].masterLoanId
        data.emiDueDate = securedTable[i].emiDueDate
        data.emiStatus = securedTable[i].emiStatus
        if (interestTable.isUnsecuredSchemeApplied) {
            data.emiReceivedDate = securedTable[i].emiReceivedDate
            data.interestAmount = (securedTable[i].interestAmount + unsecuredTable[i].interestAmount).toFixed(2)
            data.balanceAmount = (securedTable[i].balanceAmount + unsecuredTable[i].balanceAmount).toFixed(2)
            data.paidAmount = securedTable[i].paidAmount + unsecuredTable[i].paidAmount
            data.panelInterest = securedTable[i].panelInterest + unsecuredTable[i].panelInterest
        }
        data.emiReceivedDate = securedTable[i].emiReceivedDate
        data.interestAmount = (securedTable[i].interestAmount).toFixed(2)
        data.balanceAmount = (securedTable[i].balanceAmount).toFixed(2)
        data.paidAmount = securedTable[i].paidAmount
        data.panelInterest = securedTable[i].panelInterest

        mergeTble.push(data)
    };

    return { mergeTble, securedTable, unsecuredTable };
}


module.exports = {
    getGlobalSetting: getGlobalSetting,
    getCustomerLoanId: getCustomerLoanId,
    getLoanDetails: getLoanDetails,
    getSchemeDetails: getSchemeDetails,
    interestAmountCalculation: interestAmountCalculation,
    getCustomerLoanDetails: getCustomerLoanDetails,
    getAllDetailsOfCustomerLoan: getAllDetailsOfCustomerLoan,
    getAllCustomerLoanId: getAllCustomerLoanId,
    getInterestTableOfSingleLoan: getInterestTableOfSingleLoan,
    calculationData: calculationData,
    checkPaidInterest: checkPaidInterest,
    getInterestOfSelectedMonth: getInterestOfSelectedMonth,
    calculation: calculation,
    getFirstInterest: getFirstInterest,
    newSlabRateInterestCalcultaion: newSlabRateInterestCalcultaion,
    getStepUpslab: getStepUpslab,
    getLastInterest: getLastInterest,
    getAllNotPaidInterest: getAllNotPaidInterest,
    getAllInterestLessThanDate: getAllInterestLessThanDate,
    getPendingNoOfDaysInterest: getPendingNoOfDaysInterest,
    penal: penal,
    mergeInterestTable: mergeInterestTable,
}