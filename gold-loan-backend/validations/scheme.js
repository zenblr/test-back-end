const { body } = require("express-validator");
const models = require('../models');

// add scheme Validation

exports.schemeValidation = [
  body('schemeName')
    .exists()
    .withMessage('scheme name is required'),

  body('schemeAmountStart')
    .exists()
    .withMessage('amount start is required'),

  body('schemeAmountEnd')
    .exists()
    .withMessage('amount end is required'),

  body('interestRateThirtyDaysMonthly')
    .exists()
    .withMessage('interest rate for 30 Days Monthly  is required'),

  body('interestRateNinetyDaysMonthly')
    .exists()
    .withMessage('interest rate for 90 Days Monthly  is required'),

  body('interestRateOneHundredEightyDaysMonthly')
    .exists()
    .withMessage('interest rate for 180 Days Monthly  is required'),

  // body('interestRateThirtyDaysAnnually')
  //   .exists()
  //   .withMessage('interest rate for 30 Days Annually  is required'),

  // body('interestRateNinetyDaysAnnually')
  //   .exists()
  //   .withMessage('interest rate for 90 Days Annually  is required'),

  // body('interestRateOneHundredEightyDaysAnnually')
  //   .exists()
  //   .withMessage('interest rate for 180 Days Annually  is required'),

  body('partnerId')
    .exists()
    .withMessage('partnerId is required'),

]