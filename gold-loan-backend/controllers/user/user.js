const models = require('../../models');
const sequelize = models.sequelize;

const Sequelize = models.Sequelize;
const Op = Sequelize.Op;

const check = require('../../lib/checkLib');
const request = require('request');
const { createRefrenceCode } = require('../../utils/refrenceCode');
//for email
const { sendMail } = require('../../service/EmailService')
const CONSTANT = require('../../utils/constant');

exports.registerSendOtp = async (req, res, next) => {
    let { firstName, lastName, password, mobileNumber, email, panCardNumber, address, roleId } = req.body;
    let userExist = await models.users.findOne({ where: { mobileNumber: mobileNumber } })

    if (!check.isEmpty(userExist)) {
        return res.status(404).json({ message: 'This Mobile number is already Exist' });
    }
    const refrenceCode = await createRefrenceCode(5);
    let otp = Math.floor(1000 + Math.random() * 9000);

    await sequelize.transaction(async t => {

        const user = await models.users.create({ firstName, lastName, password, mobileNumber, email, otp, panCardNumber }, { transaction: t })
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
        await models.user_role.create({ userId: user.id, roleId: roleId }, { transaction: t })
    })
    request(`${CONSTANT.SMSURL}username=${CONSTANT.SMSUSERNAME}&password=${CONSTANT.SMSPASSWORD}&type=0&dlr=1&destination=${mobileNumber}&source=nicalc&message=For refrence code ${refrenceCode} your OTP is ${otp}`);

    // //for email
    // const Emaildata = {
    //     data: `Your otp is ${user.otp}`,
    //     email: user.email
    // }
    // await sendMail(Emaildata)
    // //for email
    return res.status(200).json({ message: 'Otp send to your Mobile number.', refrenceCode: refrenceCode });

}

exports.verifyRegistrationOtp = async (req, res, next) => {
    const { mobileNumber, otp } = req.body;
    let user = await models.users.findOne({ where: { mobileNumber: mobileNumber } });

    if (check.isEmpty(user)) {
        return res.status(404).json({ message: 'User not found' });
    }
    if (user.dataValues.otp === otp) {
        let verifyUser = await models.users.update({ otp: null, isActive: true }, { where: { id: user.dataValues.id } });

        ////for Email    
        // const Emaildata = {
        //     data: `Your Login Credentials userName: ${user.firstName} & password: ${password}`,
        //     email: user.email
        // }
        // await sendMail(Emaildata)
        ////for Email    

        return res.status(200).json({ message: 'Success' });
    } else {
        return res.status(400).json({ message: 'Invalid OTP' });
    }

}

exports.sendOtp = async (req, res, next) => {
    const { mobileNumber } = req.body;
    let userDetails = await models.users.findOne({ where: { mobileNumber } });
    if (userDetails) {
        let otp = Math.floor(1000 + Math.random() * 9000);
        const refrenceCode = await createRefrenceCode(5);
        let otpAdded = await models.users.update({ otp }, { where: { id: userDetails.id } });

        request(`${CONSTANT.SMSURL}username=${CONSTANT.SMSUSERNAME}&password=${CONSTANT.SMSPASSWORD}&type=0&dlr=1&destination=${mobileNumber}&source=nicalc&message=For refrence code ${refrenceCode} your OTP is ${otp}`);

        return res.status(200).json({ message: 'Otp send to your Mobile number.', refrenceCode: refrenceCode });

    } else {
        res.status(400).json({ message: 'User does not exists, please contact to Admin' });
    }
}

exports.updatePassword = async (req, res, next) => {
    const { mobileNumber, otp, newPassword } = req.body

    let user = await models.users.findOne({ where: { mobileNumber: mobileNumber } });
    if (check.isEmpty(user)) {
        return res.status(404).json({ message: 'User not found' });
    }
    if (user.dataValues.otp === otp) {
        let verifyUser = await user.update({ otp: null, password: newPassword }, { where: { id: user.dataValues.id } });

        return res.status(200).json({ message: 'Password Updated.' });
    }

    return res.json({ message: `not match` })


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