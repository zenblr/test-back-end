const { body } = require("express-validator");
exports.redeemOrderValidation = [
    body('transactionDetails')
        .exists()
        .withMessage('transactionDetails is required'),
    body('userAddressId')
        .exists()
        .withMessage('userAddressId is required')
]