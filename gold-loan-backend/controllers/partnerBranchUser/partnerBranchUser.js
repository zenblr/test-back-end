const models = require('../../models');
const sequelize = models.sequelize;
const Sequelize = models.Sequelize;
const Op = Sequelize.Op;
const paginationFUNC = require('../../utils/pagination'); // IMPORTING PAGINATION FUNCTION
const CONSTANT = require('../../utils/constant');
const { createReferenceCode } = require("../../utils/referenceCode");
const request = require("request");
const check = require("../../lib/checkLib"); // IMPORTING CHECKLIB 
const moment = require('moment')
let { sendOtpForLogin, forgetPasswordOtp, sendUpdateLocationCollectMessage, sendUpdateLocationHandoverMessage } = require('../../utils/SMS');
const { sendSms } = require('../../utils/sendSMS')

//FUNCTION FOR SEND OTP PARTNER BRANCH USER
exports.sendOtp = async (req, res, next) => {
    const { mobileNumber, id, type } = req.body;

    let partnerBranchUserExist = await models.partnerBranchUser.findOne({
        where: { mobileNumber, isActive: true },
    });

    if (check.isEmpty(partnerBranchUserExist)) {
        return res.status(200).json({ message: `Mobile number is not Exist.` });
    }

    await models.partnerBranchOtp.destroy({ where: { mobileNumber } });

    const referenceCode = await createReferenceCode(5);
    let otp;
    if (process.env.NODE_ENV == "development" || process.env.NODE_ENV == "test" || process.env.NODE_ENV == "new" || process.env.NODE_ENV == "ekyc") {
        otp = 1234
    } else {
        otp = Math.floor(1000 + Math.random() * 9000);
    }
    let createdTime = new Date();
    let expiryTime = moment(createdTime).add(10, "m");
    
    await sequelize.transaction(async t => {
        await models.partnerBranchOtp.destroy({ where: { mobileNumber }, transaction: t })
        await models.partnerBranchOtp.create({ mobileNumber, otp, createdTime, expiryTime, referenceCode }, { transaction: t })
    })
    var expiryTimeToUser = moment(moment(expiryTime).utcOffset("+05:30"));

    if (type == "login") {
        let smsLink = process.env.BASE_URL_ADMIN
        await sendOtpForLogin(partnerBranchUserExist.mobileNumber, partnerBranchUserExist.firstName, otp, expiryTimeToUser, smsLink);
    } else if (type == "forget") {
        let smsLink = process.env.BASE_URL_ADMIN
        await forgetPasswordOtp(partnerBranchUserExist.mobileNumber, partnerBranchUserExist.firstName, otp, expiryTimeToUser, smsLink);
    } else if (type == "updateLocationCollect") {
        let receiverUser = await models.user.findOne({ where: { id: id } })
        await sendUpdateLocationCollectMessage(partnerBranchUserExist.mobileNumber, otp, partnerBranchUserExist.firstName, receiverUser.firstName);
    } if (type == "updateLocationHandover") {
        let receiverUser = await models.user.findOne({ where: { id: id } })
        await sendUpdateLocationHandoverMessage(partnerBranchUserExist.mobileNumber, otp, partnerBranchUserExist.firstName, receiverUser.firstName);
    }


    return res
        .status(200)
        .json({
            message: `Otp send to your entered mobile number.`,
            referenceCode,
        });
};


//FUNCTION FOR VERI OTP PARTNER BRANCH USER
exports.verifyOtp = async (req, res, next) => {
    let { referenceCode, otp } = req.body;
    var todayDateTime = new Date();

    let partnerBranchUser = await models.partnerBranchOtp.findOne({
        where: {
            referenceCode,
            otp,
            expiryTime: {
                [Op.gte]: todayDateTime,
            },
        },
    });
    if (check.isEmpty(partnerBranchUser)) {
        return res.status(404).json({ message: `INVALID OTP.` });
    }

    let verifyFlag = await models.partnerBranchOtp.update(
        { isVerified: true },
        { where: { id: partnerBranchUser.id } }
    );

    return res.status(200).json({ message: "Success", referenceCode });
};


//FUNCTION TO ADD PARTNER BRANCH USER
exports.addPartnerBranchUser = async (req, res) => {
    let { partnerId, branchId, firstName, lastName, mobileNumber, email, stateId, cityId, pinCode, partnerBranchUserUniqueId, isActive } = req.body;

    let createdBy = req.userData.id;
    let modifiedBy = req.userData.id;
    let checkNumberExist = await models.partnerBranchUser.findOne({ where: { mobileNumber: mobileNumber } })

    if (!check.isEmpty(checkNumberExist)) {
        return res.status(400).json({ message: "Mobile number is already Exist" })
    }

    await sequelize.transaction(async t => {

        let PartnerBranchUser = await models.partnerBranchUser.create({
            partnerId, branchId, firstName, lastName, mobileNumber, email, stateId, cityId, pinCode, partnerBranchUserUniqueId, isActive, createdBy, modifiedBy
        }, { transaction: t });
        //console.log(PartnerBranchUser)
        //id = PartnerBranchUser.dataValues.id
        // let partnerData = await models.partner.findOne({ where: { id: PartnerBranchUser.dataValues.partnerId }, transaction: t });

        // let partnerBranchData = await models.partnerBranch.findOne({ where: { id: PartnerBranchUser.dataValues.partnerId }, transaction: t })

        return PartnerBranchUser
    })
    return res.status(201).json({ message: 'User Created' })
}

