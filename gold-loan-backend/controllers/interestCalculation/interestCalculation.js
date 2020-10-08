const models = require('../../models');
const check = require('../../lib/checkLib');
const sequelize = models.sequelize;
const paginationFUNC = require('../../utils/pagination'); // importing pagination function
const Sequelize = models.Sequelize;
const Op = Sequelize.Op;
const _ = require('lodash');
const moment = require('moment')
const { dailyIntrestCalculation, cronForDailyPenalInterest } = require('../../utils/interestCron');
const { getCustomerInterestAmount, intrestCalculationForSelectedLoan, penalInterestCalculationForSelectedLoan, updateInterestAftertOutstandingAmount,
    calculationData, getInterestTableOfSingleLoan, getAllPaidInterest, intrestCalculationForSelectedLoanWithOutT, penalInterestCalculationForSelectedLoanWithOutT } = require('../../utils/loanFunction');


// add internal branch

exports.interestCalculation = async (req, res) => {
    let data;
    let { date } = req.body;
    if (date) {
        data = await dailyIntrestCalculation(date);
        await cronForDailyPenalInterest(date)
    } else {
        date = moment();
        data = await dailyIntrestCalculation(date);
        await cronForDailyPenalInterest(date)
    }
    return res.status(200).json(data);
}

exports.penalInterestCalculation = async (req, res) => {
    // let date = moment()
    // let info = await calculationData();
    // let data = info.loanInfo
    // let { gracePeriodDays, noOfDaysInYear } = info
    // for (let i = 0; i < data.length; i++) {
    //     let penal = (data[i].penalInterest / 100)
    //     let selectedSlab = data[i].selectedSlab
    //     let dataInfo = await getInterestTableOfSingleLoan(data[i].id)
    //     for (let j = 0; j < dataInfo.length; j++) {
    //         //due date from db
    //         const dueDate = moment(dataInfo[j].emiDueDate);
    //         let nextDueDate
    //         if (dataInfo[j + 1] == undefined) {
    //             nextDueDate = moment(date);
    //         } else {
    //             nextDueDate = moment(dataInfo[j + 1].emiDueDate)
    //         }
    //         //current date
    //         const currentDate = moment(date);
    //         let daysCount = currentDate.diff(dueDate, 'days');
    //         let daysCount2 = nextDueDate.diff(dueDate, 'days');
    //         if (daysCount < gracePeriodDays) {
    //             break
    //         }
    //         if (daysCount < selectedSlab) {
    //             daysCount2 = currentDate.diff(dueDate, 'days');
    //         }
    //         if (dueDate > currentDate) {
    //             break
    //         }
    //         let penelInterest = Number((((data[i].outstandingAmount * penal) / noOfDaysInYear) * daysCount2).toFixed(2))
    //         let penalAccrual = penelInterest
    //         let penalOutstanding;
    //         if (dataInfo[j + 1] != undefined) {
    //             penalOutstanding = penalAccrual - dataInfo[j + 1].penalPaid
    //             console.log("update", penalAccrual, dataInfo[j + 1].id)
    //             // await models.customerLoanInterest.update({ penalAccrual: penalAccrual, penalOutstanding: penalOutstanding }, { where: { id: dataInfo[j + 1].id } })
    //         } else {
    //             penalAccrual = Number(penalAccrual) + Number(dataInfo[dataInfo.length - 1].penalAccrual)
    //             penalOutstanding = penalAccrual - dataInfo[j].penalPaid
    //             console.log("update", penalAccrual, dataInfo[j].id)
    //             // await models.customerLoanInterest.update({ penalAccrual: penalAccrual, penalOutstanding: penalOutstanding }, { where: { id: dataInfo[j].id } })
    //         }
    //     }
    // }

    // return res.status(200).json(data);
}

exports.interestCalculationOneLoan = async (req, res) => {
    let interestData;
    let penalData;
    let { date, masterLoanId } = req.body;
    if (date) {
        interestData = await intrestCalculationForSelectedLoan(date, masterLoanId);
        penalData = await penalInterestCalculationForSelectedLoan(date, masterLoanId)

    } else {
        date = moment();
        interestData = await intrestCalculationForSelectedLoan(date, masterLoanId);
        penalData = await penalInterestCalculationForSelectedLoan(date, masterLoanId)

    }
    return res.status(200).json({ interestData, penalData });
}

exports.interestCalculationUpdate = async (req, res) => {
    let data;
    let { date, masterLoanId } = req.body;
    if (date) {
        data = await updateInterestAftertOutstandingAmount(date, masterLoanId);
    } else {
        date = moment();
        data = await updateInterestAftertOutstandingAmount(date, masterLoanId);
    }
    return res.status(200).json(data);
}

