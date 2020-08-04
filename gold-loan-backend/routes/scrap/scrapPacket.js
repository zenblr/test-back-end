const { addScrapPacket, viewScrapPacket, changePacket, deletePacket, availableScrapPacket, scrapAssignAppraiser} = require('../../controllers/scrap/scrapPacket/scrapPacket');
const { wrapper } = require('../../utils/errorWrap');
const express = require('express');
const checkAuth = require('../../middleware/checkAuth');
const validationError = require('../../middleware/validationError');
const { scrapPacketValidation } = require('../../validations/scrap/scrapPacket');
const checkRolePermission = require('../../middleware/checkRolesPermissions');

const route = express.Router();

route.post('/', checkAuth, scrapPacketValidation, validationError, wrapper(addScrapPacket)); // add packet for scrap

route.get('/', checkAuth, wrapper(viewScrapPacket)); // get scrap packet

route.get('/available-packet', checkAuth, wrapper(availableScrapPacket)); // get available scrap packet

route.put('/assign-appraiser',checkAuth, wrapper(scrapAssignAppraiser)); // ASSIGN APPRAISER

// route.put('/assign-packet/:id', checkAuth, wrapper(assignPacket)); // ASSIGN PACKET

route.put('/:id', checkAuth, scrapPacketValidation, validationError, wrapper(changePacket)); // update scrap packet

route.delete('/:id', checkAuth, wrapper(deletePacket)); // delete scrap packet

module.exports = route;