const { body } = require("express-validator");
const models=require('../models');
const sequelize = models.Sequelize;
const op = sequelize.Op;


exports.authValidation=[
    body('mobileNumber')
      .exists()
      .withMessage('Mobile number is required'),
    
    body('password')
      .exists()
      .withMessage('password required')
    ]