const models = require('../../models');
const Sequelize = models.Sequelize;
const Op = Sequelize.Op;

exports.schemeMigration = async (req, res, next) => {
    let stage = await models.loanStage.findOne({
        where: { name: 'applying' }
    })
    let transfer = await models.loanStage.findOne({
        where: { name: 'loan transfer' }
    })
    let disbursed = await models.loanStage.findOne({
        where: { name: 'disbursed' }
    })
    await models.customerLoanMaster.update({ loanStatusForOperatinalTeam: 'rejected', commentByOperatinalTeam: 'migration', loanStatusForBM: 'rejected', commentByBM: 'migration', loanStatusForAppraiser: 'rejected', commentByAppraiser: 'migration', loanStageId: 7 }, {
        where: {
            loanStageId: { [Op.notIn]: [stage.id, transfer.id, disbursed.id] },
            isLoanCompleted: false,
            isActive: true
        },
    });
    let allMatserLoan = await models.customerLoanMaster.findAll({
        where: {
            loanStageId: { [Op.notIn]: [stage.id, transfer.id, disbursed.id] },
            isLoanCompleted: false,
            isActive: true
        },
        attributes: ['id']
    });
    let masterLoanId = await allMatserLoan.map((data) => data.id);
    // isProcessComplete
    await models.appraiserRequest.update(
        {isProcessComplete : true},
        {where:{isProcessComplete: false}},
        {
            include: [{
                model: models.customerLoanMaster,
                as: 'masterLoan',
                where :{id: { [Op.in]: masterLoanId }}
            }]
        },
    )

    return res.status(200).json({ message: "Success"})
}