//FUNCTION TO UPDATE PARTNER BRANCH USER
exports.updatePartnerBranchUser = async (req, res) => {

    const partnerBranchUserId = req.params.id;

    let modifiedBy = req.userData.id;
    let { partnerId, branchId, firstName, lastName, mobileNumber, email, stateId, cityId, pinCode, isActive } = req.body;

    let checkNumberExist = await models.partnerBranchUser.findOne({ where: { id: { [Op.not]: partnerBranchUserId }, mobileNumber: mobileNumber } })

    if (!check.isEmpty(checkNumberExist)) {
        return res.status(400).json({ message: "Mobile number is already Exist" })
    }

    let updateUser = await models.partnerBranchUser.update({
        partnerId, branchId, firstName, lastName, mobileNumber, email, stateId, cityId, pinCode, isActive, modifiedBy
    }, { where: { id: partnerBranchUserId, isActive: true } });
    if (updateUser[0] == 0) {
        return res.status(404).json({ message: 'Update failed' })
    }
    return res.status(200).json({ message: 'User updated' })
}

//FUNCTION TO GET ALL PARTNER BRANCH USER
exports.readPartnerBranchUser = async (req, res) => {
    let { search, offset, pageSize } =
        paginationFUNC.paginationWithFromTo(req.query.search, req.query.from, req.query.to);

    let query = {};
    let associateModel = [
        {
            model: models.partner,
            as: 'partner',
            attributes: ['id', 'partnerId', 'name']
        },
        {
            model: models.partnerBranch,
            as: 'partnerBranch',
            attributes: { exclude: ['createdBy', 'modifiedBy', 'createdAt', 'updatedAt'] }
        },
        {
            model: models.state,
            as: 'state'
        },
        {
            model: models.city,
            as: 'city'
        }

    ]
    let searchQuery = {
        [Op.and]: [query, {
            [Op.or]: {
                firstName: { [Op.iLike]: search + '%' },
                lastName: { [Op.iLike]: search + '%' },
                mobileNumber: { [Op.iLike]: search + '%' },
                email: { [Op.iLike]: search + '%' },
                "$partner.name$": { [Op.iLike]: search + '%' },
                "$partnerBranch.name$": { [Op.iLike]: search + '%' }
            }
        },
        ],
        isActive: true
    }


    let partnerBranchUser = await models.partnerBranchUser.findAll({
        where: searchQuery,
        subQuery: false,
        include: associateModel,
        offset: offset,
        limit: pageSize,
    });
    let count = await models.partnerBranchUser.findAll({
        where: searchQuery,
        subQuery: false,
        include: associateModel,
        offset: offset,
        limit: pageSize,
    });

    if (partnerBranchUser.length === 0) {
        return res.status(200).json({ data: [] })
    } else {
        return res.status(200).json({ Data: partnerBranchUser, count: count.length })
    }

}

//FUNCTION TO GET SINGLE PARTNER BRANCH USER
exports.readPartnerBranchUserById = async (req, res) => {
    let { Userid } = req.query

    let UserData = await models.partnerBranchUser.findOne({
        where: {
            id: Userid,
            isActive: true
        },
        include: [
            {
                model: models.partner,
                as: 'partner',
                attributes: ['id', 'partnerId', 'name']
            },
            {
                model: models.partnerBranch,
                as: 'partnerBranch',
                attributes: { exclude: ['createdBy', 'modifiedBy', 'createdAt', 'updatedAt'] }
            }

        ]
    });
    if (UserData) {
        return res.status(200).json({ Data: UserData })
    } else {
        return res.status(404).json({ message: 'Data not found!' })
    }

}

//FUNCTION TO DELETE PARTNER BRANCH USER
exports.deactivatePartnerBranchUser = async (req, res) => {

    const { id, isActive } = req.query;
    let partnerbranchUser = await models.partnerBranchUser.update({ isActive: isActive }, { where: { id: id } })
    if (partnerbranchUser[0] == 0) {
        return res.status(404).json({ message: "User deletion failed!" });
    }
    return res.status(200).json({ message: `User Deleted` })

}

exports.getBranchByPartnerId = async (req, res) => {
    let Id = req.params.id
    let allBranch = await models.partnerBranch.findAll({
        where: { partnerId: Id, isActive: true }
    });
    if (allBranch) {
        return res.status(200).json({ data: allBranch, count: allBranch.length });
    } else {
        return res.status(404).json({ message: 'Data not found!' });
    }
}