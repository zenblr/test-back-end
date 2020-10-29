const models = require('../../models');
const sequelize = models.sequelize;

const Sequelize = models.Sequelize;
const Op = Sequelize.Op;
const csv = require('csvtojson')


exports.postState = async (req, res, next) => {
    const csvFilePath = req.file.path;
    const jsonArray = await csv().fromFile(csvFilePath);
    let checkIfCsvUploaded = await models.state.findAll();
    if (checkIfCsvUploaded.length > 0) {
        return res.status(404).json({ messgae: "State Csv is already Uploaded" })
    }

    await sequelize.transaction(async t => {
        await models.state.bulkCreate(jsonArray, { returning: true, transaction: t });

        // for (var i = 0; i < jsonArray.length; i++) {
        //     let data = await models.state.create({ id: jsonArray[i].id, name: jsonArray[i].name }, { transaction: t })
        // }
    })
    return res.status(200).json({
        message: "Success"
    })




}

exports.getState = async (req, res, next) => {

    let state = await models.state.findAll({
        where: { isActive: true },
        attributes: ['id', 'name'],
    });
    res.status(200).json({ message: "Success", data: state })


}