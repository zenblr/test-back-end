const { body } = require("express-validator");
const models = require("../models");
const Sequelize = models.Sequelize;
const Op = Sequelize.Op;

exports.createRoleValidation = [
  body('roleName')
    .exists().withMessage('roleName is required')
    .custom(async value => {
      return await models.role.findOne({ where: { 
        roleName: {
          [Op.iLike]: value},
          isActive: true }}).then(role => {
        if (role) {
          return Promise.reject("roleName already exit !");
        }
      })
    }),
  body("description")
    .exists()
    .withMessage("description is required")
];

exports.addPermissionsValidation = [
  body('roleId')
    .exists().withMessage('roleId is required'),
  body("permissions")
    .exists()
    .withMessage("permissions is required")
];

exports.updateRoleValidation = [
    body('roleName')
      .exists().withMessage('roleName is required')
      .custom(async (value,{req}) => {
        return await models.role.findOne({ where: { 
          roleName: {
            [Op.iLike]: value},
            id:{[Op.not]:req.params.id},
            isActive: true }}).then(role => {
          if (role) {
            return Promise.reject("roleName already exit !");
          }
        })
      }),
    body("description")
      .exists()
      .withMessage("description is required")
  ];
