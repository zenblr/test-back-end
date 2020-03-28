const jwt = require('jsonwebtoken');
const CONSTANT = require('../utils/constant');

module.exports = async(req, res, next) => {
    try {
        const token = await req.headers.authorization.split(" ")[1];

        const decoded = await jwt.verify(token, CONSTANT.JWT_SECRETKEY);
        req.userData = decoded;
        next();
    } catch (error) {
        return res.status(401).json({
            message: "auth failed"
        });
    }

}