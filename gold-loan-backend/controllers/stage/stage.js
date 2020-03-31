const models = require('../../models');
const sequelize = models.sequelize;

const Sequelize = models.Sequelize;
const Op = Sequelize.Op;
const check = require('../../lib/checkLib');



exports.addStage = async(req, res) => {
    try {
        let { stageName } = req.body;
        let stageExist = await models.stage.findOne({ where: { stageName: stageName } })

        if (!check.isEmpty(stageExist)) {
            return res.status(404).json({ message: 'This Stage is already Exist' });
        }
        let stage = await models.stage.create({ stageName })
        return res.status(200).json({ message: `Stage Created` })

    } catch (error) {
        return res.status(500).json({ message: `Internal server error` })

    }
}

exports.getStage = async(req, res) => {
    try {
        let allStage = await models.stage.findAll()
        return res.status(200).json(allStage)

    } catch (error) {
        return res.status(500).json({ message: `Internal server error`, error })

    }
}

exports.deactivateStage = async(req, res) => {
    try {
        const { stageId, isActive } = req.query;
        await models.stage.update({ isActive: isActive }, { where: { id: stageId } })
        return res.status(200).json({ message: `Updated` })
    } catch (error) {
        return res.status(500).json({ message: `Internal server error`, error })
    }
}