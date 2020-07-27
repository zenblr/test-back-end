const { body } = require("express-validator");
const models = require('../../models');

// add scheme Validation

exports.scrapPacketValidation = [
  body('packetUniqueId')
    .exists()
    .withMessage('packet unique id is required'),

  body('internalUserBranchId')
    .exists()
    .withMessage('internal user branch is required')

]