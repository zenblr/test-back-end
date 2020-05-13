const models = require('../../models');
const sequelize = models.sequelize;
const paginationFUNC = require("../../utils/pagination");
const Sequelize = models.Sequelize;
const Op = Sequelize.Op;
const check = require('../../lib/checkLib')
const _ = require('lodash');
const cache = require('../../utils/cache');

//add Role
exports.addRole = async (req, res, next) => {
    const { roleName, description, roleId, moduleId } = req.body;
    let userId = req.userData.id;
    let addRole = await models.role.addRole(roleName, description, userId, userId);
    if (!addRole) {
        res.status(422).json({ message: "failed to create role" });
    } else {
        moduleId.map(async (moduleId) => {
            await models.roleModule.addRoleModule( addRole.id, moduleId );
          });
        if (!roleId) {
            res.status(201).json(addRole);
        } else {
            let getRolePermissions = await models.rolePermission.findAll(
                {
                  where: { roleId, isActive: true },
                  attributes: ['permissionId'],
                  raw: true,
                }
              );
              let permissionsId = await getRolePermissions.map((data) => data.permissionId)
              permissionsId.map(async (permissionId) => {
                await models.rolePermission.create({ roleId : addRole.id, permissionId: permissionId });
              });
            res.status(201).json({"message" : "sucess"});
        }
    }
}

exports.updateRole = async (req, res, next) => {
    try{
        const id = req.params.id;
        const { roleName, description, moduleId } = req.body;
        let userId = req.userData.id;
        let updateRole = await models.role.updateRole(roleName, description, userId, id);
        if (updateRole == 0) {
            res.status(404).json({ message: "failed to update role" });
        } else {
            //update from role module
            let readRoleData = await models.roleModule.getRoleModules(id);
            let oldModuleId = await readRoleData.map((data) => data.moduleId);
            let deleteValue = await _.difference(oldModuleId, moduleId);
            let addValues = await _.difference(moduleId, oldModuleId);
            addValues.map(async (moduleId) => {
                await models.roleModule.addRoleModule( id, moduleId );
            });
            await models.roleModule.destroy({ where: { roleId : id, moduleId: deleteValue } });
            let deletePermissionsId = await models.rolePermission.findAll(
                {
                    where : {
                        isActive : true,
                        roleId : id
                    },
                    attributes: ['permissionId'],
                    include: [
                        {
                          model: models.permission,
                          as:'permission',
                          where: { isActive: true },
                          attributes: [],
                          include: [
                            {
                              model: models.entity,
                              as:'entity',
                              attributes: [],
                              where: { isActive: true,
                                moduleId: {
                                    [Op.in]: deleteValue
                                  } }
                            },
                          ]
                        },
                      ]
                }
            )
            //delete permissions if module permissions exists
            let deletePermissions = await deletePermissionsId.map((data) => data.permissionId);
            await models.rolePermission.destroy({ where: { roleId : id, permissionId: deletePermissions } });
            let users = await models.userRole.getAllUser(id);
            await users.map((data) => cache(`${data.userId}permissions`));
            res.status(200).json({"message" : "success"});
        }
    } catch(err){
        console.log(err)
    }
}

exports.readAllRole = async (req, res, next) => {
    let readRoleData = await models.role.getAllRole();
    if (!readRoleData) {
     res.status(404).json({ message: "Data not found" });
    }
     res.status(200).json( readRoleData );
}

exports.getRoleModules = async (req, res, next) => {
    const roleId = req.params.roleId;
    let readRoleData = await models.roleModule.getRoleModules(roleId);
    let moduleId = await readRoleData.map((data) => data.moduleId)
    res.status(200).json( moduleId );
}


exports.readRolesPagination = async (req, res, next) => {
    const { search, offset, pageSize } = paginationFUNC.paginationWithFromTo(
        req.query.search,
        req.query.from,
        req.query.to
    );
    const searchQuery = {
        [Op.or]:
        {
            roleName: { [Op.iLike]: search + "%" },
            description: { [Op.iLike]: search + "%" }
        },
        isActive: true,
    };
    let readRoleData = await models.role.findAll({
        where: searchQuery,
        order: [["id", "DESC"]],
        offset: offset,
        limit: pageSize,
        include: [
          {
            model: models.user,
            as:'createdByUser',
            attributes: ['firstName','lastName']
          },
          {
            model: models.user,
            as:'updatedByUser',
            attributes: ['firstName','lastName']
          },
          {
            model: models.module,
            attributes: ['id','moduleName']
          },
        ]
    });

    let count = await models.role.findAll({
        where: searchQuery,
        order: [["id", "DESC"]],
        include: [
          {
            model: models.user,
            as:'createdByUser',
            attributes: ['firstName','lastName']
          },
          {
            model: models.user,
            as:'updatedByUser',
            attributes: ['firstName','lastName']
          },
        ]
    });
    if (!readRoleData) {
        return res.status(404).json({ message: "data not found" });
    }
    return res.status(200).json({ data: readRoleData, count: count.length });
};

exports.deleteRole = async (req, res, next) => {
    const roleId = req.params.roleId;
    let assignedToUser = await models.userRole.findAll({ where: { roleId: roleId,isActive : true } });
    if (assignedToUser.length != 0) {
        res.status(422).json({"message":"can't delete role! role is assigned to some user"});
      } else {
        await models.rolePermission.destroy({ where: { roleId : roleId} });
        await models.roleModule.destroy({ where: { roleId : roleId} });
        await models.role.deleteRole(roleId);
        res.status(200).json({ message: "success" });
      }
}



exports.addPermissions = async (req, res) => {
    const { roleId, permissions } = req.body;
    await sequelize.transaction(async t => {
      let rolePermissions = await models.rolePermission.findAll(
        {
          where: { roleId, isActive: true },
          attributes: ['permissionId'],
          raw: true
        },
        { transaction: t }
      );
      let oldPermissions = await rolePermissions.map((data) => data.permissionId)
      let deleteValue = await _.difference(oldPermissions, permissions);
      let addValues = await _.difference(permissions, oldPermissions);
      addValues.map(async (permissionId) => {
        await models.rolePermission.create({ roleId, permissionId: permissionId }, { transaction: t });
      });
      await models.rolePermission.destroy({ where: { roleId, permissionId: deleteValue } }, { transaction: t });
  
    })
    //delete permissions from redis cache
    let users = await models.userRole.getAllUser(roleId);
    await users.map((data) => cache(`${data.userId}permissions`));
    res.status(200).json({ message: "Success" });
  };



