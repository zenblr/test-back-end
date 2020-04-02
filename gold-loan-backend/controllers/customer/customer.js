const models = require('../../models');
const sequelize = models.sequelize;

const Sequelize = models.Sequelize;
const Op = Sequelize.Op;

const check = require('../../lib/checkLib');
const { paginationWithFromTo } = require("../../utils/pagination");

exports.addCustomer = async(req, res) => {

    // cheanges needed here 
    let createdBy = req.userData.id
    let modifiedBy = req.userData.id

    let { firstName, lastName, password, mobileNumber, email, panCardNumber, address, cityId, stateId, postalCode, ratingId, statusId } = req.body
    let customerExist = await models.customers.findOne({ where: { mobileNumber: mobileNumber } })
    if (!check.isEmpty(customerExist)) {
        return res.status(404).json({ message: 'This Mobile number is already Exist' });
    }


    let getStageId = await models.stage.findOne({ where: { stageName: 'lead' } });
    let stageId = getStageId.id;

    await sequelize.transaction(async t => {
        const customer = await models.customers.create({ firstName, lastName, password, mobileNumber, email, panCardNumber, address, stateId, cityId, postalCode, ratingId, stageId, statusId, createdBy, modifiedBy }, { transaction: t })
    }).then((customer) => {
        return res.status(200).json({ messgae: `User created` })
    }).catch((exception) => {
        return res.status(500).json({
            message: "something went wrong",
            data: exception.message
        });
    })

}



exports.deactivateCustomer = async(req, res) => {
    const { customerId, isActive } = req.query;
    let customerExist = await models.customers.findOne({ where: { id: customerId } })
    if (check.isEmpty(customerExist)) {
        return res.status(404).json({ message: 'Customer is not exist' });
    }
    await models.customers.update({ isActive: isActive }, { where: { id: customerId } })
    return res.status(200).json({ message: `Updated` })

}


exports.editCustomer = async(req, res) => {

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
        return res.status(500).json({
            message: "something went wrong",
            data: exception.message
        });
    })

}

exports.getAllCustomers = async(req, res) => {

    const { search, offset, pageSize } = paginationWithFromTo(
        req.query.search,
        req.query.from,
        req.query.to
    );
    console.log(search, offset, pageSize)

    let allCustomers = await models.customers.findAll({
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
    return res.status(200).json({ allCustomers })


}

exports.getSingleCustomer = async(req, res) => {
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