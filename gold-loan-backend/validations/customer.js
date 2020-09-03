const { body } = require("express-validator");
const models = require('../models');
const sequelize = models.Sequelize;
const op = sequelize.Op;


exports.customerValidation = [
  body('firstName')
    .exists()
    .withMessage('first name is required'),

  body('lastName')
    .exists()
    .withMessage('last name is required'),

  // body('password')
  //   .exists()
  //   .withMessage('password is requires'),
  body('referenceCode')
    .exists()
    .withMessage('referenceCode is required'),

  // body('mobileNumber')
  //   .exists()
  //   .withMessage('mobile number is require')
  //   .custom(async value => {

  //     if (!/^[0-9]{10}$/i.test(value)) {
  //       return Promise.reject("Invalid mobile number");
  //     }

  //   }),

  // body('email')
  //   .exists()
  //   .withMessage('email id is required')
  //   .custom(async value=>{
  //   }),
  // body('panCardNumber')
  //   .exists()
  //   .withMessage('pan card is required')
  //   .custom(async value=>{
  //       if(!/^([a-zA-Z]){5}([0-9]){4}([a-zA-Z]){1}?$/i.test(value)){
  //           return Promise.reject('Invalid Pan Card Number')
  //       }
  //   }),
  //  body('address')
  // .exists()
  // .withMessage("Address is required")
  // .isLength({min:3},{max:250})
  // .withMessage('Maximum length is 250 and minimum length is 3'),

  // body("ratingId")
  //   .exists()
  //   .isInt()
  //   .withMessage("ratingId is required"),

  body("statusId")
    .exists()
    .isInt()
    .withMessage("statusId is required"),
  body('panCardNumber')
    .exists()
    .withMessage('Pan Card Number is required')
    .custom(async value => {
      return await models.customer.findOne({
        where: {
          panCardNumber: {
            [op.iLike]: value
          },
          isActive: true
        }
      }).then(panCardNumber => {
        if (panCardNumber) {
          return Promise.reject("Pan Card Number already exist !");
        }
      })
    }),
]

exports.customerUpdateValidation = [

  body('firstName')
    .exists()
    .withMessage('first name is required'),

  body('lastName')
    .exists()
    .withMessage('last name is required'),

  // body('password')
  //   .exists()
  //   .withMessage('password is requires'),
  // body('referenceCode')
  //   .exists()
  //   .withMessage('referenceCode is required'),

  body('mobileNumber')
    .exists()
    .withMessage('mobile number is require')
    .custom(async value => {

      if (!/^[0-9]{10}$/i.test(value)) {
        return Promise.reject("Invalid mobile number");
      }

    }),

  // body('email')
  //   .exists()
  //   .withMessage('email id is required')
  //   .custom(async value=>{
  //   }),
  // body('panCardNumber')
  //   .exists()
  //   .withMessage('pan card is required')
  //   .custom(async value=>{
  //       if(!/^([a-zA-Z]){5}([0-9]){4}([a-zA-Z]){1}?$/i.test(value)){
  //           return Promise.reject('Invalid Pan Card Number')
  //       }
  //   }),
  //  body('address')
  // .exists()
  // .withMessage("Address is required")
  // .isLength({min:3},{max:250})
  // .withMessage('Maximum length is 250 and minimum length is 3'),

  // body("ratingId")
  //   .exists()
  //   .isInt()
  //   .withMessage("ratingId is required"),

  body("statusId")
    .exists()
    .isInt()
    .withMessage("statusId is required"),


]