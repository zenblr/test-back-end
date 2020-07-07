// LOAD REQUIRED PACKAGES
const models = require('../../models');
const sequelize = models.sequelize;
const Sequelize = models.Sequelize;
const Op = Sequelize.Op;
const paginationFUNC = require('../../utils/pagination'); // IMPORTING PAGINATION FUNCTION

const check = require("../../lib/checkLib"); // IMPORTING CHECKLIB 

//FUNCTION fot submitting basic details DONE
exports.loanTransferBasicDeatils = async (req, res, next) => {

    let { customerId, customerUniqueId, kycStatus, startDate, masterLoanId } = req.body
    let createdBy = req.userData.id;
    let modifiedBy = req.userData.id;
    let stageId = await models.loanStage.findOne({ where: { name: 'loan transfer' } })

    if (masterLoanId != null) {
        let customerLoanMaster = await models.customerLoanMaster.findOne({ where: { id: masterLoanId } })
        let loanId = await models.customerLoan.findOne({ where: { masterLoanId: customerLoanMaster.id, loanType: 'secured' } })
        if (!check.isEmpty(customerLoanMaster)) {
            return res.status(200).json({ message: 'success', loanId: loanId.id, masterLoanId: customerLoanMaster.id, loanCurrentStage: '2' })
        }
    }
    let loanData = await sequelize.transaction(async t => {

        let masterLoan = await models.customerLoanMaster.create({ customerId: customerId, loanStageId: stageId.id, customerLoanCurrentStage: '2', createdBy, modifiedBy }, { transaction: t })

        let loan = await models.customerLoan.create({ customerId, masterLoanId: masterLoan.id, loanType: 'secured', createdBy, modifiedBy }, { transaction: t })

        await models.customerLoanPersonalDetail.create({ loanId: loan.id, masterLoanId: masterLoan.id, customerUniqueId, startDate, kycStatus, createdBy, modifiedBy }, { transaction: t })
        return loan
    })
    return res.status(200).json({ message: 'success', loanId: loanData.id, masterLoanId: loanData.masterLoanId, loanCurrentStage: '2' })

}


