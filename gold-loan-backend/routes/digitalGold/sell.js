// LOAD REQUIRED PACKGES
const express = require('express');
const route = express.Router();
const { wrapper } = require('../../utils/errorWrap'); // IMPORTING ERROR WRAPPER FUNCTION
const { sellProduct, getAllSellDetails, getSellDetailsWithTransId} = require('../../controllers/digitalGold/sell/sell');
const checkRolePermission = require('../../middleware/checkRolesPermissions');
const customerCheckAuth = require('../../middleware/customerCheckAuth'); // IMPORTING CHECKAUTH MIDDLEWARE


route.post('/', customerCheckAuth, wrapper(sellProduct)); 

route.get('/', customerCheckAuth, wrapper(getAllSellDetails));

route.get('/sell-info/:transactionId', customerCheckAuth, wrapper(getSellDetailsWithTransId));

module.exports = route; // EXPORTING ALL ROUTES
