const models = require('../../models');
const sequelize = models.sequelize;

const Sequelize = models.Sequelize;
const Op = Sequelize.Op;

const check = require('../../lib/checkLib');


exports.addStatus = async(req, res) => {
    let { statusName } = req.body;
    let statusExist = await models.status.findOne({ where: { statusName: statusName } })
    if (!check.isEmpty(statusExist)) {
        return res.status(404).json({ message: 'This Status is already Exist' });
    }
    let status = await models.status.create({ statusName })
    return res.status(200).json({ message: `Status Created` })

}

exports.getStatus = async(req, res) => {
    let allStatus = await models.status.findAll()
    return res.status(200).json(allStatus)


}

exports.deactivateStatus = async(req, res) => {
    const { statusId, isActive } = req.query;
    await models.status.update({ isActive: isActive }, { where: { id: statusId } })
    return res.status(200).json({ message: `Updated` })

}