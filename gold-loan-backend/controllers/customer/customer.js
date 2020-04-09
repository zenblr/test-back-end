const models = require('../../models');
const sequelize = models.sequelize;

const Sequelize = models.Sequelize;
const Op = Sequelize.Op;
const { createRefrenceCode } = require('../../utils/refrenceCode');

const request = require('request');
const moment = require('moment')


const check = require('../../lib/checkLib');
const { paginationWithFromTo } = require("../../utils/pagination");

exports.addCustomer = async (req, res, next) => {

    // cheanges needed here 
    let createdBy = req.userData.id
    let modifiedBy = req.userData.id

    let { firstName, lastName, password, mobileNumber, email, panCardNumber, address, ratingId, statusId } = req.body
    let customerExist = await models.customers.findOne({ where: { mobileNumber: mobileNumber } })
    if (!check.isEmpty(customerExist)) {
        return res.status(404).json({ message: 'This Mobile number is already Exist' });
    }

    let getStageId = await models.stage.findOne({ where: { stageName: 'lead' } });
    let stageId = getStageId.id;


    await sequelize.transaction(async t => {
        const customer = await models.customers.create({ firstName, lastName, password, mobileNumber, email, panCardNumber, ratingId, stageId, statusId, createdBy, modifiedBy }, { transaction: t })
        if (check.isEmpty(address.length)) {
            for (let i = 0; i < address.length; i++) {
                let data = await models.customer_address.create({
                    customerId: customer.id,
                    address: address[i].address,
                    landMark: address[i].landMark,
                    stateId: address[i].stateId,
                    cityId: address[i].cityId,
                    postalCode: address[i].postalCode
                }, { transaction: t })
            }
        }
    }).then((customer) => {
        return res.status(200).json({ messgae: `Customer created` })
    }).catch((exception) => {
        next(exception)
    })

}

exports.registerCustomerSendOtp = async (req, res, next) => {
    try {
        const { mobileNumber } = req.body


        let customerExist = await models.customers.findOne({ where: { mobileNumber, isActive: true } })

        if (!check.isEmpty(customerExist)) {
            return res.status(200).json({ message: `Mobile number is already exist.` })
        }
        const refrenceCode = await createRefrenceCode(5);
        let otp = Math.floor(1000 + Math.random() * 9000);
        let createdTime = new Date();
        let expiryTime = moment.utc(createdTime).add(10, 'm')
        await models.register_customer_otp.create({ mobileNumber, otp, createdTime, expiryTime })

        return res.status(200).json({ message: `Otp send to your entered mobile number.` })

    } catch (error) {
        return res.status(200).json({ message: error.message })
    }
}

exports.verifiedRegisterOtp = async (req, res, next) => {
    try {
        let { otp, mobileNumber } = req.body;
        let createdBy = req.userData.id
        let modifiedBy = req.userData.id
        var todayDateTime = new Date();

        let customerExist = await models.customers.findOne({ where: { mobileNumber, isActive: true } })
        if (!check.isEmpty(customerExist)) {
            if (customerExist.isActive) {
                return res.status(200).json({ message: `Mobile number is already exist.` })
            } else {
                let getRegisterOtp = await models.register_customer_otp.findOne({
                    where: {
                        mobileNumber, otp,
                        expiryTime: {
                            [Op.gte]: todayDateTime
                        }
                    }
                })
                if (check.isEmpty(getRegisterOtp)) {
                    return res.status(400).json({ message: `Your time is expired. Please click on resend otp` })
                }
                await models.customers.create({ mobileNumber, createdBy, modifiedBy, isVerified: true })
                return res.status(200).json({ message: `Otp verification complete` })
            }
        } else {
            let getRegisterOtp = await models.register_customer_otp.findOne({
                where: {
                    mobileNumber, otp,
                    expiryTime: {
                        [Op.gte]: todayDateTime
                    }
                }
            })
            if (check.isEmpty(getRegisterOtp)) {
                return res.status(400).json({ message: `Your time is expired. Please click on resend otp` })
            }

            await models.customers.create({ mobileNumber, createdBy, modifiedBy, isVerified: true })
            return res.status(200).json({ message: `Otp verification complete` })
        }
    } catch (error) {
        return res.status(200).json({ message: error, message })
    }
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


exports.editCustomer = async (req, res, next) => {

    // changes need here
    let modifiedBy = req.userData.id

    let { id, firstName, lastName, mobileNumber, email, panCardNumber, address, cityId, stateId, postalCode, ratingId, stageId, statusId, isActive } = req.body
    let customerExist = await models.customers.findOne({ where: { id: id } })
    if (check.isEmpty(customerExist)) {
        return res.status(404).json({ message: 'Customer is not exist' });
    }
    let mobileNumberExist = await models.customers.findOne({ where: { mobileNumber: mobileNumber } })
    if (mobileNumberExist > 1) {
        return res.status(404).json({ message: 'This Mobile number is already Exist' });
    }
    await sequelize.transaction(async t => {
        const customer = await models.customers.update({ firstName, lastName, mobileNumber, email, panCardNumber, address, cityId, stateId, postalCode, ratingId, stageId, statusId, isActive, modifiedBy }, { where: { id: id }, transaction: t })
    }).then((customer) => {
        return res.status(200).json({ messgae: `User Updated` })
    }).catch((exception) => {
        next(exception)
    })

}

exports.getAllCustomers = async (req, res, next) => {

    const { search, offset, pageSize } = paginationWithFromTo(
        req.query.search,
        req.query.from,
        req.query.to
    );
    console.log(search, offset, pageSize)

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
            as: 'stage'
        }, {
            model: models.status,
            as: 'status'
        }],
        order: [
            ['id', 'ASC']
        ],
        offset: offset,
        limit: pageSize
    });
    let count = await models.customers.findAll({
        where: { isActive: true },
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