exports.interestAmount = async (req, res) => {
    let { id } = req.query;
    let amount = await getCustomerInterestAmount(id);
    return res.status(200).json(amount);
}

exports.getInterestTableInExcel = async (req, res) => {
    let interestData = await models.customerLoanInterest.findAll({ order: [['id', 'ASC']] });

    let finalData = [];

    for (const data of interestData) {
        let interest = {};
        interest["id"] = data.id;
        interest["loanId"] = data.loanId;
        interest["masterLoanId"] = data.masterLoanId;
        interest["emiDueDate"] = data.emiDueDate;
        interest["interestRate"] = data.interestRate;
        interest["interestAmount"] = data.interestAmount;
        interest["paidAmount"] = data.paidAmount;
        interest["interestAccrual"] = data.interestAccrual;
        interest["outstandingInterest"] = data.outstandingInterest;
        interest["totalInterestAccrual"] = data.totalInterestAccrual;
        interest["emiReceivedDate"] = data.emiReceivedDate;
        interest["penalInterest"] = data.penalInterest;
        interest["PenalAccrual"] = data.PenalAccrual;
        interest["penalOutstanding"] = data.penalOutstanding;
        interest["penalPaid"] = data.penalPaid;
        interest["emiStatus"] = data.emiStatus;
        interest["createdBy"] = data.createdBy;
        interest["modifiedBy"] = data.modifiedBy;
        interest["isActive"] = data.isActive;
        interest["createdAt"] = data.createdAt;
        interest["updatedAt"] = data.updatedAt;
        finalData.push(interest);
    }
    const date = Date.now();
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader("Content-Disposition", "attachment; filename=" + `interest${date}.xlsx`);
    await res.xls(`interest${date}.xlsx`, finalData);
    res.end();
}

exports.getTransactionDetailTable = async (req, res) => {
    let { masterLoanId } = req.query;
    let transactionDetails = await models.customerTransactionDetail.findAll({ where: { masterLoanId: masterLoanId } }, { order: [['id', 'ASC']] });
    let finalData = [];

    for (const data of transactionDetails) {
        let interest = {};
        interest["id"] = data.id;
        interest["masterLoanId"] = data.masterLoanId;
        interest["loanId"] = data.loanId;
        interest["loanInterestId"] = data.loanInterestId;
        interest["referenceId"] = data.referenceId;
        interest["customerLoanTransactionId"] = data.customerLoanTransactionId;
        interest["isPenalInterest"] = data.isPenalInterest;
        interest["otherChargesId"] = data.otherChargesId;
        interest["credit"] = data.credit;
        interest["debit"] = data.debit;
        interest["paymentDate"] = data.paymentDate;
        interest["description"] = data.description;
        interest["createdAt"] = data.createdAt;
        interest["updatedAt"] = data.updatedAt;
        finalData.push(interest);
    }
    const date = Date.now();
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader("Content-Disposition", "attachment; filename=" + `transactionDetail${date}.xlsx`);
    await res.xls(`transactionDetail${date}.xlsx`, finalData);
    res.end();
}

exports.app = async (req, res) => {
    // let data = [{
    //     "id": 6,
    //     "customerId": 32,
    //     "moduleId": 1,
    //     "appraiserId": 86,
    //     "isAssigned": true,
    //     "customer": {
    //         "id": 32,
    //     },
    //     "module": {
    //         "id": 1,
    //         "moduleName": "gold loan"
    //     }
    // },
    // {
    //     "id": 5,
    //     "customerId": 32,
    //     "moduleId": 3,
    //     "appraiserId": 86,
    //     "isAssigned": true,
    //     "customer": {
    //         "id": 32,
    //     },
    //     "module": {
    //         "id": 3,
    //         "moduleName": "scrap gold"
    //     }
    // },
    // {
    //     "id": 4,
    //     "customerId": 43,
    //     "moduleId": 1,
    //     "appraiserId": 86,
    //     "isAssigned": true,
    //     "customer": {
    //         "id": 43,
    //     },
    //     "module": {
    //         "id": 1,
    //         "moduleName": "gold loan"
    //     }
    // },
    // {
    //     "id": 3,
    //     "customerId": 42,
    //     "moduleId": 3,
    //     "appraiserId": 86,
    //     "isAssigned": true,
    //     "customer": {
    //         "id": 42,
    //     },
    //     "module": {
    //         "id": 3,
    //         "moduleName": "scrap gold"
    //     }
    // }
    // ]

    // let abc = await _.chain(data)
    //     .groupBy("customerId")
    //     .map((value, key) => ({ customerId: key, users: value }))
    //     .value()

    return res.status(200).json({ data: [] })

}



