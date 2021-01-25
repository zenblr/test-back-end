exports.configDetail = [
    body('configSettingName')
    .exists()
    .withMessage('configSettingName is required'),
    body('configSettingValue')
    .exists()
    .withMessage('configSettingValue is required')
    ]