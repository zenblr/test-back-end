const models = require('../../models');
const sequelize = models.sequelize;

const Sequelize = models.Sequelize;
const Op = Sequelize.Op;
const check = require('../../lib/checkLib');



exports.addStage = async(req, res) => {
    let { stageName } = req.body;
    let stageExist = await models.stage.findOne({ where: { stageName: stageName } })

    if (!check.isEmpty(stageExist)) {
        return res.status(404).json({ message: 'This Stage is already Exist' });
    }
    let stage = await models.stage.create({ stageName })
    return res.status(200).json({ message: `Stage Created` })


}

exports.getStage = async(req, res) => {
    let allStage = await models.stage.findAll()
    return res.status(200).json(allStage)


}

exports.deactivateStage = async(req, res) => {
    const { stageId, isActive } = req.query;
    await models.stage.update({ isActive: isActive }, { where: { id: stageId } })
    return res.status(200).json({ message: `Updated` })

}