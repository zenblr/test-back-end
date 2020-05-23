const models = require("../../models");
const check = require('../../lib/checkLib');
const Sequelize = models.Sequelize;
const Op = Sequelize.Op;
const _ = require('lodash');

//read permissiion
exports.readPermission = async (req, res, next) => {
    const roleId = req.params.roleId;
    let getModules = await models.roleModule.findAll({
        where : {roleId, isActive : true},
        attributes: ['moduleId']
    });
    let getEntityPermissions = await models.rolePermission.findAll(
        {
            where : {
                isActive : true,
                roleId : roleId
            },
            include: [
                {
                  model: models.permission,
                  as:'permission',
                  where: { isActive: true },
                  attributes: ['id','entityId']
                },
              ]
        }
    )
    let allEntityId = await getEntityPermissions.map((entity) => entity.permission.entityId);
    let permissionId = await getEntityPermissions.map((permission) => permission.permission.id);
    let entityId= await _.uniq(allEntityId);
    let moduleId = await getModules.map((module) => module.moduleId)
    let allPermissions = await models.module.findAll(
        {
            where: {
                id: {
                    [Op.in]: moduleId
                  },
                 isActive : true
                 },
            attributes: ['id', 'moduleName'],
            include: [
                {
                    model: models.entity,
                    as: 'entity',
                    attributes: ['id', 'entityName'],
                    where: { isActive: true },
                    include: [
                        {
                            model: models.permission,
                            as: 'permission',
                            attributes: ['id', 'actionName'],
                            where: { isActive: true }
                        },
                    ]
                }
            ]
        }
    )


    let permissions=[];
    allPermissions.map(data=>{
      console.log(data)
      data.entity.map(entity => {
        let isExist=entityId.filter(id=>id==entity.dataValues.id)
        if(isExist.length!=0){
            entity.dataValues.isSelected=true
                } else {
            entity.dataValues.isSelected=false
        }
        entity.permission.map(permission => {
            let isExist=permissionId.filter(id=>id==permission.id)
            if(isExist.length!=0){
                      permission.dataValues.isSelected=true
                      entitySelected=true;
                    } else {
                        permission.dataValues.isSelected=false
            }
        })
        
      })
      permissions.push(data);
        return permissions;
    })




    if(!allPermissions){
        res.status(404).json({"message": "data not found"});
    } else {
        res.status(200).json({ permissions});
    }
}

exports.addsystemInfoPermissions = async (req, res) => {
      const dataArray = req.body;
      let createdPermissions = await models.permissionSystemInfo.bulkCreate(dataArray, { returning: true });
      if (!createdPermissions) {
        res.status(422).json({ message: 'permissions not created' });
      } else {
        res.status(201).json(createdPermissions);
      }
  }

