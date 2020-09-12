const { wrapper } = require('../utils/errorWrap');
const express = require('express');
const checkAuth = require('../middleware/checkAuth');
const { getAllPacketTrackingDetail, addPacketTracking, viewPackets, checkBarcode, getUserName, getMapDetails, getLocationDetails, addCustomerPacketTracking, viewCustomerPacketTrackingLogs, checkOutPacket, verifyCheckOut, getParticularLocation, submitLoanPacketLocation, getDeliveryLocation, myDeliveryPacket, deliveryUserType, deliveryApproval, getNextPacketLoaction } = require('../controllers/packetTracking/packetTracking');
const { addCustomerPacketTrackingValidation } = require('../validations/packetTracking')
const { getGlobalMapDetails, getGloablMapLocation, getPacketTrackingByLoanId } = require('../controllers/packetTracking/globalMap')
const validationError = require('../middleware/validationError')
const route = express.Router();

route.get('/tracking-details', checkAuth, wrapper(getAllPacketTrackingDetail)); //FETCH PACKET DETAILS FOR TRACKING

route.get('/view-packets', checkAuth, wrapper(viewPackets)) //FETCH PACKET FOR TRACKING

route.get('/check-barcode', checkAuth, wrapper(checkBarcode)); // CHECK BARCODE

route.get('/user-name', checkAuth, wrapper(getUserName));// FETCH USER NAME

route.post('/', checkAuth, addCustomerPacketTrackingValidation, validationError, wrapper(addCustomerPacketTracking)); //ADD LOCATION 

route.get('/view-log', checkAuth, wrapper(viewCustomerPacketTrackingLogs));// FETCH LOGS OF PACKET LOCATION

route.get('/map', checkAuth, wrapper(getMapDetails));// FETCH MAP LOCATION

route.get('/location', checkAuth, wrapper(getLocationDetails));// FETCH MAP LOCATION

route.post('/add-packet-tracking', checkAuth, wrapper(addPacketTracking)); // add packet tracking

route.get('/check-out-packet', checkAuth, wrapper(checkOutPacket))

route.post('/verify-check-out', checkAuth, wrapper(verifyCheckOut))

route.get('/get-particular-location', checkAuth, wrapper(getParticularLocation))

route.post('/submit-packet-location', checkAuth, wrapper(submitLoanPacketLocation))

route.get('/get-delivery-location', checkAuth, wrapper(getDeliveryLocation))

route.get('/my-delivery-packet', checkAuth, wrapper(myDeliveryPacket))

route.get('/delivery-user-type', checkAuth, wrapper(deliveryUserType))

route.get('/delivery-approval', checkAuth, wrapper(deliveryApproval))

route.get('/next-packet-location', checkAuth, wrapper(getNextPacketLoaction))

// global Map 

route.get('/global-map-info', checkAuth, wrapper(getGlobalMapDetails))

route.get('/global-location-info', checkAuth, wrapper(getGloablMapLocation))

route.get('/global-packet-trackng', checkAuth, wrapper(getPacketTrackingByLoanId))


module.exports = route;
