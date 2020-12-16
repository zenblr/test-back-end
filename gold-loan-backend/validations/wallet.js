const { body } = require("express-validator");
const models = require("../models");
const Sequelize = models.Sequelize;
const Op = Sequelize.Op;

exports.addWalletAmountValidation = [
  body('amount')
    .exists()
    .withMessage('amount is required'),
  body('paymentType')
    .exists()
    .withMessage('paymentType is required')
]



exports.editWalletStatusValidation = [
  body('depositStatus')
    .exists()
    .withMessage('status is required')
]