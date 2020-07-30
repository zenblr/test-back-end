const { body } = require("express-validator");

exports.scrapGlobalSettingsValidation = [
    body('ltvGoldValue')
        .exists()
        .withMessage('ltv gold value is required'),
    body('cashTransactionLimit')
        .exists()
        .withMessage('cash transaction limit allowed is required'),
    body('processingChargesFixed')
        .exists()
        .withMessage('processing charges fixed is required'),
    body('processingChargesInPercent')
        .exists()
        .withMessage('processing charges in percent is required'),
    body('gst')
        .exists()
        .withMessage('gst required'),


]
