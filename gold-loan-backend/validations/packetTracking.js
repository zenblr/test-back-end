const { body } = require("express-validator");

exports.addCustomerPacketTrackingValidation =[
    body('packetLocationId')
    .exists()
    .withMessage('Packet Location Required'),
]