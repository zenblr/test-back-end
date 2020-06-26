const { body } = require("express-validator");
const models = require("../models");
const Sequelize = models.Sequelize;
const Op = Sequelize.Op;



exports.editSmsAlertValidation = [
  body('content')
    .exists()
    .withMessage('content is required')
]

exports.addSmsAlertValidation = [
    body('content')
      .exists()
      .withMessage('content is required'),
    body('alertFor')
      .exists()
      .withMessage('alertFor is required')
      .custom(async value => {
        return await models.smsAlert.findOne({ where: { 
            alertFor: {
            [Op.iLike]: value},
            isActive: true }}).then(alert => {
          if (alert) {
            return Promise.reject("Alert for already exit !");
          }
        })
      })
  ]
  
