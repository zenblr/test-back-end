const { body } = require("express-validator");
exports.buyValidation = [

    body('metalType')
        .exists()
        .withMessage('metal type is required'),
    body('quantity')
        .exists()
        .withMessage('quantity is required'),
    body('lockPrice')
        .exists()
        .withMessage('lockPrice is required'),
    body('blockId')
        .exists()
        .withMessage('blockId is required'),
    body('transactionDetails')
        .exists()
        .withMessage('transactionDetails is required'),
    body('amount')
        .exists()
        .withMessage('amount is required'),
    body('quantityBased')
        .exists()
        .withMessage('quantityBased is required')
]