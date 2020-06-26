const { body } = require("express-validator");

exports.globalSettingsValidation = [
    body('ltvGoldValue')
        .exists()
        .withMessage('ltv gold value date is required'),
    body('minimumLoanAmountAllowed')
        .exists()
        .withMessage('minimum loan amount allowed is required'),
    body('minimumTopUpAmount')
        .exists()
        .withMessage('minimum top upAmount is required'),
    body('gracePeriodDays')
        .exists()
        .withMessage('grace period days is required'),
    body('cashTransactionLimit')
        .exists()
        .withMessage('cash transaction limit is required'),
    body('gst')
        .exists()

]