const check = require('../lib/checkLib');
let models = require('../models')


exports.mergeInterestTable = async (masterLoanId) => {

    let interestTable = await models.customerLoanMaster.findOne({
        where: { id: masterLoanId },
        attributes: ['id','isUnsecuredSchemeApplied'],
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
    if(interestTable.isUnsecuredSchemeApplied){
        unsecuredTable = interestTable.customerLoan[1].customerLoanInterest
    }

    let mergeTble = []

    for (let i = 0; i < securedTable.length; i++) {
        let data = {}
        data.masterLoanId = securedTable[i].masterLoanId
        data.emiDueDate = securedTable[i].emiDueDate
        data.emiStatus = securedTable[i].emiStatus
        if(interestTable.isUnsecuredSchemeApplied){
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