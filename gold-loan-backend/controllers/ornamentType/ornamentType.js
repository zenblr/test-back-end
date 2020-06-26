const models = require('../../models');
const sequelize = models.sequelize;

const Sequelize = models.Sequelize;
const Op = Sequelize.Op;
const check = require('../../lib/checkLib');


exports.addOrnamentType = async (req, res, next) => {
    let { name } = req.body;
    let ornamentTypeExist = await models.ornamentType.findOne({ where: { name: name } })
    if (!check.isEmpty(ornamentTypeExist)) {
        return res.status(404).json({ message: 'This Ornament Type is already Exist' });
    }
    let rating = await models.ornamentType.create({ name })
    return res.status(200).json({ message: `Created` })
}

exports.getOrnamentType = async (req, res, next) => {
    let { getAll } = req.query;

    if (req.query.from == 1 && req.query.to == -1) {
        let allOrnamentType = await models.ornamentType.findAll({ where: { isActive: true } });
        return res.status(200).json({ data: allOrnamentType });
    } else {

        let whereCondition;
        if (getAll == "true") {
            whereCondition = { where: { isActive: true }, order: [['id', 'DESC']] }
        } else if (getAll == "false") {
            whereCondition = { where: { isActive: true }, order: [['id', 'DESC']] }
        } else if (getAll == undefined) {
            whereCondition = { where: { isActive: true }, order: [['id', 'DESC']] }
        }
        let allOrnamentType = await models.ornamentType.findAll(whereCondition)
        return res.status(200).json({ data: allOrnamentType, count: allOrnamentType.length })
    }

}

exports.updateOrnamentType = async (req, res, next) => {
    let { name } = req.body;
    let { id } = req.params;

    let ornamentTypeExist = await models.ornamentType.findOne({ where: { name: name } })
    if (!check.isEmpty(ornamentTypeExist)) {
        return res.status(404).json({ message: 'This Purpose is already Exist' });
    }
    let UpdateData = await models.ornamentType.update({ name }, { where: { id: id } })
    if (UpdateData[0] === 0) {
        return res.status(404).json({ message: 'Data not updated' });
    }
    return res.status(200).json({ message: 'Success' });

}

exports.deactivateOrnamentType = async (req, res, next) => {
    const { id, isActive } = req.query;
    const ornamentType = await models.ornamentType.update({ isActive: isActive }, { where: { id: id } })
    if (ornamentType[0] == 0) {
        return res.status(404).json({ message: "Ornament Type deleted failed" });
    }
    return res.status(200).json({ message: `Updated` })

}