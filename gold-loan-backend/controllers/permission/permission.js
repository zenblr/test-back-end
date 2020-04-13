const models = require("../../models");
const check= require('../../lib/checkLib');

//add permission
exports.addPermission = async (req, res, next) => {
    const { permissionName, description } = req.body;

    let permissionExist = await models.permission.findOne({ where: { permissionName } })
    if (!check.isEmpty(permissionExist)) {
        return res.status(404).json({ message: 'This Permission is already Exist' });
    }

    let addPermissionData = await models.permission.create({ permissionName, description });
    if (!addPermissionData) {
        return res.status(422).json({ message: "data not created" });
    }
    return res.status(201).json({ message: 'permission created' });

}

//read permissiion
exports.readPermission = async (req, res, next) => {
    let { getAll } = req.query;

    let whereCondition;
    if (getAll == "true") {
        whereCondition = {order: [['id', 'ASC']]}
    } else {
        whereCondition = { where: { isActive: true },  order: [['id', 'ASC']]}
        
    }

    let readPermissionData = await models.permission.findAll(whereCondition);

    if (!readPermissionData) {
        return res.status(404).json({ message: "data not found" });
    }
    return res.status(200).json(readPermissionData);
}

//update permission

exports.updatePermission = async (req, res, next) => {
    const permissionId = req.params.id;
    const { permissionName, description } = req.body
    let permissionExist = await models.permission.findOne({ where: { permissionName } })
    if (!check.isEmpty(permissionExist)) {
        return res.status(404).json({ message: 'This Permission is already Exist' });
    }

    let updatePermissionData = await models.permission.update({ permissionName, description }, { where: { id: permissionId } });
    if (updatePermissionData[0] === 0) { return res.status(404).json({ message: 'permission update failed' }) }
    return res.status(200).json({ message: 'Updated' });
}

// delete permission

exports.deactivePermission = async (req, res, next) => {
    const { permissionId, isActive } = req.query;
    let deactivePermission = await models.permission.update({ isActive: isActive }, { where: { id: permissionId } });
    if (deactivePermission[0] == 0) {
        return res.status(404).json({ message: "permission deleted failed" });
    }
    return res.status(200).json({ message: "Success" });
}