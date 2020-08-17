const { wrapper } = require('../utils/errorWrap');
const express = require('express');
const checkAuth = require('../middleware/checkAuth');
const { updateLocation, getAllPacketTrackingDetail, viewPackets, checkBarcode, viewLogs, getUserName,getMapDetails,getLocationDetails } = require('../controllers/packetTracking/packetTracking');
const { updateLocationValidation } = require('../validations/packetTracking')
const validationError = require('../middleware/validationError')
const route = express.Router();

route.get('/tracking-details', checkAuth, wrapper(getAllPacketTrackingDetail)); //FETCH PACKET DETAILS FOR TRACKING

route.get('/view-packets', checkAuth, wrapper(viewPackets)) //FETCH PACKET FOR TRACKING

route.get('/check-barcode', checkAuth, wrapper(checkBarcode)); // CHECK BARCODE

route.get('/user-name', checkAuth, wrapper(getUserName));// FETCH USER NAME

route.post('/', checkAuth, updateLocationValidation, validationError, wrapper(updateLocation)); //ADD LOCATION 

route.get('/view-log', checkAuth, wrapper(viewLogs));// FETCH LOGS OF PACKET LOCATION

route.get('/map', checkAuth, wrapper(getMapDetails));// FETCH MAP LOCATION

route.get('/location', checkAuth, wrapper(getLocationDetails));// FETCH MAP LOCATION






module.exports = route;