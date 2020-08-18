const { body } = require("express-validator");
const models = require('../../models');
const sequelize = models.Sequelize;
const Op = sequelize.Op;

// add scheme Validation

exports.addStandardDeduction = [
  body('standardDeduction')
  .exists()
  .withMessage('StandardDeduction is required')
  .custom(async value => {
    return await models.standardDeduction.findOne({
      where: {
          standardDeduction: sequelize.where(
            sequelize.cast(sequelize.col("standardDeduction.standard_deduction"), "varchar"),
            {
              [Op.iLike]: value + "%"
            },
          ),
        isActive: true
      }
    }).then(standardDeduction => {
      if (standardDeduction) {
        return Promise.reject("StandardDeduction already exist !");
      }
    })
  })
];

exports.updateStandardDeduction = [
  body('standardDeduction')
  .exists()
  .withMessage('StandardDeduction is required')
  .custom(async (value,{ req }) => {
    console.log(req.params.id);
    return await models.standardDeduction.findOne({
      where: {
          id: { [Op.not]: req.params.id },
            standardDeduction: sequelize.where(
              sequelize.cast(sequelize.col("standardDeduction.standard_deduction"), "varchar"),
              {
                [Op.iLike]: value + "%"
              },
            ),
        isActive: true
      }
    }).then(standardDeduction => {
      if (standardDeduction) {
        return Promise.reject("StandardDeduction already exist !");
      }
    })
  })
];