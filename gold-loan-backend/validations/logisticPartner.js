const { body } = require("express-validator");
const models = require('../models');
const sequelize = models.Sequelize;
const op = sequelize.Op;


exports.logisticPartnerValidation = [
  body('name')
    .exists()
    .withMessage('logistic partner name is required')
    .custom(async (value,{req}) => {
      return await models.logisticPartner.findOne({ where: { 
        name: {
          [op.iLike]: value},
          isActive: true }
        }).then(logisticPartner => {
        if (logisticPartner) {
          return Promise.reject("logistic partner name already exit !");
        }
      })
    }),

]



exports.logisticPartnerUpdateValidation = [
  body('name')
  .exists().withMessage('logistic partner name is required')
  .custom(async (value,{req}) => {
    return await models.logisticPartner.findOne({ where: { 
      name: {
        [op.iLike]: value},
        id:{[op.not]:req.params.id},
        isActive: true }
      }).then(logisticPartner => {
      if (logisticPartner) {
        return Promise.reject("logistic partner name already exit !");
      }
    })
  }),]