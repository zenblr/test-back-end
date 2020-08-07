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
        attributes: ['id', 'masterLoanId', 'loanAmount', 'outstandingAmount', 'currentSlab', 'currentInterestRate', 'penalInterestLastReceivedDate'],
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

//cron for daily interest calculation
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
    cronForDailyPenalInterest: cronForDailyPenalInterest
}