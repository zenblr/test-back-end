const express = require('express');
const { wrapper } = require('../../utils/errorWrap');
const { checkBarcode, viewPackets, getUserName, checkOutPacket, verifyCheckOut, submitScrapPacketLocation, addCustomerPacketTracking, getAllPacketTrackingDetail, viewCustomerPacketTrackingLogs, getNextPacketLoaction, getParticularLocation } = require('../../controllers/scrap/scrapPacketTracking/scrapPacketTracking')
const checkAuth = require('../../middleware/checkAuth');
const validationError = require('../../middleware/validationError');
const checkRolePermission = require('../../middleware/checkRolesPermissions');
const { submitScrapPacketLocationValidation, addPacketLocationValidation } = require('../../validations/scrap/scrapPacketTracking');


const route = express.Router();

route.get('/check-barcode', checkAuth, wrapper(checkBarcode)); // CHECK BARCODE

route.get('/view-packets', checkAuth, wrapper(viewPackets)) //FETCH PACKET FOR TRACKING

route.get('/get-particular-location', checkAuth, wrapper(getParticularLocation));

route.get('/user-name', checkAuth, wrapper(getUserName));// FETCH USER NAME

route.post('/submit-packet-location', checkAuth, submitScrapPacketLocationValidation, validationError, wrapper(submitScrapPacketLocation))//branch in

route.post('/', checkAuth, addPacketLocationValidation, validationError, wrapper(addCustomerPacketTracking)); //branch out

route.get('/tracking-details', checkAuth, checkRolePermission, wrapper(getAllPacketTrackingDetail)); //FETCH PACKET DETAILS FOR TRACKING  checkRolePermission                                                                                                         

route.get('/view-log', checkAuth, wrapper(viewCustomerPacketTrackingLogs));// FETCH LOGS OF PACKET LOCATION

route.get('/next-packet-location', checkAuth, wrapper(getNextPacketLoaction)); // FETCH NEXT PACKET LOCATION

module.exports = route;

