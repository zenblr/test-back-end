const { body } = require("express-validator");

exports.updateLocationValidation =[
    body('packetLocationId')
    .exists()
    .withMessage('Packet Location Required'),
]