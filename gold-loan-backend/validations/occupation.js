const { body } = require("express-validator");
const models = require('../models');
const sequelize = models.Sequelize;
const op = sequelize.Op;


exports.addOccupationValidation = [
  body('name')
    .exists()
    .withMessage('occupation name is required')
]

exports.updateOccupationValidation = [
    body('name')
    .exists().withMessage('occupation already required')
    .custom(async (value,{req}) => {
      return await models.occupation.findOne({ where: { 
        name: {
          [op.iLike]: value},
          id:{[op.not]:req.params.id},
        isActive:true }
        }).then(occupation => {
        if (occupation) {
          return Promise.reject("occupation already exits !");
        }
      })
    }),]