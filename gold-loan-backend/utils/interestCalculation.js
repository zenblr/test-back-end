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
            attributes: ['id', 'loanType']
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
    penalIntrestPercent = 7 / 100;
    let globalSettings = await getGlobalSetting();
    let loan = await getLoanDetails(masterLoanId);
    intrest = await models.customerLoanInterest.findOne({ where: { emiStatus: { [Op.in]: ["paid"] }, loanId: id }, order: [['emiDueDate', 'DESC']], attributes: ['emiReceivedDate', 'emiDueDate'] });
    if (intrest == null) {
        firstIntrest = await models.customerLoanInterest.findOne({ where: { loanId: id }, order: [['emiDueDate', 'ASC']], attributes: ['emiDueDate'] });
        let intrestStart = moment(firstIntrest.emiDueDate);
        daysCount = currentDate.diff(intrestStart, 'days');
        if (daysCount != 0) {
            if (globalSettings.gracePeriodDays < daysCount) {
                amount.penalInterest = Number(loan.finalLoanAmount) * penalIntrestPercent / 360 * daysCount;
            }
        }
    } else {
        let lastPaid = moment(intrest.emiDueDate);
        checkMonths = currentDate.diff(lastPaid, "months");
        daysCount = currentDate.diff(lastPaid, 'days');

        if (daysCount != 0) {
            if (checkMonths != 0) {
                if (globalSettings.gracePeriodDays < daysCount) {
                    amount.penalInterest = Number(loan.finalLoanAmount) * penalIntrestPercent / 360 * daysCount;
                }
            } else {
                amount.interest = Number(loan.finalLoanAmount) * (15.96 / 100) / 360 * daysCount;
            }
        }
    }
    return amount 
}


module.exports = {
    getCustomerLoanId: getCustomerLoanId,
    interestAmountCalculation, interestAmountCalculation,
    getGlobalSetting: getGlobalSetting,
    getLoanDetails: getLoanDetails
}