const models = require("../../models");
const check = require('../../lib/checkLib');
const Sequelize = models.Sequelize;
const Op = Sequelize.Op;

//read permissiion
exports.readPermission = async (req, res, next) => {
    const roleId = req.params.roleId;
    let getModules = await models.roleModule.findAll({
        where : {roleId, isActive : true},
        attributes: ['moduleId']
    });
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
    if(!allPermissions){
        res.status(404).json({"message": "data not found"});
    } else {
        res.status(200).json(allPermissions);
    }
}

