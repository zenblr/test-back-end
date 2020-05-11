const jwt = require('jsonwebtoken');
const models = require('../models');
const redis = require('redis');
const redisConn = require('../config/redis')

const client = redis.createClient(redisConn.PORT, redisConn.HOST);

module.exports = (req, res, next) => {

    const createdDateTime = new Date();

    let includeUrls = [        
       "/api/customer/banner",
       "/api/customer/offer",
       "/api/customer/lender-banner"
    ];
    console.log(req.originalUrl)
    if (includeUrls.includes(req.originalUrl)) {
        try {
            const token = req.headers.authorization.split(" ")[1];
            console.log(token)

            // client.get(token, (err, result) => {
                // if (err) {
                //     res.status(400).json({
                //         message: err
                //     })
                // } else if (result) {
                //     customerApiLogger(req, token, createdDateTime)
                //     next();
                // } else {
                    models.customerLogger.findOne({
                            where: {
                                token: token
                            }
                        })
                        .then(loggedInUser => {
                            if (!loggedInUser) {
                                res.status(401).json({
                                    messgage: "You are not login customer"
                                })
                            } else {
                                client.set(token, JSON.stringify(token));
                                const todayEnd = new Date().setHours(23, 59, 59, 999);
                                client.expireat(token, parseInt(todayEnd / 1000));
                                customerApiLogger(req, token, createdDateTime)
                                next();
                            }
                        }).catch(error => {
                            res.status(401).json({
                                messgage: "Wrong Credential"
                            })
                        })
                // }
            // })
        } catch (error) {
            res.status(401).json({
                message: "please login first"
            })
        }
    } else {
        next();

    }
}

let customerApiLogger = (req, token, createdDateTime) => {
console.log("ancd")
    models.customerApiLogger.create({
        customerToken: token,
        url: req.url,
        method: req.method,
        host: req.hostname,
        body: req.body,
        createdAt: createdDateTime
    })
}