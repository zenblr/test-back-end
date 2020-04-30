const { body } = require("express-validator");
const models = require('../models');
const sequelize = models.Sequelize;
const op = sequelize.Op;


exports.addIdentityTypeValidation = [
  body('name')
    .exists()
    .withMessage('identity type name is required')
]

exports.updateIdentityTypeValidation = [
    body('name')
    .exists().withMessage('identity type name is required')
    .custom(async (value,{req}) => {
      return await models.identityType.findOne({ where: { 
        name: {
          [op.iLike]: value},
          id:{[op.not]:req.params.id} ,isActive:true}
        }).then(identityType => {
        if (identityType) {
          return Promise.reject("identity type name already exit !");
        }
      })
    }),]