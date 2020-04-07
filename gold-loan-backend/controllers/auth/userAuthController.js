const models = require('../../models');
const jwt = require('jsonwebtoken');

const { JWT_SECRETKEY, JWT_EXPIRATIONTIME } = require('../../utils/constant');
let check = require('../../lib/checkLib');

exports.userLogin = async(req, res, next) => {

    const { firstName, password } = req.body;

    let checkUser = await models.users.findOne({ where: { firstName: firstName, isActive: true } });
    if (!checkUser) {
        return res.status(404).json({ message: 'Wrong Credentials' })
    }
    let userDetails = await checkUser.comparePassword(password);
    if (userDetails === true) {
        const Token = jwt.sign({
                id: checkUser.dataValues.id,
                mobile: checkUser.dataValues.mobileNumber,
                firstName: checkUser.dataValues.firstName,
                lastName: checkUser.dataValues.lastName,
            },
            JWT_SECRETKEY, {
                expiresIn: JWT_EXPIRATIONTIME
            });

        const decoded = jwt.verify(Token, JWT_SECRETKEY);
        const createdTime = new Date(decoded.iat * 1000).toGMTString();
        const expiryTime = new Date(decoded.exp * 1000).toGMTString();

        await models.users.update({ lastLogin: createdTime }, {
            where: { id: decoded.id }
        });
        models.logger.create({
            userId: decoded.id,
            token: Token,
            expiryDate: expiryTime,
            createdDate: createdTime
        });

        return res.status(200).json({ message: 'login successful', Token });
    } else {
        res.status(401).json({ message: 'Wrong Credentials' });
    }



}