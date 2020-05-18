const models = require('../models');
const Sequelize = models.Sequelize;
const Op = Sequelize.Op;
const redis = require('redis');
const redisConn = require('../config/redis')
const redisClient = redis.createClient(redisConn.PORT, redisConn.HOST);

module.exports = async (req, res, next) => {
    try {
        let userId = await req.userData.id;
        let requestInfo = {'method': req.method,'baseUrl': req.baseUrl,'path': req.route.path}
        console.log(requestInfo);

        // return res.json(requestInfo)
        next();
        return
        let systemInfo;

        await redisClient.get(`${userId}permissions`, async (err, result) => {
            if (err) {
                res.send(err);
            }
            else if (result) {
                result = JSON.parse(result);
                systemInfo = await result;
                if (systemInfo.length != 0) {
                    let access = false
                    await systemInfo.forEach(data => {
                        if (data.method.toLowerCase() === requestInfo.method.toLowerCase() && data.baseUrl.toLowerCase() === requestInfo.baseUrl.toLowerCase() && data.path.toLowerCase() === requestInfo.path.toLowerCase()) {
                            access = true
                        }
                    })
                    if (access) {
                        next();
                    } else {
                        res.status(403).json({ message: 'access denied' })
                    }
                } else {
                    res.status(403).json({ message: 'access denied' })
                }
            } else {
                let getRole = await models.userRole.getAllRole(userId);
                let roleId = await getRole.map((data) => data.roleId);
                let getPermissions = await models.rolePermission.findAll({
                    where: { roleId: { [Op.in]: roleId }, isActive: true },
                    attributes: ['permissionId']
                });
                let permissionId = await getPermissions.map((data) => data.permissionId);
                let systemInfoData = await models.permissionSystemInfo.findAll({
                    where: { permissionId: { [Op.in]: permissionId }, isActive: true },
                    attributes: ['systemInfo']
                });
                systemInfo = await systemInfoData.map((data) => data.systemInfo);
                redisClient.set(`${userId}permissions`, JSON.stringify(systemInfo));
                const todayEnd = new Date().setHours(23, 59, 59, 999);
                redisClient.expireat(`${userId}permissions`, parseInt(todayEnd / 1000));
                if (systemInfo.length != 0) {
                    let access = false
                    await systemInfo.forEach(data => {
                        if (data.method.toLowerCase() === requestInfo.method.toLowerCase() && data.baseUrl.toLowerCase() === requestInfo.baseUrl.toLowerCase() && data.path.toLowerCase() === requestInfo.path.toLowerCase()) {
                            access = true
                        }
                    })
                    if (access) {
                        next();
                    } else {
                        res.status(403).json({ message: 'access denied' })
                    }
                } else {
                    res.status(403).json({ message: 'access denied' })
                }
            }
        })
    } catch (err) {
        res.status(401).send(err);
    }
};

