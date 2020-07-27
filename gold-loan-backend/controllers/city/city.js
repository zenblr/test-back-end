const models = require('../../models');
const sequelize = models.sequelize;

const Sequelize = models.Sequelize;
const Op = Sequelize.Op;
const csv = require('csvtojson')


exports.postCity = async (req, res, next) => {
    const csvFilePath = req.file.path;
    const jsonArray = await csv().fromFile(csvFilePath);

    let checkIfCsvUploaded = await models.city.findAll();
    if (checkIfCsvUploaded.length > 0) {
        return res.status(404).json({ messgae: "city Csv is already Uploaded" })
    }
    await sequelize.transaction(async t => {
        await models.city.bulkCreate(jsonArray, { returning: true, transaction: t });

        // for (var i = 0; i < jsonArray.length; i++) {
        //     let data = await models.city.create({ name: jsonArray[i].name, stateId: jsonArray[i].state_id }, { transaction: t })
        // }
    })
    return res.status(200).json({ message: "success" })


}

exports.getCity = async (req, res, next) => {
    const stateId = req.query.stateId;
    let city = await models.city.findAll({
        where: { isActive: true, stateId: stateId },
        attributes: ['id', 'name', 'stateId'],
    });
    res.status(200).json({ message: 'sucess', data: city })


}