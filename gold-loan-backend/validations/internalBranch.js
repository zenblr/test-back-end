const { body } = require("express-validator");
const models = require('../models');
const sequelize = models.Sequelize;
const op = sequelize.Op;


exports.addInternalBranchValidation = [
    body('name')
        .exists()
        .withMessage('internal branch name is required'),
    body('cityId')
        .exists()
        .withMessage('city is required'),
    body('stateId')
        .exists()
        .withMessage('state is required'),
    body('address')
        .exists()
        .withMessage('address is required'),
    body('pinCode')
        .exists()
        .withMessage('pin code is required')
        .custom((value) => {

            if (!/^([0-9]{6}|[0-9]{3}\s[0-9]{3})/i.test(value)) {
                return Promise.reject("Invalid pincode")
            } else {
                return true;
            }
        }),
    body('ifscCode')
        .exists()
        .withMessage('ifscCode is required'),
    body('bankName')
        .exists()
        .withMessage('bankName is required'),
    body('bankBranch')
        .exists()
        .withMessage('branch name is required'),
    body('accountHolderName')
        .exists()
        .withMessage('account holder  name is required'),
    body('accountNumber')
        .exists()
        .withMessage('account number is required'),
    body('passbookStatementChequeId')
        .exists()
        .withMessage('passbook or Statement or Cheque is required')
]

exports.updateInternalBranchValidation = [
    body('name')
        .exists().
        withMessage(' internal branch name is required')
        .custom(async (value, { req }) => {
            return await models.internalBranch.findOne({
                where: {
                    name: {
                        [op.iLike]: value
                    },
                    id: { [op.not]: req.params.id }, isActive: true
                }
            }).then(internalBranch => {
                if (internalBranch) {
                    return Promise.reject("internal branch name already exit !");
                }
            })

        }),

    body('cityId')
        .exists()
        .withMessage('city is required'),

    body('stateId')
        .exists()
        .withMessage('state is required'),

    body('pinCode')
        .exists()
        .withMessage('pin code is required')
        .custom((value) => {

            if (!/^([0-9]{6}|[0-9]{3}\s[0-9]{3})/i.test(value)) {
                return Promise.reject("Invalid pincode")
            } else {
                return true;
            }
        }),

    body('address')
        .exists()
        .withMessage(' address is required'),
    body('ifscCode')
        .exists()
        .withMessage('ifscCode is required'),
    body('bankName')
        .exists()
        .withMessage('bankName is required'),
    body('bankBranch')
        .exists()
        .withMessage('branch name is required'),
    body('accountHolderName')
        .exists()
        .withMessage('account holder  name is required'),
    body('accountNumber')
        .exists()
        .withMessage('account number is required'),
    body('passbookStatementChequeId')
        .exists()
        .withMessage('passbook or Statement or Cheque is required')

]