const { body } = require("express-validator");
const models=require('../models');
const sequelize = models.Sequelize;
const op = sequelize.Op;


exports.partnerValidation=[
    body('name')
      .exists()
      .withMessage('partner name is required'),
    
    body('commission')
      .exists()
      .withMessage('commission required')
      .isFloat()
      .withMessage('Commission should be number')
    ]
    
  // exports.partnerUpdate=[
  //   body("name")
  //     .exists()
  //     .withMessage("partner name is required")
  //     .custom(async (value)=>{

  //     })
  //   body("commission")
  // ]  