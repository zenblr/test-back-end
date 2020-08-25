const models = require('../../models');
const sequelize = models.sequelize;
const Sequelize = models.Sequelize;
const Op = Sequelize.Op;
const jwt = require('jsonwebtoken');

const { JWT_SECRETKEY, JWT_EXPIRATIONTIME } = require('../../utils/constant');
let check = require('../../lib/checkLib');

exports.customerLogin = async (req, res, next) => {
    const { mobileNumber, password } = req.body;
    let checkCustomer = await models.customer.findOne({ where: { mobileNumber: mobileNumber } });
    if (!checkCustomer) {
        return res.status(404).json({ message: 'Wrong Credentials' })
    }
    let customerDetails = await checkCustomer.comparePassword(password);
    if (customerDetails === true) {
        const Token = jwt.sign({
            id: checkCustomer.dataValues.id,
            mobile: checkCustomer.dataValues.mobileNumber,
            firstName: checkCustomer.dataValues.firstName,
            lastName: checkCustomer.dataValues.lastName,
            userBelongsTo: "customeruser"
        },
            JWT_SECRETKEY, {
            expiresIn: JWT_EXPIRATIONTIME
        });
        const decoded = jwt.verify(Token, JWT_SECRETKEY);
        const createdTime = new Date(decoded.iat * 1000).toGMTString();
        await models.customer.update({ lastLogin: createdTime }, {
            where: { id: decoded.id }
        });

        return res.status(200).json({ message: 'login successful', Token });
    } else {
        return res.status(401).json({ message: 'Wrong Credentials' });
    }

}


exports.verifyCustomerLoginOtp = async (req, res, next) => {
    let { referenceCode, otp } = req.body
    var todayDateTime = new Date();

    let verifyCustomer = await models.customerOtp.findOne({
        where: {
            referenceCode, otp,
            expiryTime: {
                [Op.gte]: todayDateTime
            }
        }
    })
    if (check.isEmpty(verifyCustomer)) {
        return res.status(401).json({ message: `Invalid Otp` })
    }


    var token = await sequelize.transaction(async t => {
        let verifyFlag = await models.customerOtp.update({ isVerified: true }, { where: { id: verifyCustomer.id }, transaction: t });
        let customer = await models.customer.findOne({ where: { mobileNumber: verifyCustomer.mobileNumber }, transaction: t });
        let checkUser = await models.customer.findOne({
            where: { id: customer.id, isActive: true },
            transaction: t
        });

        Token = jwt.sign({
            id: checkUser.dataValues.id,
            mobile: checkUser.dataValues.mobileNumber,
            firstName: checkUser.dataValues.firstName,
            lastName: checkUser.dataValues.lastName,
            userBelongsTo: "customer"
        },
            JWT_SECRETKEY, {
            expiresIn: JWT_EXPIRATIONTIME
        });

        const decoded = jwt.verify(Token, JWT_SECRETKEY);
        const createdTime = new Date(decoded.iat * 1000).toGMTString();
        const expiryTime = new Date(decoded.exp * 1000).toGMTString();

        await models.customer.update({ lastLogin: createdTime }, {
            where: { id: decoded.id }, transaction: t
        });
        await models.customerLogger.create({
            customerId: decoded.id,
            token: Token,
            expiryDate: expiryTime,
            createdDate: createdTime
        }, { transaction: t });
        return Token

    })
    return res.status(200).json({ message: 'login successful', token });

}