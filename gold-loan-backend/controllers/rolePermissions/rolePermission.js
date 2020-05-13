const models = require('../../models');
const sequelize = models.sequelize;

const Sequelize = models.Sequelize;
const Op = Sequelize.Op;
const csv = require('csvtojson')


exports.postModule = async (req, res, next) => {
    const data = req.body.data;
    console.log(req.body);
    let checkIfCsvUploaded = await models.module.findAll();
    if (checkIfCsvUploaded.length > 0) {
        return res.status(404).json({ messgae: "Modules are already Uploaded" })
    }
    await sequelize.transaction(async t => {
        await models.module.bulkCreate(data, { returning: true, transaction: t });
    })
    return res.status(200).json({
        message: "success"
    })
}

exports.postEntity = async (req, res, next) => {
    const data = req.body.data;
    console.log(req.body);
    let checkIfCsvUploaded = await models.entity.findAll();
    if (checkIfCsvUploaded.length > 0) {
        return res.status(404).json({ messgae: "entities are already Uploaded" })
    }
    await sequelize.transaction(async t => {
        await models.entity.bulkCreate(data, { returning: true, transaction: t });
    })
    return res.status(200).json({
        message: "success"
    })
}

exports.postPermissions = async (req, res, next) => {
    const data = req.body.data;
    console.log(req.body);
    let checkIfCsvUploaded = await models.permission.findAll();
    if (checkIfCsvUploaded.length > 0) {
        return res.status(404).json({ messgae: "entities are already Uploaded" })
    }
    await sequelize.transaction(async t => {
        await models.permission.bulkCreate(data, { returning: true, transaction: t });
    })
    return res.status(200).json({
        message: "success"
    })
}

exports.postPermissionsSysyemInfo = async (req, res, next) => {
    try{
        const data = req.body.data;
    console.log(req.body);
    let checkIfCsvUploaded = await models.permissionSystemInfo.findAll();
    if (checkIfCsvUploaded.length > 0) {
        return res.status(404).json({ messgae: "permissionSystemInfo are already Uploaded" })
    }
    await sequelize.transaction(async t => {
        await models.permissionSystemInfo.bulkCreate(data, { returning: true, transaction: t });
    })
    return res.status(200).json({
        message: "success"
    })
    } catch(err){
        console.log(err)
    }
    
}
