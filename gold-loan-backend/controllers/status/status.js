const models = require('../../models');
const sequelize = models.sequelize;

const Sequelize = models.Sequelize;
const Op = Sequelize.Op;

const check = require('../../lib/checkLib');


exports.addStatus = async(req, res) => {
    try {
        let { statusName } = req.body;
        let statusExist = await models.status.findOne({ where: { statusName: statusName } })
        if (!check.isEmpty(statusExist)) {
            return res.status(404).json({ message: 'This Status is already Exist' });
        }
        let status = await models.status.create({ statusName })
        return res.status(200).json({ message: `Status Created` })
    } catch (error) {
        return res.status(500).json({ message: `Internal server error` })

    }
}

exports.getStatus = async(req, res) => {
    try {
        let allStatus = await models.status.findAll()
        return res.status(200).json(allStatus)

    } catch (error) {
        return res.status(500).json({ message: `Internal server error`, error })

    }
}

exports.deactivateStatus = async(req, res) => {
    try {
        const { statusId, isActive } = req.query;
        await models.status.update({ isActive: isActive }, { where: { id: statusId } })
        return res.status(200).json({ message: `Updated` })
    } catch (error) {
        return res.status(500).json({ message: `Internal server error`, error })
    }
}