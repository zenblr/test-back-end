const models = require('../../models');
const sequelize = models.sequelize;

const Sequelize = models.Sequelize;
const Op = Sequelize.Op;
const check = require('../../lib/checkLib');



exports.addStage = async (req, res, next) => {
    let { stageName } = req.body;
    let stageExist = await models.stage.findOne({ where: { stageName: stageName } })

    if (!check.isEmpty(stageExist)) {
        return res.status(404).json({ message: 'This Stage is already Exist' });
    }
    let stage = await models.stage.create({ stageName })
    return res.status(200).json({ message: `Stage Created` })


}

exports.getStage = async (req, res, next) => {
    let { getAll } = req.query;

    let whereCondition;
    console.log(getAll)
    if (getAll == "true") {
        whereCondition = { order: [['id', 'ASC']] }
    } else if (getAll == "false") {
        whereCondition = { where: { isActive: true }, order: [['id', 'ASC']] }
    } else if (getAll == undefined) {
        whereCondition = { order: [['id', 'ASC']] }
    }
    let allStage = await models.stage.findAll(whereCondition)
    return res.status(200).json(allStage)


}

exports.updateStage = async (req, res, next) => {
    let { stageName } = req.body;
    let { id } = req.params;

    let stageExist = await models.stage.findOne({ where: { stageName } })
    if (!check.isEmpty(stageExist)) {
        return res.status(404).json({ message: 'This Stage is already Exist' });
    }
    let UpdateData = await models.stage.update({ stageName }, { where: { id: id } })
    if (UpdateData[0] === 0) {
        return res.status(404).json({ message: 'Data not updated' });
    }
    return res.status(200).json({ message: 'Success' });

}

exports.deactivateStage = async (req, res, next) => {
    const { stageId, isActive } = req.query;
    const stage = await models.stage.update({ isActive: isActive }, { where: { id: stageId } })
    if (stage[0] == 0) {
        return res.status(404).json({ message: "Stage deleted failed" });
    }
    return res.status(200).json({ message: `Updated` })

}