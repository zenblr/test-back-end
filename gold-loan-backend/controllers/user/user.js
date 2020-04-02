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

exports.registerSendOtp = async(req, res) => {
    let { firstName, lastName, password, mobileNumber, email, panCardNumber, address } = req.body;
    let userExist = await models.users.findOne({ where: { mobileNumber: mobileNumber } })

    if (!check.isEmpty(userExist)) {
        return res.status(404).json({ message: 'This Mobile number is already Exist' });
    }
    const refrenceCode = await createRefrenceCode(5);
    let otp = Math.floor(1000 + Math.random() * 9000);

    await sequelize.transaction(async t => {

        const user = await models.users.create({ firstName, lastName, password, mobileNumber, email, otp, panCardNumber }, { transaction: t })
        for (let i = 0; i < address.length; i++) {
            let data = await models.address.create({
                userId: user.id,
                landMark: address[i].landMark,
                stateId: address[i].stateId,
                cityId: address[i].cityId,
                postalCode: address[i].postalCode
            }, { transaction: t })
        }
    }).then(() => {
        request(`${CONSTANT.SMSURL}username=${CONSTANT.SMSUSERNAME}&password=${CONSTANT.SMSPASSWORD}&type=0&dlr=1&destination=${mobileNumber}&source=nicalc&message=For refrence code ${refrenceCode} your OTP is ${otp}`);

        // //for email
        // const Emaildata = {
        //     data: `Your otp is ${user.otp}`,
        //     email: user.email
        // }
        // await sendMail(Emaildata)
        // //for email
        return res.status(200).json({ message: 'Otp send to your Mobile number.', refrenceCode: refrenceCode });
    }).catch((exception) => {
        return res.status(500).json({
            message: "something went wrong",
            data: exception.message
        });
    })

}

exports.verifyRegistrationOtp = async(req, res) => {
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

exports.resendOtp = async(req, res) => {
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