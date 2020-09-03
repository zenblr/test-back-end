const { body } = require("express-validator");
const models = require('../models');
const sequelize = models.Sequelize;
const Op = sequelize.Op;

// exports.addleadNewRequestValidation = [
//     body('customerId, moduleId')
//         .custom(async value => {
//             return await models.appraiserRe.findOne({
//                 where: {
//                     customerId:
//                         sequelize.where(sequelize.cast(sequelize.col("customer_id"), "varchar"),{ [Op.iLike]: value }),
//                     moduleId: 
//                         sequelize.where(sequelize.cast(sequelize.col("module_id"), "varchar"),{ [Op.iLike]: value })
//                 }
//             }).then((customerId,moduleId) => {
//                 if ({customerId,moduleId}) {
//                     return Promise.reject("This Lead Request already Exists !");
//                 }
//             })
//         })
// ]

// exports.updateleadNewRequestValidation = [
//     body('customerId, moduleId')
//     .custom(async (value,{ req }) => {
//         return await models.leadNewRequest.findOne({
//             where: {
//                 id: { [Op.not]: req.params.id },
//                 customerId:
//                     sequelize.where(sequelize.cast(sequelize.col("customer_id"), "varchar"),{ [Op.iLike]: value }),
//                 moduleId: 
//                     sequelize.where(sequelize.cast(sequelize.col("module_id"), "varchar"),{ [Op.iLike]: value })
//             }
//         }).then((customerId,moduleId) => {
//             if ({customerId,moduleId}) {
//                 return Promise.reject("This Lead Request already Exists !");
//             }
//         })
//     })
// ];