const check = require('../lib/checkLib');
let models = require('../models')


exports.mergeInterestTable = async (masterLoanId) => {

    let interestTable = await models.customerLoanMaster.findOne({
        where: { id: masterLoanId },
        attributes: ['id'],
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
    let unsecuredTable = interestTable.customerLoan[1].customerLoanInterest

    let mergeTble = []

    for (let i = 0; i < securedTable.length; i++) {
        let data = {}
        data.masterLoanId = securedTable[i].masterLoanId
        data.emiDueDate = securedTable[i].emiDueDate
        data.interestAmount = (securedTable[i].interestAmount + unsecuredTable[i].interestAmount).toFixed(2)
        data.balanceAmount = (securedTable[i].balanceAmount + unsecuredTable[i].balanceAmount).toFixed(2)
        data.paidAmount = securedTable[i].paidAmount + unsecuredTable[i].paidAmount
        data.panelInterest = securedTable[i].panelInterest + unsecuredTable[i].panelInterest
        data.emiStatus = securedTable[i].emiStatus
        data.emiReceivedDate = securedTable[i].emiReceivedDate
        mergeTble.push(data)
    };

    return { mergeTble, securedTable, unsecuredTable };
}