const models = require('../../models');
const sequelize = models.sequelize;

const Sequelize = models.Sequelize;
const Op = Sequelize.Op;
const { createReferenceCode } = require('../../utils/referenceCode');

const request = require('request');
const moment = require('moment')
const CONSTANT = require('../../utils/constant');



const check = require('../../lib/checkLib');
const { paginationWithFromTo } = require("../../utils/pagination");

exports.addCustomer = async (req, res, next) => {
    let { firstName, lastName, referenceCode, panCardNumber, stateId, cityId, address, statusId } = req.body
    // cheanges needed here 
    console.log(req.body)
    let createdBy = req.userData.id
    let modifiedBy = req.userData.id

    let getMobileNumber = await models.registerCustomerOtp.findOne({ where: { referenceCode, isVerified: true } })
    if (check.isEmpty(getMobileNumber)) {
        return res.status(404).json({ message: 'Registration Failed' });
    }
    let mobileNumber = getMobileNumber.mobileNumber;

    let customerExist = await models.customers.findOne({ where: { mobileNumber: mobileNumber } })
    if (!check.isEmpty(customerExist)) {
        return res.status(404).json({ message: 'This Mobile number already Exists' });
    }

    let getStageId = await models.stage.findOne({ where: { stageName: 'lead' } });
    let stageId = getStageId.id;
    let ratingId = 1
    let email = "nimap@infotech.com"
    let password = firstName

    await sequelize.transaction(async t => {
        const customer = await models.customers.create({ firstName, lastName, password, mobileNumber, email, panCardNumber, stateId, cityId, ratingId, stageId, statusId, createdBy, modifiedBy, isActive: true }, { transaction: t })
        if (check.isEmpty(address.length)) {
            for (let i = 0; i < address.length; i++) {
                let data = await models.customerAddress.create({
                    customerId: customer.id,
                    address: address[i].address,
                    landMark: address[i].landMark,
                    stateId: address[i].stateId,
                    cityId: address[i].cityId,
                    postalCode: address[i].postalCode
                }, { transaction: t })
            }
        }
    })
    return res.status(200).json({ messgae: `Customer created` })

}


exports.registerCustomerSendOtp = async (req, res, next) => {
    const { mobileNumber } = req.body

    let customerExist = await models.customers.findOne({ where: { mobileNumber, isActive: true } })

    if (!check.isEmpty(customerExist)) {
        return res.status(200).json({ message: `Mobile number is already exist.` })
    }

    await models.registerCustomerOtp.destroy({ where: { mobileNumber } })

    const referenceCode = await createReferenceCode(5);
    let otp = Math.floor(1000 + Math.random() * 9000);
    let createdTime = new Date();
    let expiryTime = moment.utc(createdTime).add(10, 'm')
    await models.registerCustomerOtp.create({ mobileNumber, otp, createdTime, expiryTime, referenceCode })

    request(`${CONSTANT.SMSURL}username=${CONSTANT.SMSUSERNAME}&password=${CONSTANT.SMSPASSWORD}&type=0&dlr=1&destination=${mobileNumber}&source=nicalc&message=For refrence code ${referenceCode} your OTP is ${otp}`);

    return res.status(200).json({ message: `Otp send to your entered mobile number.`, referenceCode })


}


exports.sendOtp = async (req, res, next) => {
    const { mobileNumber } = req.body

    let customerExist = await models.customers.findOne({ where: { mobileNumber, isActive: true } })

    if (check.isEmpty(customerExist)) {
        return res.status(200).json({ message: `Mobile number is not Exist.` })
    }

    await models.registerCustomerOtp.destroy({ where: { mobileNumber } })

    const referenceCode = await createReferenceCode(5);
    let otp = Math.floor(1000 + Math.random() * 9000);
    let createdTime = new Date();
    let expiryTime = moment.utc(createdTime).add(10, 'm')
    await models.registerCustomerOtp.create({ mobileNumber, otp, createdTime, expiryTime, referenceCode })
    request(`${CONSTANT.SMSURL}username=${CONSTANT.SMSUSERNAME}&password=${CONSTANT.SMSPASSWORD}&type=0&dlr=1&destination=${mobileNumber}&source=nicalc&message=For refrence code ${referenceCode} your OTP is ${otp}`);

    return res.status(200).json({ message: `Otp send to your entered mobile number.`, referenceCode })

}


