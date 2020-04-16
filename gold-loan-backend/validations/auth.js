const { body } = require("express-validator");
const models = require('../models');
const sequelize = models.Sequelize;
const op = sequelize.Op;


exports.authValidation = [
  body('mobileNumber')
    .exists()
    .withMessage('Mobile number is required'),

  body('password')
    .exists()
    .withMessage('password required')
]

exports.loginWithOtpValidation = [
  body('referenceCode')
    .exists()
    .withMessage('reference code is required'),

  body("otp")
    .exists()
    .withMessage('otp is required')
]

exports.customerLoginValidation = [
  body('firstName')
  .exists()
  .withMessage('first Name is required'),

body('password')
  .exists()
  .withMessage('password required')
]

