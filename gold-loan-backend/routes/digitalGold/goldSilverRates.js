// LOAD REQUIRED PACKGES
const express = require('express');
const route = express.Router();
const { wrapper } = require('../../utils/errorWrap'); // IMPORTING ERROR WRAPPER FUNCTION
const {getGoldSilverRate} = require('../../controllers/digitalGold/goldSilverRates/goldSilverRates');
const checkRolePermission = require('../../middleware/checkRolesPermissions');
const customerCheckAuth = require('../../middleware/checkAuth'); // IMPORTING CHECKAUTH MIDDLEWARE
const {getGoldSilverRatetest} = require('../../utils/apiTest');


route.get('/', wrapper(getGoldSilverRate));

route.get('/get-test-rates', wrapper(getGoldSilverRatetest));


module.exports = route; // EXPORTING ALL ROUTES
