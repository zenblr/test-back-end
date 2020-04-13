const { body } = require("express-validator");
const models=require('../models');
const sequelize = models.Sequelize;
const op = sequelize.Op;


exports.authValidation=[
    body('firstName')
      .exists()
      .withMessage('first name is required'),
    
    body('password')
      .exists()
      .withMessage('password required')
    ]