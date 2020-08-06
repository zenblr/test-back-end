const { body } = require("express-validator");
const models = require('../models');
const sequelize = models.Sequelize;
const Op = sequelize.Op;

exports.addPacketValidation = [
    body('packetUniqueId')
    .exists()
    .withMessage('packetUniqueId is required')
    .custom(async value => {
      return await models.packet.findOne({
        where: {
            packetUniqueId: {
            [Op.iLike]: value
          },
          isActive: true
        }
      }).then(packetUniqueId => {
        if (packetUniqueId) {
          return Promise.reject("packetUniqueId already exist !");
        }
      })
    }),
    body('barcodeNumber')
    .exists()
    .withMessage('barcodeNumber is required')
    .custom(async value => {
      return await models.packet.findOne({
        where: {
            barcodeNumber: {
            [Op.iLike]: value
          },
          isActive: true
        }
      }).then(barcodeNumber => {
        if (barcodeNumber) {
          return Promise.reject("barcodeNumber already exist !");
        }
      })
    })

];

exports.updatePacketValidation = [
    body('packetUniqueId')
    .exists()
    .withMessage('packetUniqueId is required')
    .custom(async (value,{ req }) => {
      return await models.packet.findOne({
        where: {
            id: { [Op.not]: req.params.id },
            packetUniqueId: {
            [Op.iLike]: value
          },
          isActive: true
        }
      }).then(packetUniqueId => {
        if (packetUniqueId) {
          return Promise.reject("packetUniqueId already exist !");
        }
      })
    }),
    body('barcodeNumber')
    .exists()
    .withMessage('barcodeNumber is required')
    .custom(async (value,{ req }) => {
      return await models.packet.findOne({
        where: {
            id: { [Op.not]: req.params.id },
            barcodeNumber: {
            [Op.iLike]: value
          },
          isActive: true
        }
      }).then(barcodeNumber => {
        if (barcodeNumber) {
          return Promise.reject("barcodeNumber already exist !");
        }
      })
    })

];