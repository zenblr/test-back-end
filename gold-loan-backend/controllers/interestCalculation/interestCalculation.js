const models = require('../../models');
const check = require('../../lib/checkLib');
const sequelize = models.sequelize;
const paginationFUNC = require('../../utils/pagination'); // importing pagination function
const Sequelize = models.Sequelize;
const Op = Sequelize.Op;
const _ = require('lodash');
const moment = require('moment')
const { dailyIntrestCalculation } = require('../../utils/interestCalculation');


// add internal branch

exports.interestCalculation = async (req, res) => {
    let data;
    let { date } = req.body;
    if (date) {
        data = await dailyIntrestCalculation(date);
    } else {
        date = moment();
        data = await dailyIntrestCalculation(date);
    }
    return res.status(200).json(data);
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