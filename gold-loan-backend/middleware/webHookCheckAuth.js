const jwt = require('jsonwebtoken');
const models = require('../models');


module.exports = async (req, res, next) => {
    const token = await req.headers.authorization.split(" ")[1];
    try {
        const secretKey = await models.internalIntegrationApi.getSecretKey();

        const decoded = await jwt.verify(token, secretKey.secretKey);
        req.data = decoded;

        if(decoded.scope == "kyc" || decoded.scope == "withdraw" || decoded.scope == "order"){
            next();
        }else{
            return res.status(401).json({message: "auth failed"});
        }
    } catch (error) {
        return res.status(401).json({message: "auth failed"});
    }
}