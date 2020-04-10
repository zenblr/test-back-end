const { body } = require("express-validator");
const models=require('../models');
const sequelize = models.Sequelize;
const op = sequelize.Op;

exports.branchValidation = [

  body("name")
    .exists()
    .withMessage("name is required"),
            
  body("cityId")
    .exists()
    .withMessage("CityId is required")
    .isInt()
    .withMessage('cityId  should be number'),

  body("stateId")
    .exists()
    .withMessage("StateId is required")
    .isInt()
    .withMessage('stateId should be number'),

  body("pincode")
    .exists()
    .withMessage("Pin code is required")
    .custom((value) => {

        if(!/^([0-9]{6}|[0-9]{3}\s[0-9]{3})/i.test(value)){
          return Promise.reject("Invalid pincode code")
        }  else{
          return true;
        }
        }),

  body("address")
    .exists()
    .withMessage("Address is required"),

];


