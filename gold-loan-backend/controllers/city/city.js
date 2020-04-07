const models = require('../../models');
const sequelize = models.sequelize;

const Sequelize = models.Sequelize;
const Op = Sequelize.Op;
const csv = require('csvtojson')


exports.postCity = async(req, res, next) => {
    const csvFilePath = req.file.path;
    const jsonArray = await csv().fromFile(csvFilePath);

    let checkIfCsvUploaded = await models.cities.findAll();
    if (checkIfCsvUploaded.length > 0) {
        return res.status(404).json({ messgae: "Cities Csv is already Uploaded" })
    }
    await sequelize.transaction(async t => {
        for (var i = 0; i < jsonArray.length; i++) {
            let data = await models.cities.create({ name: jsonArray[i].name, stateId: jsonArray[i].state_id }, { transaction: t })
        }
    }).then(() => {
        res.status(200).json({ message: "success" })

    }).catch((exception) => {
       next(exception)
    })

}

exports.getCity = async(req, res, next) => {
    const { stateId } = req.params;
    let cities = await models.cities.findAll({
        where: { isActive: true, stateId: stateId },
        attributes: ['id', 'name', 'stateId'],
    });
    res.status(200).json({ message: cities })


}