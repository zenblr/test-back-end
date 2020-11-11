// LOAD REQUIRED PACKGES
const express = require('express');
const route = express.Router();
const { wrapper } = require('../../utils/errorWrap'); // IMPORTING ERROR WRAPPER FUNCTION
const {getBankList} = require('../../controllers/digitalGold/bank/bank');
const checkRolePermission = require('../../middleware/checkRolesPermissions');
const customerCheckAuth = require('../../middleware/customerCheckAuth'); // IMPORTING CHECKAUTH MIDDLEWARE

route.get('/', customerCheckAuth, wrapper(getBankList));

module.exports = route; // EXPORTING ALL ROUTES
