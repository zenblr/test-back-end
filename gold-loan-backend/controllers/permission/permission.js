const models = require("../../models");
const check = require('../../lib/checkLib');

//read permissiion
exports.readPermission = async (req, res, next) => {
    let allPermissions = await models.module.findAll(
        {
            where: { isActive : true },
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

