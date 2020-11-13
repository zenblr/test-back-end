const { body } = require("express-validator");
const models = require("../../models");
const Sequelize = models.Sequelize;
const Op = Sequelize.Op;

exports.customerKycValidation = [

    body('panNumber')
        .exists()
        .withMessage('pan number is required')
        .custom(async (value,{req}) => {
            return await models.digitalGoldCustomerKyc.findOne({ 
                where: { panNumber: {[Op.iLike]: value},customerId: { [Op.not]: req.userData.id }},
            })
            .then(panNumber => {
              if (panNumber) {
                return Promise.reject("Pan number already exists");
              }
            })
        })
        .custom(async (value) => {
            if (!/^[A-Za-z]{5}[0-9]{4}[A-Za-z]{1}$/i.test(value)) {
                return Promise.reject("Pan number format is invalid")
            }else{
                return true;
            }
        }),
    body("panAttachment")
        .exists()
        .withMessage('Pan attachment is required')
]