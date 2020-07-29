const models = require('../models');
const sequelize = models.sequelize;
const Sequelize = models.Sequelize;
const Op = Sequelize.Op;
const check = require("../lib/checkLib");
const moment = require("moment");


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

let interestAmountCalculation = async (masterLoanId, loanData) => {
    // let intrest = await loanFunction(masterLoanId,customerLoanId);
    let daysCount;
    let intrest;
    let firstIntrest;
    let currentDate = moment();
    intrest = await models.customerLoanInterest.findOne({ where: { emiStatus: { [Op.in]: ["paid"] }, loanId: loanData.secured }, order: [['emiDueDate', 'DESC']],attributes:['emiReceivedDate','emiDueDate'] });
    if (intrest == null) {
        firstIntrest = await models.customerLoanInterest.findOne({ where: { loanId: loanData.secured }, order: [['emiDueDate', 'ASC']], attributes: ['emiDueDate'] });
        let intrestStart = moment(firstIntrest.emiDueDate);
        daysCount = currentDate.diff(intrestStart,'days');
    } else {
        let lastPaid = moment(intrest.emiDueDate);
        daysCount = currentDate.diff(lastPaid,'days');
    }
    return { masterLoanId, loanData, intrest,daysCount }
}


module.exports = {
    getCustomerLoanId: getCustomerLoanId,
    interestAmountCalculation, interestAmountCalculation
}