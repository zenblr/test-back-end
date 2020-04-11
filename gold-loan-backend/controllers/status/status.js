const models = require('../../models');
const sequelize = models.sequelize;

const Sequelize = models.Sequelize;
const Op = Sequelize.Op;

const check = require('../../lib/checkLib');


exports.addStatus = async(req, res, next) => {
    let { statusName } = req.body;
    let statusExist = await models.status.findOne({ where: { statusName: statusName } })
    if (!check.isEmpty(statusExist)) {
        return res.status(404).json({ message: 'This Status is already Exist' });
    }
    let status = await models.status.create({ statusName })
    return res.status(200).json({ message: `Status Created` })

}

exports.getStatus = async(req, res, next) => {

    let { getAll } = req.query;

    let whereCondition;
    if (getAll == "true") {
        whereCondition = { order: [['id', 'ASC']] }
    } else if (getAll == "false") {
        whereCondition = { where: { isActive: true }, order: [['id', 'ASC']] }
    } else if (getAll == undefined) {
        whereCondition = { order: [['id', 'ASC']] }
    }
    let allStatus = await models.status.findAll(whereCondition)
    return res.status(200).json(allStatus)
}

exports.updateStatus = async (req, res, next) => {
    let {  statusName } = req.body;
    let { id } = req.params;

    let statusExist = await models.status.findOne({ where: { statusName } })
    if (!check.isEmpty(statusExist)) {
        return res.status(404).json({ message: 'This Status is already Exist' });
    }
    let UpdateData = await models.status.update({ statusName }, { where: { id: id } })
    if (UpdateData[0] === 0) {
        return res.status(404).json({ message: 'Data not updated' });
    }
    return res.status(200).json({ message: 'Success' });

}

exports.deactivateStatus = async(req, res, next) => {
    const { statusId, isActive } = req.query;
    const status = await models.status.update({ isActive: isActive }, { where: { id: statusId } })
    if (status[0] == 0) {
        return res.status(404).json({ message: "status deleted failed" });
    }
    return res.status(200).json({ message: `Updated` })

}