const { body } = require("express-validator");
const models = require('../models');
const sequelize = models.Sequelize;
const op = sequelize.Op;


exports.partnerValidation = [
  body('name')
    .exists()
    .withMessage('partner name is required'),

  body('commission')
    .exists()
    .withMessage('commission required')
    .isFloat()
    .withMessage('Commission should be number')
]



exports.partnerUpdateValidation = [
  body('name')
  .exists().withMessage('partner name is required')
  .custom(async (value,{req}) => {
    return await models.partner.findOne({ where: { 
      name: {
        [op.iLike]: value},
        id:{[op.not]:req.params.id},
        isActive: true }
      }).then(partner => {
      if (partner) {
        return Promise.reject("partner name already exit !");
      }
    })
  }),]