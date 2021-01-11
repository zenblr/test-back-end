const { body } = require("express-validator");
const models = require("../models");
const Sequelize = models.Sequelize;
const op = Sequelize.Op;

exports.addCustomerBankDetails = [
body('bankName')
.exists()
.withMessage('bankName is required'),
body('bankBranchName')
.exists()
.withMessage('bankBranchName is required'),
body('accountType')
.exists()
.withMessage('accountType is required'),
body('accountHolderName')
.exists()
.withMessage('accountHolderName is required'),
body('accountNumber')
.exists()
.withMessage('accountNumber is required')
.custom(async value => {
return await models.customerBankDetails.findOne({
where: {
accountNumber: {
[op.iLike]: value
},
isActive: true
}
}).then(accountNumber => {
if (accountNumber) {
return Promise.reject("Account Number is already exist !");
}
})
}),
body('ifscCode')
.exists()
.withMessage('ifscCode is required'),
]