const { body } = require("express-validator");
const models = require('../models');
const { Op } = require("sequelize");
const sequelize = models.Sequelize;
const op = sequelize.Op;


exports.karatDetailsValidation = [
    body('karat')
        .exists()
        .withMessage('karat  is required')
        .custom(async (value, { req }) => {
            return await models.karatDetails.findOne({
                where: {
                    karat: req.body.karat,
                    isActive: true
                }
            }
            ).then(karatDetails => {
                if (karatDetails) {
                    return Promise.reject("karat is already exist !");
                }
            })
        }),
    body('fromPercentage')
        .exists()
        .withMessage('from Percentage is required'),
    body('toPercentage')
        .exists()
        .withMessage('to Percentage is required')

]



exports.karatDedtailsUpdateValidation = [
    body('karat')
        .exists()
        .withMessage('karat  is required')
        .custom(async (value, { req }) => {
            return await models.karatDetails.findOne({
                where: {
                    karat: req.body.karat,
                    id: { [op.not]: req.params.id },
                    isActive: true
                }
            }).then(karatDetails => {
                if (karatDetails) {
                    return Promise.reject("karat is  already exist !");
                }
            })
        }),
    body('fromPercentage')
        .exists()
        .withMessage('from percentage is required'),
    body('toPercentage')
        .exists()
        .withMessage('to percentage is required')
]