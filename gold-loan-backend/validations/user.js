const { body } = require("express-validator");
const models = require('../models');
const sequelize = models.Sequelize;
const Op = sequelize.Op;



exports.addInternalUserValidation = [
  body('firstName')
    .exists().withMessage('firstName is required'),
  body('lastName')
    .exists().withMessage('lastName is required'),
  body('mobileNumber')
    .exists()
    .withMessage('mobileNumber no is required')
    .custom(async value => {
      return await models.user.findOne({
        where: {
          mobileNumber: {
            [Op.iLike]: value
          },
          isActive: true
        }
      }).then(mobile => {
        if (mobile) {
          return Promise.reject("mobileNumber no already exist !");
        }
      })
    }),
    body('userUniqueId')
    .exists()
    .withMessage('userUniqueId is required')
    .custom(async value => {
      return await models.user.findOne({
        where: {
          userUniqueId: {
            [Op.iLike]: value
          },
          isActive: true
        }
      }).then(mobile => {
        if (mobile) {
          return Promise.reject("user Unique Id already exist !");
        }
      })
    }),
  body('email')
    .exists()
    .withMessage('email is required')
    .custom(async value => {
      return await models.user.findOne({
        where: {
          email: {
            [Op.iLike]: value
          },
          isActive: true
        }
      }).then(email => {
        if (email) {
          return Promise.reject("email already exist !");
        }
      })
    }),
  body('roleId')
    .exists().withMessage('roleId is required')
];

exports.UpdateInternalUserValidation = [
  body('firstName')
    .exists().withMessage('firstName is required'),
  body('lastName')
    .exists().withMessage('lastName is required'),
  body('mobileNumber')
    .exists()
    .withMessage('mobileNumber no is required')
    .custom(async (value, { req }) => {
      return await models.user.findOne({
        where: {
          mobileNumber: {
            [Op.iLike]: value
          },
          id: { [Op.not]: req.params.id },
          isActive: true
        }
      }).then(mobile => {
        if (mobile) {
          return Promise.reject("mobileNumber no already exist !");
        }
      })
    }),
  body('email')
    .exists()
    .withMessage('email is required')
    .custom(async (value, { req }) => {
      return await models.user.findOne({
        where: {
          email: {
            [Op.iLike]: value
          },
          id: { [Op.not]: req.params.id },
          isActive: true
        }
      }).then(email => {
        if (email) {
          return Promise.reject("email already exist !");
        }
      })
    }),
  body('roleId')
    .exists().withMessage('roleId is required')
];


exports.userValidation = [
  body('firstName')
    .exists()
    .withMessage('first name is required'),

  body('lastName')
    .exists()
    .withMessage('last name is required'),

  body('password')
    .exists()
    .withMessage('password is required'),

  body('mobileNumber')
    .exists()
    .withMessage('mobile number is required')
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

  // body('address')
  //   .exists()
  //   .withMessage("Address is required"),

  // body("roleId")
  //   .exists()
  //   .isInt()
  //   .withMessage("role Id is required"),
  // 
]

    // exports.userUpdateValidation=[
    //   body('mobileNumber')
    // .exists().withMessage(' name is required')
    // .custom(async (value,{req}) => {
    //   return await models.categories.findOne({ where: { 
    //     categoryName: {
    //       [Op.iLike]: value},
    //       id:{[Op.not]:req.params.id},
    //       status: true }}).then(category => {
    //     if (category) {
    //       return Promise.reject("Category name already exit !");
    //     }
    //   })
    // ]