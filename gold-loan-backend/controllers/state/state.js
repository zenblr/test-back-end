const models = require('../../models');
const sequelize = models.sequelize;

const Sequelize = models.Sequelize;
const Op = Sequelize.Op;
const csv = require('csvtojson')


exports.postState = async(req, res) => {
    try {
        const csvFilePath = req.file.path;
        const jsonArray = await csv().fromFile(csvFilePath);
        let checkIfCsvUploaded = await models.states.findAll();
        if (checkIfCsvUploaded.length > 0) {
            return res.status(404).json({ messgae: "State Csv is already Uploaded" })
        }

        await sequelize.transaction(async t => {
            for (var i = 0; i < jsonArray.length; i++) {
                let data = await models.states.create({ id: jsonArray[i].id, name: jsonArray[i].name }, { transaction: t })
            }
        }).then(() => {
            res.status(200).json({
                message: "success"
            })

        }).catch((exception) => {
            return res.status(500).json({
                message: "something went wrong",
                data: exception.message
            });
        })

    } catch (error) {
        return res.status(500).json({ message: `Internal server error.` })
    }
}

exports.getState = async(req, res) => {
    try {

        let states = await models.states.findAll({
            where: { isActive: true },
            attributes: ['id', 'name'],
        });
        res.status(200).json({ message: states })

    } catch (err) {
        return res.status(500).json({ message: `Internal server error.` })

    }
}