// await sequelize.transaction(async (t) => {


//     let interestFinalCal = await intrestCalculationForSelectedLoanWithOutT(date, masterLoanId)

//     for (let i = 0; i < interestFinalCal.transactionData.length; i++) {
//         let element = interestFinalCal.transactionData[i]
//         let transactionNew = await models.customerTransactionDetail.create(element, { transaction: t })
//         let a = await models.customerTransactionDetail.update({ referenceId: `${element.loanUniqueId}-${transactionNew.id}` }, { where: { id: transactionNew.id }, transaction: t });
//     }

//     for (let i = 0; i < interestFinalCal.interestDataObject.length; i++) {
//         const element = interestFinalCal.interestDataObject[i]
//         if (element.id) {
//             let a = await models.customerLoanInterest.update(element, { where: { id: element.id }, transaction: t })
//         } else {
//             let b = await models.customerLoanInterest.create(element, { transaction: t })
//         }
//     }

//     for (let i = 0; i < interestFinalCal.customerLoanData.length; i++) {
//         let element = interestFinalCal.customerLoanData[i]
//         let a = await models.customerLoan.update(element, { where: { id: element.id }, transaction: t })
//     }

//     let penalFinalCal = await penalInterestCalculationForSelectedLoanWithOutT(date, masterLoanId)
//     for (let i = 0; i < penalFinalCal.penalData.length; i++) {
//         const element = penalFinalCal.penalData[i]
//         let a = await models.customerLoanInterest.update(element, { where: { id: element.id }, transaction: t })
//     }
// })


// add internal branch

exports.interestCalculationCron = async (req, res) => {
    date = moment();
    let { cronId } = req.body;
    try {
        let cronData = await models.cronLogger.findOne({ where: { id: cronId, cronType: 'loan Interest' } });
        if (cronData) {
        let data = await dailyIntrestCalculation(date);
        let endTime = moment();
        var penalProcessingTime = moment.utc(moment(endTime, "DD/MM/YYYY HH:mm:ss.SSS").diff(moment(date, "DD/MM/YYYY HH:mm:ss.SSS"))).format("HH:mm:ss.SSS")
        await models.cronLogger.update({ date: date, startTime: date, endTime: endTime, processingTime: penalProcessingTime, status: "success", notes: "re-executed", message: "success" }, { where: { id: cronId } });
        return res.status(200).json({ message: 'success', data });
        }else{
            return res.status(400).json({ message: 'Invalid cron id' });
        }
    } catch (Err) {
        let endTime = moment();
        var penalProcessingTime = moment.utc(moment(endTime, "DD/MM/YYYY HH:mm:ss.SSS").diff(moment(date, "DD/MM/YYYY HH:mm:ss.SSS"))).format("HH:mm:ss.SSS")
        await models.cronLogger.update({ date: date, startTime: date, endTime: endTime, processingTime: penalProcessingTime, status: "failed", notes: "re-executed", message: Err.message }, { where: { id: cronId } });
        return res.status(400).json({ message: 'failed' });
    }
}

exports.penalInterestCalculationCron = async (req, res) => {
    date = moment();
    let { cronId } = req.body;
    try {
        let cronData = await models.cronLogger.findOne({ where: { id: cronId, cronType: 'loan Penal Interest' } });
        if (cronData) {
            let data = await cronForDailyPenalInterest(date);
            let endTime = moment();
            var penalProcessingTime = moment.utc(moment(endTime, "DD/MM/YYYY HH:mm:ss.SSS").diff(moment(date, "DD/MM/YYYY HH:mm:ss.SSS"))).format("HH:mm:ss.SSS")
            await models.cronLogger.update({ date: date, startTime: date, endTime: endTime, processingTime: penalProcessingTime, status: "success", notes: "re-executed", message: "success" }, { where: { id: cronId } });
            return res.status(200).json({ message: 'success', data });
        }else{
            return res.status(400).json({ message: 'Invalid cron id' });
        }
    } catch (Err) {
        let endTime = moment();
        var penalProcessingTime = moment.utc(moment(endTime, "DD/MM/YYYY HH:mm:ss.SSS").diff(moment(date, "DD/MM/YYYY HH:mm:ss.SSS"))).format("HH:mm:ss.SSS")
        await models.cronLogger.update({ date: date, startTime: date, endTime: endTime, processingTime: penalProcessingTime, status: "failed", notes: "re-executed", message: Err.message }, { where: { id: cronId } });
        return res.status(400).json({ message: 'failed' });
    }
}