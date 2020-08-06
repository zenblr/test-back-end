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
        where: {
            isActive: true,
            loanStageId: stageId.id,
            "$partRelease$": null
        },
        attributes:['id'],
        include: [
            {
                model: models.partRelease,
                as: 'partRelease',
                attributes: ['amountStatus']
            },{
                model: models.customerLoan,
                as: 'customerLoan',
                attributes:['id']
            }],
    });
    let customerLoanId=[];
    for(const masterLoanData of masterLona){
        await masterLoanData.customerLoan.map((data) => {customerLoanId.push(data.id)});
    }
    return customerLoanId
}

let getAllDetailsOfCustomerLoan = async (customerLoanId) =>{
    let loanData = await models.customerLoan.findOne({
        where:{id:customerLoanId},
        order:[[models.customerLoanInterest,'id','asc']],
        attributes:['id','masterLoanId','loanAmount','outstandingAmount','currentSlab','currentInterestRate','penalInterestLastReceivedDate'],
        include:[{
            model:models.customerLoanSlabRate,
            as:'slab',
            attributes:['days','interestRate']
        },{
            model:models.customerLoanMaster,
            as:'masterLoan',
            attributes:['tenure','loanStartDate','loanEndDate','processingCharge','totalFinalInterestAmt','outstandingAmount']
        },{
            model:models.customerLoanInterest,
            as:'customerLoanInterest',
            attributes: { exclude: [ 'createdAt', 'createdBy', 'modifiedBy','updatedAt'] },
        },{
            model:models.scheme,
            as:'scheme',
            attributes: { exclude: [ 'createdAt', 'updatedAt'] },
        }]
    })
    return loanData;
}

let calculationData = async () =>{
    let customerLoanId = await getAllCustomerLoanId();
    let loanInfo = [];
    for(const id of customerLoanId){
        let info = await getAllDetailsOfCustomerLoan(id);
        loanInfo.push(info);
    }
    let noOfDaysInYear = 360
    return {noOfDaysInYear,loanInfo};
}

let penal = async (loanId) => {
    console.log(loanId)

}


module.exports = {
    getCustomerLoanId: getCustomerLoanId,
    interestAmountCalculation, interestAmountCalculation,
    getGlobalSetting: getGlobalSetting,
    getLoanDetails: getLoanDetails,
    getSchemeDetails: getSchemeDetails,
    getAllCustomerLoanId: getAllCustomerLoanId,
    getAllDetailsOfCustomerLoan:getAllDetailsOfCustomerLoan,
    calculationData:calculationData,
    penal: penal
}