const models = require('../../models');
const sequelize = models.sequelize;

const Sequelize = models.Sequelize;
const Op = Sequelize.Op;

const check = require('../../lib/checkLib');

exports.addCustomer = async(req, res) => {

    try {
        const { firstName, lastName, password, mobileNumber, email, panCardNumber, address, cityId, stateId, postalCode, ratingId, statusId } = req.body
        let customerExist = await models.customers.findOne({ where: { mobileNumber: mobileNumber } })
        if (!check.isEmpty(customerExist)) {
            return res.status(404).json({ message: 'This Mobile number is already Exist' });
        }

        let getStageId = await models.stage.findOne({ where: { stageName: 'lead' } });
        let stageId = getStageId.id;

        await sequelize.transaction(async t => {
            const customer = await models.customers.create({ firstName, lastName, password, mobileNumber, email, panCardNumber, address, stateId, cityId, postalCode, ratingId, stageId, statusId }, { transaction: t })
        }).then((customer) => {
            return res.status(200).json({ messgae: `User created` })
        }).catch(() => {
            return res.status(500).json({
                message: "something went wrong",
                data: exception.message
            });
        })
    } catch (error) {
        return res.status(500).json({ message: `Internal server error` })
    }
}



exports.deactivateCustomer = async(req, res) => {
    try {
        const { customerId, value } = req.query;
        let customerExist = await models.customers.findOne({ where: { id: customerId } })
        if (check.isEmpty(customerExist)) {
            return res.status(404).json({ message: 'Customer is not exist' });
        }
        await models.customers.update({ isActive: value }, { where: { id: customerId } })
        return res.status(200).json({ message: `Updated` })
    } catch (error) {
        return res.status(500).json({ message: `Internal server error` })
    }
}


exports.editCustomer = async(req, res) => {
    try {
        const { id, firstName, lastName, mobileNumber, email, panCardNumber, address, cityId, stateId, postalCode, ratingId, stageId, statusId, isActive } = req.body
        let mobileNumberExist = await models.customers.findOne({ where: { mobileNumber: mobileNumber } })

        if (mobileNumberExist > 1) {
            return res.status(404).json({ message: 'This Mobile number is already Exist' });
        }
        console.log(req.body)
        await sequelize.transaction(async t => {
            const customer = await models.customers.update({ firstName, lastName, mobileNumber, email, panCardNumber, address, cityId, stateId, postalCode, ratingId, stageId, statusId, isActive }, { where: { id: id }, transaction: t })
        }).then((customer) => {
            return res.status(200).json({ messgae: `User Updated` })
        }).catch((exception) => {
            return res.status(500).json({
                message: "something went wrong",
                data: exception.message
            });
        })
    } catch (error) {
        return res.status(500).json({ message: `Internal server error` })
    }
}

exports.getAllCustomers = async(req, res) => {
    try {

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

    } catch (error) {
        return res.status(500).json({ message: `Internal server error` })

    }
}

exports.getSingleCustomer = async(req, res) => {
    try {
        const { customerId } = req.query;
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

    } catch (error) {
        return res.status(500).json({ message: `Internal server error` })

    }
}