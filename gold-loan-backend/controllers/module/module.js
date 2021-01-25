const models = require('../../models');
const sequelize = models.sequelize;
const Sequelize = models.Sequelize;
const Op = Sequelize.Op;

exports.readAllModule = async (req, res, next) => {
    let readModuleData = await models.module.getAllModule();
    if (!readModuleData) {
        return res.status(404).json({ message: "Data not found" });
    }
    return res.status(200).json(readModuleData);


}

exports.readAllRequestModule = async (req, res, next) => {

    let { isFor } = req.query
    let whereCondition
    if (isFor == 'lead') {
        whereCondition = { moduleName: { [Op.in]: ['gold loan', 'scrap gold', 'digital gold'] } }
    } else if (isFor == 'request') {
        whereCondition = { moduleName: { [Op.in]: ['gold loan', 'scrap gold'] } }
    }

    let readModuleData = await models.module.findAll({
        where: whereCondition
    });
    if (!readModuleData) {
        return res.status(404).json({ message: "Data not found" });
    }
    return res.status(200).json(readModuleData);


}




