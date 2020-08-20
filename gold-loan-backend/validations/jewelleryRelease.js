const { body } = require("express-validator");
const models = require('../models');
const sequelize = models.Sequelize;
const op = sequelize.Op;


exports.partReleasePayment = [
    body('payableAmount')
        .exists()
        .withMessage('payableAmount is required'),
    body('penalInterest')
        .exists()
        .withMessage('penalInterest is required'),
    body('interestAmount')
        .exists()
        .withMessage('interestAmount is required'),
    body('releaseAmount')
        .exists()
        .withMessage('releaseAmount is required'),
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
        .withMessage('depositDate is required'),
    body('releaseGrossWeight')
        .exists()
        .withMessage('releaseGrossWeight is required'),
    body('releaseDeductionWeight')
        .exists()
        .withMessage('releaseDeductionWeight is required'),
    body('releaseNetWeight')
        .exists()
        .withMessage('releaseNetWeight is required'),
    body('remainingGrossWeight')
        .exists()
        .withMessage('remainingGrossWeight is required'),
    body('remainingDeductionWeight')
        .exists()
        .withMessage('remainingDeductionWeight is required'),
    body('remainingNetWeight')
        .exists()
        .withMessage('remainingNetWeight is required'),
    body('currentLtv')
        .exists()
        .withMessage('currentLtv is required'),
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
    body('payableAmount')
        .exists()
        .withMessage('payableAmount is required'),
    body('penalInterest')
        .exists()
        .withMessage('penalInterest is required'), 
    body('currentOutstandingAmount')
        .exists()
        .withMessage('currentOutstandingAmount is required'), 
    body('interestAmount')
        .exists()
        .withMessage('interestAmount is required'),
    body('releaseAmount')
        .exists()
        .withMessage('releaseAmount is required'),
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
        .withMessage('depositDate is required'),
    body('releaseGrossWeight')
        .exists()
        .withMessage('releaseGrossWeight is required'),
    body('releaseDeductionWeight')
        .exists()
        .withMessage('releaseDeductionWeight is required'),
    body('releaseNetWeight')
        .exists()
        .withMessage('releaseNetWeight is required'),
    body('remainingGrossWeight')
        .exists()
        .withMessage('remainingGrossWeight is required'),
    body('remainingDeductionWeight')
        .exists()
        .withMessage('remainingDeductionWeight is required'),
    body('remainingNetWeight')
        .exists()
        .withMessage('remainingNetWeight is required'),
    body('currentLtv')
        .exists()
        .withMessage('currentLtv is required'),
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