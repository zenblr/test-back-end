const { body } = require("express-validator");
const models = require('../models');
const sequelize = models.Sequelize;
const op = sequelize.Op;


exports.loanTransferStep1 = [
    body('customerId')
        .exists()
        .withMessage('customerId is required'),
    body('customerUniqueId')
        .exists()
        .withMessage('customerUniqueId is required'),
    body('kycStatus')
        .exists()
        .withMessage('kycStatus is required'),
    body('startDate')
        .exists()
        .withMessage('startDate is required')
]

exports.loanTransferStep2 = [
    body('pawnTicket')
        .exists()
        .withMessage('pawnTicket is required'),
    body('signedCheque')
        .exists()
        .withMessage('signedCheque is required'),
    body('declaration')
        .exists()
        .withMessage('declaration is required'),
    body('outstandingLoanAmount')
        .exists()
        .withMessage('outstandingLoanAmount is required'),
    body('loanId')
        .exists()
        .withMessage('loanId is required'),
    body('masterLoanId')
        .exists()
        .withMessage('masterLoanId is required')
]

exports.loanTransferStep3 = [
    body('loanTransferStatusForBM')
        .exists()
        .withMessage('loanTransferStatusForBM is required'),
    body('loanId')
        .exists()
        .withMessage('loanId is required'),
    body('masterLoanId')
        .exists()
        .withMessage('masterLoanId is required')
]

exports.loanTransferStep4 = [
    body('transactionId')
        .exists()
        .withMessage('transactionId is required'),
    body('loanId')
        .exists()
        .withMessage('loanId is required'),
    body('masterLoanId')
        .exists()
        .withMessage('masterLoanId is required')
]
