const jwt = require('jsonwebtoken');
const CONSTANT = require('../utils/constant');
const models = require('../models');
const redis = require('redis');
const redisConn = require('../config/redis')

const client = redis.createClient(redisConn.PORT, redisConn.HOST);


module.exports = async (req, res, next) => {
    const token = await req.headers.authorization.split(" ")[1];
    try {
        const decoded = await jwt.verify(token, CONSTANT.JWT_SECRETKEY);
        req.userData = decoded;
        next();
    } catch (error) {
        await models.logger.destroy({ where: { token: token } });
        client.del(token, JSON.stringify(token));
        return res.status(401).json({
            message: "auth failed"
        });
    }

}