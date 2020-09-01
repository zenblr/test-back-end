const { body } = require("express-validator");
const models = require('../models');
const sequelize = models.Sequelize;
const op = sequelize.Op;


exports.partReleasePayment = [
    body('masterLoanId')
        .exists()
        .withMessage('masterLoanId is required'),
    body('ornamentId')
        .exists()
        .withMessage('ornamentId is required'),
    body('paidAmount')
        .exists()
        .withMessage('paidAmount is required'),
    body('paymentType')
        .exists()
        .withMessage('paymentType is required'),
    body('depositDate')
        .exists()
        .withMessage('depositDate is required')
]

exports.amountStatusValidation = [
    body('amountStatus')
        .exists()
        .withMessage('amountStatus is required'),
    body('partReleaseId')
        .exists()
        .withMessage('partReleaseId is required'),
]

exports.assignAppriserValidation = [
    body('partReleaseId')
        .exists()
        .withMessage('partReleaseId is required'),
    body('appraiserId')
        .exists()
        .withMessage('appraiserId is required'),
    body('customerId')
        .exists()
        .withMessage('customerId is required'),
    body('appoinmentDate')
        .exists()
        .withMessage('appoinmentDate is required'),
    body('startTime')
        .exists()
        .withMessage('startTime is required'),
    body('endTime')
        .exists()
        .withMessage('endTime is required'),
]


exports.partReleaseValidation = [
    body('partReleaseStatus')
        .exists()
        .withMessage('partReleaseStatus is required'),
    body('partReleaseId')
        .exists()
        .withMessage('partReleaseId is required'),
]

exports.documentValidation = [
    body('documents')
        .exists()
        .withMessage('documents is required'),
    body('partReleaseId')
        .exists()
        .withMessage('partReleaseId is required'),
]


/////

exports.fullReleasePayment = [
    body('masterLoanId')
        .exists()
        .withMessage('masterLoanId is required'),
    body('ornamentId')
        .exists()
        .withMessage('ornamentId is required'),
    body('paidAmount')
        .exists()
        .withMessage('paidAmount is required'),
    body('paymentType')
        .exists()
        .withMessage('paymentType is required'),
    body('depositDate')
        .exists()
        .withMessage('depositDate is required')
]

exports.amountStatusValidationfullRelease = [
    body('amountStatus')
        .exists()
        .withMessage('amountStatus is required'),
    body('fullReleaseId')
        .exists()
        .withMessage('fullReleaseId is required'),
]

exports.assignReleaserValidationFullRelease = [
    body('fullReleaseId')
        .exists()
        .withMessage('fullReleaseId is required'),
    body('releaserId')
        .exists()
        .withMessage('releaserId is required'),
    body('customerId')
        .exists()
        .withMessage('customerId is required'),
    body('appoinmentDate')
        .exists()
        .withMessage('appoinmentDate is required'),
    body('startTime')
        .exists()
        .withMessage('startTime is required'),
    body('endTime')
        .exists()
        .withMessage('endTime is required'),
]


exports.fullReleaseValidation = [
    body('fullReleaseStatus')
        .exists()
        .withMessage('fullReleaseStatus is required'),
    body('fullReleaseId')
        .exists()
        .withMessage('fullReleaseId is required'),
]

exports.documentValidationFullRelease = [
    body('documents')
        .exists()
        .withMessage('documents is required'),
    body('fullReleaseId')
        .exists()
        .withMessage('fullReleaseId is required'),
]