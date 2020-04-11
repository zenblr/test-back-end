const models = require('../../models');
const sequelize = models.sequelize;

const Sequelize = models.Sequelize;
const Op = Sequelize.Op;

const check = require('../../lib/checkLib');
const request = require('request');
const { createReferenceCode } = require('../../utils/referenceCode');
//for email
const { sendMail } = require('../../service/emailService')
const CONSTANT = require('../../utils/constant');
const moment = require('moment')

exports.registerSendOtp = async (req, res, next) => {
    let { firstName, lastName, password, mobileNumber, email, panCardNumber, address, roleId } = req.body;
    let userExist = await models.users.findOne({ where: { mobileNumber: mobileNumber } })

    if (!check.isEmpty(userExist)) {
        return res.status(404).json({ message: 'This Mobile number is already Exist' });
    }
    const referenceCode = await createReferenceCode(5);
    let otp = Math.floor(1000 + Math.random() * 9000);
    let createdTime = new Date();
    let expiryTime = moment.utc(createdTime).add(10, 'm')

    await sequelize.transaction(async t => {

        const user = await models.users.create({ firstName, lastName, password, mobileNumber, email, panCardNumber }, { transaction: t })
        if (check.isEmpty(address.length)) {
            for (let i = 0; i < address.length; i++) {
                let data = await models.user_address.create({
                    userId: user.id,
                    address: address[i].address,
                    landMark: address[i].landMark,
                    stateId: address[i].stateId,
                    cityId: address[i].cityId,
                    postalCode: address[i].postalCode
                }, { transaction: t })
            }
        }
        await models.userRole.create({ userId: user.id, roleId: roleId }, { transaction: t })
        await models.userOtp.create({ mobileNumber, otp, createdTime, expiryTime, referenceCode }, { transaction: t })

    })
    request(`${CONSTANT.SMSURL}username=${CONSTANT.SMSUSERNAME}&password=${CONSTANT.SMSPASSWORD}&type=0&dlr=1&destination=${mobileNumber}&source=nicalc&message=For refrence code ${referenceCode} your OTP is ${otp}`);

    // //for email
    // const Emaildata = {
    //     data: `Your otp is ${user.otp}`,
    //     email: user.email
    // }
    // await sendMail(Emaildata)
    // //for email
    return res.status(200).json({ message: 'Otp send to your Mobile number.', referenceCode: referenceCode });

}


exports.verifyRegistrationOtp = async (req, res, next) => {
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
        return res.status(400).json({ message: `Invalid Otp` })
    }
    await sequelize.transaction(async t => {

        let verifyFlag = await models.userOtp.update({ isVerified: true }, { where: { id: verifyUser.id }, transaction: t });

        let user = await models.users.findOne({ where: { mobileNumber: verifyUser.mobileNumber }, transaction: t });

        await models.users.update({ isActive: true }, { where: { id: user.id }, transaction: t });

    })
    return res.json({ message: "Success", referenceCode })
}

exports.sendOtp = async (req, res, next) => {
    const { mobileNumber } = req.body;
    let userDetails = await models.users.findOne({ where: { mobileNumber } });
    if (userDetails) {
        let otp = Math.floor(1000 + Math.random() * 9000);
        const referenceCode = await createReferenceCode(5);
        let createdTime = new Date();
        let expiryTime = moment.utc(createdTime).add(10, 'm');


        await sequelize.transaction(async t => {
            await models.userOtp.destroy({ where: { mobileNumber }, transaction: t })
            await models.userOtp.create({ mobileNumber, otp, createdTime, expiryTime, referenceCode }, { transaction: t })
        })

        request(`${CONSTANT.SMSURL}username=${CONSTANT.SMSUSERNAME}&password=${CONSTANT.SMSPASSWORD}&type=0&dlr=1&destination=${mobileNumber}&source=nicalc&message=For refrence code ${referenceCode} your OTP is ${otp}`);

        return res.status(200).json({ message: 'Otp send to your Mobile number.', referenceCode: referenceCode });

    } else {
        res.status(400).json({ message: 'User does not exists, please contact to Admin' });
    }
}

exports.verifyOtp = async (req, res, next) => {
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
        return res.status(400).json({ message: `Invalid otp` })
    }
    await sequelize.transaction(async t => {
        let verifyFlag = await models.userOtp.update({ isVerified: true }, { where: { id: verifyUser.id }, transaction: t });
    })

    return res.json({ message: "Success", referenceCode })
}

exports.updatePassword = async (req, res, next) => {
    const { referenceCode, otp, newPassword } = req.body
    var todayDateTime = new Date();

    let verifyUser = await models.registerCustomerOtp.findOne({ where: { referenceCode, isVerified: true } })

    if (check.isEmpty(verifyUser)) {
        return res.status(400).json({ message: `Invalid otp.` })
    }
    let user = await models.users.findOne({ where: { mobileNumber: verifyUser.mobileNumber } });

    if (check.isEmpty(user)) {
        return res.status(404).json({ message: 'User not found' });
    }
    let updatePassword = await user.update({ otp: null, password: newPassword }, { where: { id: user.dataValues.id } });
    if(updatePassword[0] == 0){
        return res.status(400).json({message: `Password update failed.`})
    }
    return res.status(200).json({ message: 'Password Updated.' });
}

exports.changePassword = async (req, res, next) => {

    const { oldPassword, newPassword } = req.body
    let userinfo = await models.users.findOne({ where: { id: req.userData.id, isActive: true } });
    if (check.isEmpty(userinfo)) {
        return res.status(200).json({ message: `User not found . Please contact Admin.` })
    }
    let checkPassword = await userinfo.comparePassword(oldPassword);
    if (checkPassword === true) {
        await userinfo.update({ password: newPassword },
            { where: { id: userinfo.id, isActive: true } });
        res.status(200).json({ message: 'Success' })
    } else {
        res.status(200).json({ message: ' wrong credentials' });
    }
}

exports.getUser = async (req, res, next) => {
    try {
        let user = await models.users.findAll({
            include: [{
                model: models.roles,
                include: [{
                    model: models.permission,
                    attributes: ['id', 'permission_name']
                }]
            }]
        });
        res.json(user)

    } catch (error) {
        res.status(500).json(error)
    }
}