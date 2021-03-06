const { addPacket, viewPacket, availablePacket, assignPacket, changePacket, deletePacket,assignAppraiser } = require('../controllers/packet/packet');
const { wrapper } = require('../utils/errorWrap');
const express = require('express');
const checkAuth = require('../middleware/checkAuth');
const checkRolePermission = require('../middleware/checkRolesPermissions');
const validationError = require('../middleware/validationError')
const {addPacketValidation,updatePacketValidation} = require('../validations/packet')

const route = express.Router();

route.post('/', checkAuth,addPacketValidation, validationError,wrapper(addPacket)); // ADD PACKET// add packet

route.get('/', checkAuth, wrapper(viewPacket)); // FETCH PACKET

route.get('/available-packet', checkAuth, wrapper(availablePacket)); // FETCH AVAILABLE PACKET


route.put('/assign-appraiser',checkAuth,wrapper(assignAppraiser)); // ASSIGN APPRAISER

route.put('/assign-packet/:id', checkAuth, wrapper(assignPacket)); // ASSIGN PACKET


route.put('/:id', checkAuth, updatePacketValidation, validationError,wrapper(changePacket)); // UPDATE PACKET

route.delete('/', checkAuth, wrapper(deletePacket)); // DELETE PACKET

module.exports = route;