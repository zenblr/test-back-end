const models = require('../../models');
const sequelize = models.sequelize;

const Sequelize = models.Sequelize;
const Op = Sequelize.Op;
const paginationFUNC = require("../../utils/pagination");
const check = require('../../lib/checkLib');
const request = require('request');
const { createReferenceCode } = require('../../utils/referenceCode');
//for email
const { sendMail } = require('../../service/emailService')
const CONSTANT = require('../../utils/constant');
const moment = require('moment');
const cache = require('../../utils/cache');
let sms = require('../../utils/sendSMS');
let baseUrl = require('../../config/baseUrl');
const { sendOtpForLogin, forgetPasswordOtp } = require('../../utils/SMS')


exports.addUser = async (req, res, next) => {
    let { firstName, lastName, password, mobileNumber, email, panCardNumber, address, roleId, userTypeId, internalBranchId } = req.body;
    let userMobileNumberExist = await models.user.findOne({ where: { mobileNumber: mobileNumber } })
    if (!check.isEmpty(userMobileNumberExist)) {
        return res.status(404).json({ message: 'This Mobile number is already Exist' });
    }
    let userEmailExist = await models.user.findOne({ where: { email: email } })
    if (!check.isEmpty(userEmailExist)) {
        return res.status(404).json({ message: 'This Email id is already Exist' });
    }

    let createdBy = req.userData.id
    let modifiedBy = req.userData.id

    await sequelize.transaction(async t => {

        const user = await models.user.create({ firstName, lastName, password, mobileNumber, email, panCardNumber, userTypeId, createdBy, modifiedBy }, { transaction: t })
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
        // console.log(req.body.internalBranchId);
        // console.log(internalBranchId.length)
        if (check.isEmpty(internalBranchId)) {
            let data = await models.userInternalBranch.create({
                userId: user.id,
                internalBranchId: internalBranchId
            }, { transaction: t })
        }
        await models.userRole.create({ userId: user.id, roleId: roleId }, { transaction: t })


        return res.status(200).json({ message: 'User Created.' });

    })
}

