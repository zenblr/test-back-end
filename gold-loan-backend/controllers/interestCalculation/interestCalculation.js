const models = require('../../models');
const check = require('../../lib/checkLib');
const sequelize = models.sequelize;
const paginationFUNC = require('../../utils/pagination'); // importing pagination function
const Sequelize = models.Sequelize;
const Op = Sequelize.Op;
const _ = require('lodash');
const moment = require('moment')
const { dailyIntrestCalculation,cronForDailyPenalInterest } = require('../../utils/interestCron');
const { getCustomerInterestAmount,intrestCalculationForSelectedLoan,updateInterestAftertOutstandingAmount } = require('../../utils/loanFunction');


// add internal branch

exports.interestCalculation = async (req, res) => {
    let data;
    let { date } = req.body;
    if (date) {
        data = await dailyIntrestCalculation(date);
        await  cronForDailyPenalInterest(date)
    } else {
        date = moment();
        data = await dailyIntrestCalculation(date);
        await  cronForDailyPenalInterest(date)

    }

    return res.status(200).json(data);
}

exports.interestCalculationOneLoan = async (req, res) => {
    let data;
    let { date, masterLoanId } = req.body;
    if (date) {
        data = await intrestCalculationForSelectedLoan(date,masterLoanId);
        await  cronForDailyPenalInterest(date)

    } else {
        date = moment();
        data = await intrestCalculationForSelectedLoan(date,masterLoanId);
        await  cronForDailyPenalInterest(date)

    }
    return res.status(200).json(data);
}

exports.interestCalculationUpdate = async (req, res) => {
    let data;
    let { date, masterLoanId } = req.body;
    if (date) {
        data = await updateInterestAftertOutstandingAmount(date,masterLoanId);
    } else {
        date = moment();
        data = await updateInterestAftertOutstandingAmount(date,masterLoanId);
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
    let transactionDetails = await models.customerTransactionDetail.findAll({where:{masterLoanId:masterLoanId}},{ order: [['id', 'ASC']] });
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

// async function getPenal(info) {
//     let data = info.loanInfo
//     let { gracePeriodDays, noOfDaysInYear } = info
//     for (let i = 0; i < data.length; i++) {
//         let penal = (data[i].scheme.penalInterest / 100)
//         let dataInfo = await models.customerLoanInterest.findAll({
//             where: {
//                 loanId: data[i].id,
//                 emiStatus: { [Op.notIn]: ['paid'] },
//             },
//             order: [['id', 'asc']],
//             attributes: { exclude: ['createdAt', 'updatedAt', 'createdBy', 'modifiedBy', 'isActive'] },
//         })
//         //due date from db
//         let dueDateFromDb = dataInfo[0].emiDueDate
//         const dueDate = moment(dueDateFromDb);
//         //current date
//         let inDate = moment(moment.utc(moment(new Date())).toDate()).format('YYYY-MM-DD');
//         const currentDate = moment(inDate);
//         let daysCount = currentDate.diff(dueDateFromDb, 'days');

//         if (currentDate > dueDate) {
//             if (daysCount > gracePeriodDays) {
//                 var penelInterest
//                 var lastPenalPaid = moment(data[i].penalInterestLastReceivedDate)
//                 if (data[i].penalInterestLastReceivedDate == null) {
//                     penelInterest = Number((((data[i].outstandingAmount * penal) / noOfDaysInYear) * daysCount).toFixed(2))
//                 } else {
//                     daysCount = currentDate.diff(lastPenalPaid, 'days');
//                     penelInterest = Number((((data[i].outstandingAmount * penal) / noOfDaysInYear) * daysCount).toFixed(2))
//                 }
//                 console.log(penelInterest, data[i].id, daysCount)
//                 await models.customerLoanInterest.update({ PenalAccrual: penelInterest }, { where: { id: dataInfo[0].id } })
//             }
//         }
//     }

// }