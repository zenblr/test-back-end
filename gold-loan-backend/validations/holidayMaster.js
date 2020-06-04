const { body } = require("express-validator");
const models = require('../models');
const sequelize = models.Sequelize;
const op = sequelize.Op;


exports.holidayMasterValidation = [
    body('holidayDate')
        .exists()
        .withMessage('holiday date is required'),

    body('description')
        .exists()
        .withMessage('description is required'),

    body('year')
        .exists()
        .withMessage('year is required')
]



exports.holidayMasterUpdateValidation = [
    body('holidayDate')
        .exists().withMessage('holiday date is required')
        .custom(async (value, { req }) => {
            return await models.holidayMaster.findOne({
                where: {
                    holidayDate: req.body.holidayDate,
                    id: { [op.not]: req.params.id },
                    isActive: true
                }
            }).then(holidayMaster => {
                if (holidayMaster) {
                    return Promise.reject("holiday master date is already exit !");
                }
            })
        }),
    body('description')
        .exists()
        .withMessage('description is required'),
    body('year')
        .exists()
        .withMessage('year is required')]