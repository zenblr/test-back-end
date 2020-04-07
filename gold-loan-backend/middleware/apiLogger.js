const jwt = require('jsonwebtoken');
const models = require('../models');
const redis = require('redis');
const redisConn = require('../config/redis')

const client = redis.createClient(redisConn.PORT, redisConn.HOST);

module.exports = (req, res, next) => {

    const createdDateTime = new Date();

    let skipUrls = [
        "/api/user",
        "/",
        "/api/customer/send-register-otp",
        "/api/auth/user-login",
        "/api/auth/customer-login",
        "/api/user/register-otp",
        "/api/user/verify-otp",
        "/api/user/send-otp",
        "/api/user/update-password"
    ];
    if (!skipUrls.includes(req.originalUrl)) {
        try {
            const token = req.headers.authorization.split(" ")[1];

            client.get(token, (err, result) => {
                if (err) {
                    res.status(400).json({
                        message: err
                    })
                } else if (result) {
                    apilogger(req, token, createdDateTime)
                    next();
                } else {
                    models.logger.findOne({
                            where: {
                                token: token
                            }
                        })
                        .then(loggedInUser => {
                            if (!loggedInUser) {
                                res.status(400).json({
                                    messgage: "You are not login user"
                                })
                            } else {
                                client.set(token, JSON.stringify(token));
                                const todayEnd = new Date().setHours(23, 59, 59, 999);
                                client.expireat(token, parseInt(todayEnd / 1000));
                                apilogger(req, token, createdDateTime)
                                next();
                            }
                        }).catch(error => {
                            res.status(400).json({
                                messgage: "Wrong Credential"
                            })
                        })
                }
            })
        } catch (error) {
            res.status(400).json({
                message: "please login first"
            })
        }
    } else {
        next();

    }
}

let apilogger = (req, token, createdDateTime) => {

    models.apilogger.create({
        userToken: token,
        url: req.url,
        method: req.method,
        host: req.hostname,
        body: req.body,
        createdAt: createdDateTime
    })
}