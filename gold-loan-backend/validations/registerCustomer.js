const { body } = require("express-validator");
const models = require('../models');
const sequelize = models.Sequelize;
const op = sequelize.Op;

exports.registerCustomerValidation = [
    body('firstName')
        .exists()
        .withMessage('first name is required'),

    body('lastName')
        .exists()
        .withMessage('last name is required'),
        
    body('mobileNumber')
        .exists()
        .withMessage('mobile number is required')
        .custom(async value => {

            if (!/^[0-9]{10}$/i.test(value)) {
                return Promise.reject("Invalid mobile number");
            }

        })
]