exports.sendOtp = async (req, res, next) => {
    const { mobileNumber, type } = req.body;
    let userDetails = await models.user.findOne({ where: { mobileNumber } });
    if (userDetails) {
        // let otp = Math.floor(1000 + Math.random() * 9000);
        let otp = 1234;
        const referenceCode = await createReferenceCode(5);
        let createdTime = moment(new Date());
        let expiryTime = moment.utc(createdTime).add(10, 'm');

        var expiryTimeToUser = moment(moment.utc(expiryTime).toDate()).format('YYYY-MM-DD HH:mm');

        await sequelize.transaction(async t => {
            await models.userOtp.destroy({ where: { mobileNumber }, transaction: t })
            await models.userOtp.create({ mobileNumber, otp, createdTime, expiryTime, referenceCode }, { transaction: t })
        })

        // if (type == "login") {
        //     await sendOtpForLogin(userDetails.mobileNumber, userDetails.firstName, otp, expiryTimeToUser)
        // }else if(type == "forget"){
        //     await forgetPasswordOtp(userDetails.mobileNumber, userDetails.firstName, otp, expiryTimeToUser)
        // }
        let message = await `Dear customer, Your OTP for completing the order request is ${otp}.`
        await sms.sendSms(mobileNumber, message);
        // request(`${CONSTANT.SMSURL}username=${CONSTANT.SMSUSERNAME}&password=${CONSTANT.SMSPASSWORD}&type=0&dlr=1&destination=${mobileNumber}&source=nicalc&message=For refrence code ${referenceCode} your OTP is ${otp}. This otp is valid for only 10 minutes`);

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

    let verifyUser = await models.userOtp.findOne({ where: { referenceCode, isVerified: true } })

    if (check.isEmpty(verifyUser)) {
        return res.status(400).json({ message: `Invalid otp.` })
    }
    let user = await models.user.findOne({ where: { mobileNumber: verifyUser.mobileNumber } });

    if (check.isEmpty(user)) {
        return res.status(404).json({ message: 'User not found' });
    }
    let updatePassword = await user.update({ otp: null, password: newPassword }, { where: { id: user.dataValues.id } });
    if (updatePassword[0] == 0) {
        return res.status(400).json({ message: `Password update failed.` })
    }
    return res.status(200).json({ message: 'Password Updated.' });
}


exports.changePassword = async (req, res, next) => {

    const { oldPassword, newPassword } = req.body
    let userinfo = await models.user.findOne({ where: { id: req.userData.id, isActive: true } });
    if (check.isEmpty(userinfo)) {
        return res.status(200).json({ message: `User not found . Please contact Admin.` })
    }
    let checkPassword = await userinfo.comparePassword(oldPassword);
    if (checkPassword === true) {
        await userinfo.update({ password: newPassword },
            { where: { id: userinfo.id, isActive: true } });
        return res.status(200).json({ message: 'Success' })
    } else {
        return res.status(400).json({ message: ' The password you entered is incorrect Please retype your current password.' });
    }
}


exports.getUser = async (req, res, next) => {
    let user = await models.user.findAll({
        include: [{
            model: models.role,
            where: {
                isActive: true
            }
        }, {
            model: models.internalBranch,
            where: {
                isActive: true
            }

        }]
    });
    return res.json(user)
}

exports.getInternalBranchUser = async (req, res, next) => {
    let internalBranchUser = await models.internalBranch.findAll({
        include: [
            {
                model: models.user,
                where: {
                    isActive: true
                }
            }]
    });
    return res.json(internalBranchUser);
}

//only for adding admin temporary
exports.addAdmin = async (req, res, next) => {
    let { firstName, lastName, password, mobileNumber, email, panCardNumber, address, roleId, userTypeId } = req.body;
    let userMobileNumberExist = await models.user.findOne({ where: { mobileNumber: mobileNumber } })
    if (!check.isEmpty(userMobileNumberExist)) {
        return res.status(404).json({ message: 'This Mobile number is already Exist' });
    }
    let userEmailExist = await models.user.findOne({ where: { email: email } })
    if (!check.isEmpty(userEmailExist)) {
        return res.status(404).json({ message: 'This Email id is already Exist' });
    }

    await sequelize.transaction(async t => {

        const user = await models.user.create({ firstName, lastName, password, mobileNumber, email, panCardNumber, userTypeId }, { transaction: t })
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
    })

    return res.status(200).json({ message: 'User Created.' });

}

//query for add user
// INSERT INTO "user" (firstName, lastName, password, mobileNumber, email, panCardNumber, userTypeId) 
// VALUES ('rupesh','ayare', crypt('password1', gen_salt('bf', 10)),"9324495603", "rupesh@nimapinfotech.com","asdfg1234g",1);

//Add internal user
exports.addInternalUser = async (req, res, next) => {
    let { firstName, lastName, mobileNumber, email, internalBranchId, roleId, userTypeId, userUniqueId } = req.body;
    let createdBy = req.userData.id
    let modifiedBy = req.userData.id
    let password = firstName.slice(0, 3) + '@' + mobileNumber.slice(mobileNumber.length - 5, 9);

    await sequelize.transaction(async t => {
        const user = await models.user.create({ userUniqueId, firstName, lastName, password, mobileNumber, email, userTypeId, createdBy, modifiedBy }, { transaction: t })
        await models.userRole.create({ userId: user.id, roleId }, { transaction: t })
        if (internalBranchId != null && internalBranchId != undefined) {
            await models.userInternalBranch.create({ userId: user.id, internalBranchId }, { transaction: t })
        }
    })
    // request(
    //     `${CONSTANT.SMSURL}username=${CONSTANT.SMSUSERNAME}&password=${CONSTANT.SMSPASSWORD}&type=0&dlr=1&destination=${mobileNumber}&source=nicalc&message=your password is ${password}`
    //   );
    return res.status(200).json({ message: 'User Created.' });
}

exports.updateInternalUser = async (req, res, next) => {
    const id = req.params.id;
    let { firstName, lastName, mobileNumber, email, internalBranchId, userTypeId, roleId } = req.body;
    let modifiedBy = req.userData.id;
    await sequelize.transaction(async t => {
        const user = await models.user.update({ firstName, lastName, mobileNumber, userTypeId, email, modifiedBy }, { where: { id: id }, transaction: t })
        await models.userRole.destroy({ where: { userId: id }, transaction: t });
        await models.userRole.create({ userId: id, roleId }, { transaction: t });
        if (internalBranchId != null && internalBranchId != undefined) {
            await models.userInternalBranch.destroy({ where: { userId: id }, transaction: t });
            await models.userInternalBranch.create({ userId: id, internalBranchId }, { transaction: t })
        }
    })
    let userId = [id];
    models.axios.post(`${baseUrl.EMIAPI}/api/roles`, { userId });
    cache(`${id}permissions`);
    cache(`${id}`);
    return res.status(200).json({ message: 'User updated.' });
}

exports.deleteInternalUser = async (req, res, next) => {
    const id = req.params.id;
    let modifiedBy = req.userData.id;
    await sequelize.transaction(async t => {
        const user = await models.user.update({ isActive: false, modifiedBy }, { where: { id: id } })
        await models.userRole.destroy({ where: { userId: id } });
    })
    let userId = [id];
    models.axios.post(`${baseUrl.EMIAPI}/api/roles`, { userId });
    cache(`${id}permissions`);
    cache(`${id}`);
    return res.status(200).json({ message: 'User deleted.' });
}

exports.GetInternalUser = async (req, res) => {
    const { search, offset, pageSize } = paginationFUNC.paginationWithFromTo(
        req.query.search,
        req.query.from,
        req.query.to
    );


    let includeArray = [
        {
            model: models.role,
            where: { isActive: true },
            subQuery: false
        },
        {
            model: models.internalBranch,
            subQuery: false
        },
        {
            model: models.userType,
            as: 'Usertype',
            where: { isInternal: true },
            attributes: []
        }
    ]
    let searchQuery = {
        [Sequelize.Op.or]: {
            firstName: { [Sequelize.Op.iLike]: search + "%" },
            lastName: { [Sequelize.Op.iLike]: search + "%" },
            mobileNumber: { [Sequelize.Op.iLike]: search + "%" },
            email: { [Sequelize.Op.iLike]: search + "%" },
            //   "$internalBranch.internal_branch_id$": {
            //       [Op.iLike]: search + "%",
            //     },
            "$roles.role_name$": {
                [Op.iLike]: search + "%",
            }
        },
        isActive: true,
    }
    let userData = await models.user.findAll({
        where: searchQuery,
        offset: offset,
        limit: pageSize,
        include: includeArray,
        subQuery: false
    });
    let count = await models.user.findAll({
        where: searchQuery,
        include: includeArray,
        subQuery: false
    });
    res.status(200).json({
        data: userData,
        count: count.length
    });
}


//getAppraiser

exports.getAppraiser = async (req, res, next) => {

    let id = req.userData.id
    // let logedInUser = await models.user.findOne({
    //     where: { id },
    //     include: [models.internalBranch]
    // })
    // let branchId = logedInUser.internalBranches[0].id
    // let branchId = req.userData.internalBranchId
    let { internalBranchId } = req.query

    let getAppraiserList = await models.user.findAll({
        where: { isActive: true },
        attributes: ['id', 'firstName', 'lastName'],
        include: [{
            model: models.internalBranch,
            where: { id: internalBranchId }
        }, {
            model: models.userType,
            as: 'Usertype',
            where: { isInternal: true, userType: 'Appraiser' },
            attributes: []
        }]
    })

    return res.status(200).json({ message: 'success', data: getAppraiserList })

}


//getReleaser

exports.getReleaser = async (req, res, next) => {

    let id = req.userData.id
    let { internalBranchId } = req.query

    let getReleaserList = await models.user.findAll({
        where: { isActive: true },
        attributes: ['id', 'firstName', 'lastName'],
        include: [{
            model: models.internalBranch,
            where: { id: internalBranchId }
        }, {
            model: models.userType,
            as: 'Usertype',
            where: { isInternal: true, userType: 'Releaser' },
            attributes: []
        }]
    })

    return res.status(200).json({ message: 'success', data: getReleaserList })

}

exports.getUserTypeInternal = async (req, res, next) => {

    let userType = await models.userType.findAll({
        where: { isInternal: true, isActive: true },
        attributes: ['id', 'userType']
    })

    return res.status(200).json({ data: userType })
}