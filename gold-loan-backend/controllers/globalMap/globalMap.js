const models = require('../../models');

exports.getMapDetails = async (req, res, next) => {
    
    let stageId = await models.loanStage.findOne({ where: { name: 'disbursed' } })
    let data = await models.customerMasterLoan.findAll({
        where:{
            loanStageId :stageId
        },
        include:{
            model :models.user,
            as:'user'
        }
    })

    return res.status(200).json(data)

}