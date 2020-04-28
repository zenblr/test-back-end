const jwt = require('jsonwebtoken');
const CONSTANT = require('../utils/constant');
const models = require('../models');
const redis = require('redis');
const redisConn = require('../config/redis')

const client = redis.createClient(redisConn.PORT, redisConn.HOST);


module.exports = async (req, res, next) => {
    try {
        const token = await req.headers.authorization.split(" ")[1];

        const decoded = await jwt.verify(token, CONSTANT.JWT_SECRETKEY);
        req.userData = decoded;
        next();
    } catch (error) {
        let token = await req.headers.authorization.split(" ")[1];
        let abc = await models.logger.destroy({ where: { token: token } });
        console.log(abc)
        client.del(token, JSON.stringify(token));
        return res.status(401).json({
            message: "auth failed"
        });
    }

}