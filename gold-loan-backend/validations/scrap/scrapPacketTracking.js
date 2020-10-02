const { body } = require("express-validator");

exports.submitScrapPacketLocationValidation = [
    body('internalBranchId')
        .exists()
        .withMessage('internal branch id is required'),
    body('userReceiverId')
        .exists()
        .withMessage('user receiver id is required'),
    body('receiverType')
        .exists()
        .withMessage('receiver type is required'),
    body('packetLocationId')
        .exists()
        .withMessage('packet location id is required'),
    body('scrapId')
        .exists()
        .withMessage('scrapId required'),
]

exports.addPacketLocationValidation = [
    body('receiverType')
        .exists()
        .withMessage('receiver type is required'),
    body('packetLocationId')
        .exists()
        .withMessage('packet location id is required'),
    body('scrapId')
        .exists()
        .withMessage('scrap id type is required'),
    body('courier')
        .exists()
        .withMessage('courier id is required'),
    body('podNumber')
        .exists()
        .withMessage('pod number required'),
]
