const models = require('../models');
const Sequelize = models.Sequelize;
const Op = Sequelize.Op;
const redis = require('redis');
const redisConn = require('../config/redis')
const redisClient = redis.createClient(redisConn.PORT, redisConn.HOST);

module.exports = async (req, res, next) => {
    try {
        let userId = await req.userData.id;
        let requestInfo = { 'method': req.method, 'baseUrl': req.baseUrl, 'path': req.route.path }

        await redisClient.get(`${userId}permissions`, async (err, result) => {
            if (err) {
                return res.send(err);
            }
            else if (result) {
                result = JSON.parse(result);
                systemData = await result;
                if (systemData.systemInfo.length != 0) {
                    let access = false
                    await systemData.systemInfo.forEach(data => {
                        if (data.method.toLowerCase() === requestInfo.method.toLowerCase() && data.baseUrl.toLowerCase() === requestInfo.baseUrl.toLowerCase() && data.path.toLowerCase() === requestInfo.path.toLowerCase()) {
                            access = true
                        }
                    })
                    if (access) {
                        req.permissionArray = systemData.permissionArray
                        next();
                    } else {
                        res.status(403).json({ message: 'Access denied' })
                    }
                } else {
                    res.status(403).json({ message: 'Access denied' })
                }
            } else {
                let getRole = await models.userRole.getAllRole(userId);
                let roleId = await getRole.map((data) => data.roleId);
                let getPermissions = await models.rolePermission.findAll({
                    where: { roleId: { [Op.in]: roleId } },
                    attributes: ['permissionId']
                });
                let permissionId = await getPermissions.map((data) => data.permissionId);
                let systemInfoData = await models.permissionSystemInfo.findAll({
                    where: { permissionId: { [Op.in]: permissionId } },
                    attributes: ['systemInfo']
                });

                let getPermissionArray = await models.permission.findAll({
                    where: { id: { [Op.in]: permissionId } },
                    attributes: ['description']
                })
                let permissionArray = getPermissionArray.map((singlePermission) => singlePermission.description)
                systemInfo = await systemInfoData.map((data) => data.systemInfo);
                let systemData = {
                    systemInfo: systemInfo,
                    permissionArray: permissionArray
                }
                redisClient.set(`${userId}permissions`, JSON.stringify(systemData));
                const todayEnd = new Date().setHours(23, 59, 59, 999);
                redisClient.expireat(`${userId}permissions`, parseInt(todayEnd / 1000));
                if (systemData.systemInfo.length != 0) {
                    let access = false
                    await systemData.systemInfo.forEach(data => {
                        if (data.method.toLowerCase() === requestInfo.method.toLowerCase() && data.baseUrl.toLowerCase() === requestInfo.baseUrl.toLowerCase() && data.path.toLowerCase() === requestInfo.path.toLowerCase()) {
                            access = true
                        }
                    })
                    if (access) {
                        req.permissionArray = systemData.permissionArray
                        next();
                    } else {
                        res.status(403).json({ message: 'Access denied' })
                    }
                } else {
                    res.status(403).json({ message: 'Access denied' })
                }
            }
        })
    } catch (err) {
        res.status(401).send(err);
    }
};

