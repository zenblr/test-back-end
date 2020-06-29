const models = require('../../models');
const sequelize = models.sequelize;

const Sequelize = models.Sequelize;
const Op = Sequelize.Op;
const check = require('../../lib/checkLib');


exports.addPurpose = async (req, res, next) => {
    let { name } = req.body;
    let purposeExist = await models.purpose.findOne({ where: { name: name, isActive: true } })
    if (!check.isEmpty(purposeExist)) {
        return res.status(404).json({ message: 'This Purpose already Exists' });
    }
    let rating = await models.purpose.create({ name })
    return res.status(200).json({ message: `Created` })
}

exports.getPurpose = async (req, res, next) => {
    let { getAll } = req.query;

    if (req.query.from == 1 && req.query.to == -1) {
        let allPurpose = await models.purpose.findAll({ where: { isActive: true } });
        return res.status(200).json({ data: allPurpose });
    } else {

        let whereCondition;
        if (getAll == "true") {
            whereCondition = {where: { isActive: true }, order: [['id', 'DESC']] }
        } else if (getAll == "false") {
            whereCondition = { where: { isActive: true }, order: [['id', 'DESC']] }
        } else if (getAll == undefined) {
            whereCondition = { where: { isActive: true },order: [['id', 'DESC']] }
        }
        let allPurpose = await models.purpose.findAll(whereCondition)
        return res.status(200).json({ data: allPurpose, count: allPurpose.length })
    }

}

exports.updatePurpose = async (req, res, next) => {
    let { name } = req.body;
    let { id } = req.params;

    let purposeExist = await models.purpose.findOne({ where: { name: name, isActive: true } })
    if (!check.isEmpty(purposeExist)) {
        return res.status(404).json({ message: 'This Purpose already Exists' });
    }
    let UpdateData = await models.purpose.update({ name }, { where: { id: id } })
    if (UpdateData[0] === 0) {
        return res.status(404).json({ message: 'Data not updated' });
    }
    return res.status(200).json({ message: 'Success' });

}

exports.deactivatePurpose = async (req, res, next) => {
    const { id, isActive } = req.query;
    const purpose = await models.purpose.update({ isActive: isActive }, { where: { id: id } })
    if (purpose[0] == 0) {
        return res.status(404).json({ message: "Purpose deleted failed" });
    }
    return res.status(200).json({ message: `Updated` })

}