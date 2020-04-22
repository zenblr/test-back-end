const models = require('../../models');
const sequelize = models.sequelize;

const Sequelize = models.Sequelize;
const Op = Sequelize.Op;
const check = require('../../lib/checkLib')
const _ = require('lodash');

//add Role
exports.addRole = async (req, res, next) => {

    const { roleName, description, permissionId } = req.body;

    let roleExist = await models.role.findOne({ where: { roleName } })
    if (!check.isEmpty(roleExist)) {
        return res.status(404).json({ message: 'This Role is already Exist' });
    }
    await sequelize.transaction(async t => {
        let role = await models.role.create({ roleName, description });
        for (let i = 0; i < permissionId.length; i++) {
            let data = await models.rolePermission.create({
                roleId: role.id,
                permissionId: permissionId[i]
            }, { transaction: t })
        }

    })
    return res.status(200).json({ messgae: `Role created` })

}

//get Role

exports.readRole = async (req, res, next) => {

    let { getAll } = req.query;
    let whereCondition;
    if (getAll == "true") {
        whereCondition = { order: [['id', 'ASC']] }
    } else if (getAll == "false") {
        whereCondition = { where: { isActive: true }, order: [['id', 'ASC']] }
    } else if (getAll == undefined) {
        whereCondition = { order: [['id', 'ASC']] }
    }

    let readRoleData = await models.role.findAll(whereCondition);

    if (!readRoleData) {
        return res.status(404).json({ message: "Data not found" });
    }
    return res.status(200).json({ readRoleData });
}

//update Role

exports.updateRole = async (req, res, next) => {
    const roleId = req.params.id;
    const { roleName, description, permissionId } = req.body;

    const priName = await models.role.findOne({ where: { id: roleId } })

    if (priName.roleName != roleName) {
        let roleExist = await models.role.findOne({ where: { roleName } })
        if (!check.isEmpty(roleExist)) {
            return res.status(404).json({ message: 'This Role is already Exist' });
        }
    }
    let permission = await models.rolePermission.findAll({ where: { roleId }, attributes: ['permissionId'] });
    let permissionIdFromTable = await permission.map(singlePermission => {
        return singlePermission.permissionId
    })

    let deletedId = _.differenceBy(permissionIdFromTable, permissionId);
    let insertId = _.differenceBy(permissionId, permissionIdFromTable);


    await sequelize.transaction(async t => {

        let updateRoleData = await models.role.update({ roleName, description }, { where: { id: roleId }, transaction: t });

        if (deletedId.length != 0) {
            var data = await models.rolePermission.destroy({
                where: {
                    roleId: roleId,
                    permissionId: { [Op.in]: deletedId }
                }, transaction: t
            });
        }
        if (insertId.length != 0) {
            let insertedArray = []
            for (let i = 0; i < insertId.length; i++) {
                let obj = {}
                obj['roleId'] = roleId
                obj['permissionId'] = insertId[i]
                insertedArray.push(obj)
            }
            var bulkCreateRolePermission = await models.rolePermission.bulkCreate(insertedArray, { returning: true, transaction: t });
        }
    })
    return res.status(200).json({ messgae: `Updated ` })


}

//delete Role

exports.deactiveRole = async (req, res, next) => {
    const { stageId, isActive } = req.query;
    let deactiveRole = await models.stage.update({ isActive: isActive }, { where: { id: stageId } })
    if (deactiveRole[0] == 0) { return res.status(404).json({ message: "update failed" }) };
    return res.status(200).json({ message: `Updated` })

}



