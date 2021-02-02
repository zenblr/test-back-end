const models = require('../../models');
const check = require('../../lib/checkLib');
const moment = require('moment')
const Sequelize = models.Sequelize;
const sequelize = models.sequelize;
const Op = Sequelize.Op;

// Add app version
exports.addAppVersion = async (req, res) => {
    const { version } = req.body;
    let appVersion = await models.appVersions.findOne({ where: { version } })
    if (!check.isEmpty(appVersion)) {
        return res.status(404).json({ message: 'This app version is already Exist' });
    }
    let createdAt = moment()
    await sequelize.transaction(async (t) => {

        await models.appVersions.update({ isActive: false }, { where: { isActive: true }, transaction: t })

        await models.addressProofType.create({ version, isForceUpdate: true, isActive: true, createdAt }, { transaction: t });
    })
    return res.status(201).json({ message: 'App version is created' });
}

// Get app version

exports.readAppVersion = async (req, res) => {

    const readAppVersion = await models.appVersions.findOne({ where: { isActive: true } });

    if (!readAppVersion) {
        return res.status(404).json({ message: 'Data not found' });
    }
    return res.status(200).json({ message: 'Success', data: { readAppVersion } });
}
