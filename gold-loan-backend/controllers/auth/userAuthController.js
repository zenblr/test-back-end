


const models = require('../../models');
const sequelize = models.sequelize;
const Sequelize = models.Sequelize;
const Op = Sequelize.Op;
const jwt = require('jsonwebtoken');
const redisConn = require('../../config/redis');
const redis = require('redis');

const client = redis.createClient(redisConn.PORT, redisConn.HOST);



const { JWT_SECRETKEY, JWT_EXPIRATIONTIME } = require('../../utils/constant');
let check = require('../../lib/checkLib');

exports.userLogin = async (req, res, next) => {

    const { mobileNumber, password } = req.body;

    // let checkUser = await models.user.findOne({
    //     where: { mobileNumber, isActive: true },
    //     include: [{ model: models.role }]
    // });


    let checkUser = await models.user.findOne({
        where: {
              [Op.or]: [
                {
                  email: mobileNumber,
                },
                {
                  mobileNumber: mobileNumber,
                }
              ]
          },
          include: [{ model: models.role }]
    })

    if (!checkUser) {
        return res.status(401).json({ message: 'Wrong Credentials' })
    }
    let userDetails = await checkUser.comparePassword(password);
    if (userDetails === true) {
        const Token = jwt.sign({
            id: checkUser.dataValues.id,
            mobile: checkUser.dataValues.mobileNumber,
            firstName: checkUser.dataValues.firstName,
            lastName: checkUser.dataValues.lastName,
            roleId: checkUser.dataValues.roles[0].id,
            roleName: checkUser.dataValues.roles[0].roleName,
        },
            JWT_SECRETKEY, {
            expiresIn: JWT_EXPIRATIONTIME
        });

        const decoded = jwt.verify(Token, JWT_SECRETKEY);
        const createdTime = new Date(decoded.iat * 1000).toGMTString();
        const expiryTime = new Date(decoded.exp * 1000).toGMTString();


        await models.user.update({ lastLogin: createdTime }, {
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
       return res.status(401).json({ message: 'Wrong Credentials' });
    }

}

exports.logout = async (req, res, next) => {
    let token = await req.headers.authorization.split(" ")[1];
    let logout = await models.logger.destroy({ where: { token: token } });
    client.del(token, JSON.stringify(token));

    return res.status(202).json({ message: `logout successfull` })
}

exports.verifyLoginOtp = async (req, res, next) => {
    let { referenceCode, otp } = req.body
    var todayDateTime = new Date();

    let verifyUser = await models.userOtp.findOne({
        where: {
            referenceCode, otp,
            expiryTime: {
                [Op.gte]: todayDateTime
            }
        }
    })
    if (check.isEmpty(verifyUser)) {
        return res.status(401).json({ message: `Invalid Otp` })
    }

    var token = await sequelize.transaction(async t => {
        let verifyFlag = await models.userOtp.update({ isVerified: true }, { where: { id: verifyUser.id }, transaction: t });
        let user = await models.user.findOne({ where: { mobileNumber: verifyUser.mobileNumber }, transaction: t });
        let checkUser = await models.user.findOne({
            where: { id: user.id, isActive: true },
            include: [{ model: models.role }],
            transaction: t
        });
        Token = jwt.sign({
            id: checkUser.dataValues.id,
            mobile: checkUser.dataValues.mobileNumber,
            firstName: checkUser.dataValues.firstName,
            lastName: checkUser.dataValues.lastName,
            roleId: checkUser.dataValues.role[0].id,
            roleName: checkUser.dataValues.role[0].roleName,
        },
            JWT_SECRETKEY, {
            expiresIn: JWT_EXPIRATIONTIME
        });

        const decoded = jwt.verify(Token, JWT_SECRETKEY);
        const createdTime = new Date(decoded.iat * 1000).toGMTString();
        const expiryTime = new Date(decoded.exp * 1000).toGMTString();

        await models.user.update({ lastLogin: createdTime }, {
            where: { id: decoded.id }, transaction: t
        });
        await models.logger.create({
            userId: decoded.id,
            token: Token,
            expiryDate: expiryTime,
            createdDate: createdTime
        }, { transaction: t });
        return Token

    })
    return res.status(200).json({ message: 'login successful', token });

}