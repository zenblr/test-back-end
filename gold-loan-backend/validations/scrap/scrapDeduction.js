const { body } = require("express-validator");
const models = require('../../models');

// add scheme Validation

exports.scrapDeductionValidation = [
  body('standardDeduction')
    .exists()
    .withMessage('Standard deduction id is required'),

]