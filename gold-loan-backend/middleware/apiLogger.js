const jwt = require('jsonwebtoken');
const models = require('../models');
const redis = require('redis');
const redisConn = require('../config/redis')

const client = redis.createClient(redisConn.PORT, redisConn.HOST);

module.exports = async (req, res, next) => {

    const createdDateTime = new Date();

    const arr = (req._parsedUrl.pathname).split("/");  
    const getParams1 = arr[arr.length - 1];
    const getParams2 = arr[arr.length - 2];

    let url = req.url;
    if(url.slice(0,18) != "/api/customer/app/"){
        let skipUrls = [
            // "/api/customer/banner",
            "/api/customer/offer",
            "/api/customer/lender-banner",
            "/api/customer-feedback",
            "/api/customer/gold-rate",
            "/api/customer/personal-detail",
            "/api/customer/bank-detail",
            "/api/customer/address-detail",
            "/api/customer/nominee-detail",
            "/api/customer/address-proof-image-detail",
            "/api/customer/pan-card-image-detail",
            "/api/customer/partner-branch",
            "/api/customer/get-all-scheme",
            "/api/customer/my-loan",
            "/api/customer/scheme-based-on-price",
            "/api/customer/loan-detail",
            "/api/customer/customer-feedback",
            "/api/single-sign-on",
            // "/api/kyc/submit-kyc",
            // "/api/kyc/get-assigned-customer",
    
    
    
    
            "/api/user/addadmin",
            "/",
            "/api/customer/customer-sign-up",
            "/api/customer/sign-up",
            "/api/customer/send-otp",
            "/api/customer/verify-otp",
            "/api/customer/verify-register-otp",
            "/api/customer/send-register-otp",
            "/api/auth/verify-customer-login",
    
            "/api/auth/user-login",
            "/api/auth/customer-login",
            "/api/auth/verify-login",
    
            "/api/user/",
            "/api/user/register-otp",
            "/api/user/verify-otp",
            "/api/user/send-otp",
            "/api/user/update-password",
            "/api/user/verify-register-otp",
    
            "/api/state",
            "/api/city",
            "/api/identity-type",
            "/api/address-proof-type",
            "/api/occupation",
            "/api/organization-type",

            "/api/digital-gold/rates",
            "/api/digital-gold/bank",
            "/api/digital-gold/customer",
            "/api/digital-gold/customer-address",
            "/api/digital-gold/customer-bank",
            "/api/digital-gold/customer-bank/"+getParams1,
            "/api/digital-gold/customer-kyc",
            "/api/digital-gold/customer/passbook-details",
            "/api/digital-gold/state",
            "/api/digital-gold/city",
            "/api/digital-gold/bank",
            "/api/digital-gold/product",
            "/api/digital-gold/product/"+getParams1,
            "/api/digital-gold/cart",
            "/api/digital-gold/cart/"+getParams1,
            "/api/digital-gold/cart/"+getParams2+"/"+getParams1,
            "/api/digital-gold/redeem-order/delivery",
            "/api/digital-gold/redeem-order/order-info/"+getParams1,
            "/api/digital-gold/redeem-order/invoice/"+getParams1,
            "/api/digital-gold/redeem-order/invoice-web/"+getParams1,
            "/api/digital-gold/buy",
            "/api/digital-gold/buy/buy-metal",
            "/api/digital-gold/buy/buy-info/"+getParams1,
            "/api/digital-gold/buy/generate-invoice/"+getParams1,
            "/api/digital-gold/buy/generate-invoice-web/"+getParams1,
            "/api/digital-gold/sell",
            "/api/digital-gold/sell/sell-info/"+getParams1,
            "/api/digital-gold/payment",
            "/api/digital-gold/withdraw/"+getParams1,
            "/api/digital-gold/contact-us",
            "/api/digital-gold/customer/create-existent-customer"
        ];
        if (!skipUrls.includes(req._parsedUrl.pathname)) {
            try {
                const token = req.headers.authorization.split(" ")[1];
    
                client.get(token, (err, result) => {
                    if (err) {
                        res.status(401).json({
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
                                    res.status(401).json({
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
                                res.status(401).json({
                                    messgage: "Wrong Credential"
                                })
                            })
                    }
                })
            } catch (error) {
                res.status(401).json({
                    message: "please login first"
                })
            }
        } else {
            next();
    
        }
    }else{
        next();
    }

}

let apilogger = (req, token, createdDateTime) => {

    models.apiLogger.create({
        userToken: token,
        url: req.url,
        method: req.method,
        host: req.hostname,
        body: req.body,
        createdAt: createdDateTime
    })
}