exports.verifyOtp = async (req, res, next) => {
    let { referenceCode, otp } = req.body
    var todayDateTime = new Date();

    let verifyUser = await models.registerCustomerOtp.findOne({
        where: {
            referenceCode, otp,
            expiryTime: {
                [Op.gte]: todayDateTime
            }
        }
    })
    if (check.isEmpty(verifyUser)) {
        return res.status(404).json({ message: `Invalid otp.` })
    }

    let verifyFlag = await models.registerCustomerOtp.update({ isVerified: true }, { where: { id: verifyUser.id } })

    return res.status(200).json({ message: "Success", referenceCode })

}


exports.editCustomer = async (req, res, next) => {

    // changes need here
    let modifiedBy = req.userData.id

    let { id, firstName, lastName, mobileNumber, email, panCardNumber, cityId, stateId, postalCode, ratingId, stageId, statusId, isActive } = req.body
    let customerExist = await models.customers.findOne({ where: { id: id } })
    if (check.isEmpty(customerExist)) {
        return res.status(404).json({ message: 'Customer does not exist' });
    }
    let mobileNumberExist = await models.customers.findOne({ where: { mobileNumber: mobileNumber } })
    if (mobileNumberExist > 1) {
        return res.status(404).json({ message: 'This Mobile number already Exists' });
    }
    await sequelize.transaction(async t => {
        const customer = await models.customers.update({ firstName, lastName, mobileNumber, email, panCardNumber, address, cityId, stateId, postalCode, ratingId, stageId, statusId, isActive, modifiedBy }, { where: { id: id }, transaction: t })
    })
    return res.status(200).json({ messgae: `User Updated` })


}


exports.deactivateCustomer = async (req, res, next) => {
    const { customerId, isActive } = req.query;
    let customerExist = await models.customers.findOne({ where: { id: customerId } })
    if (check.isEmpty(customerExist)) {
        return res.status(404).json({ message: 'Customer is not exist' });
    }
    await models.customers.update({ isActive: isActive }, { where: { id: customerId } })
    return res.status(200).json({ message: `Updated` })

}


exports.getAllCustomers = async (req, res, next) => {

    let { stageName} = req.query
    const { search, offset, pageSize } = paginationWithFromTo(
        req.query.search,
        req.query.from,
        req.query.to,
    );
    let stage = await models.stage.findOne({ where: { stageName } });


    console.log(search, offset, pageSize, stage.id)

    const searchQuery = [{
        [Op.or]: {
            first_name: { [Op.iLike]: search + '%' },
            last_name: { [Op.iLike]: search + '%' },
        },

    }];
    let allCustomers = await models.customers.findAll({
        where: searchQuery,
        include: [{
            model: models.states,
            as: 'state',
        }, {
            model: models.cities,
            as: 'city',
        }, {
            model: models.rating,
            as: 'rating'
        }, {
            model: models.stage,
            as: 'stage',
            where:{id: stage.id}
        }, {
            model: models.status,
            as: 'status'
        }],
        order: [
            ['id', 'DESC']
        ],
        offset: offset,
        limit: pageSize
    });
    let count = await models.customers.findAll({
        where: { isActive: true },
        include:[{
            model: models.stage,
            as: 'stage',
            where:{id: stage.id}
        }]
    });

    return res.status(200).json({ data: allCustomers, count: count.length })
}


exports.getSingleCustomer = async (req, res, next) => {
    const { customerId } = req.params;
    let singleCustomer = await models.customers.findOne({
        where: {
            id: customerId
        },
        include: [{
            model: models.states,
            as: 'state',
        }, {
            model: models.cities,
            as: 'city',
        }, {
            model: models.rating,
            as: 'rating'
        }, {
            model: models.stage,
            as: 'stage'
        }, {
            model: models.status,
            as: 'status'
        }]
    });
    if (check.isEmpty(singleCustomer)) {
        return res.status(404).json({ message: 'Customer not found' });
    }


    return res.status(200).json({ singleCustomer })


}