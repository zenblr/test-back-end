// LOAD REQUIRED PACKGES
const express = require('express');
const route = express.Router();
const { wrapper } = require('../../utils/errorWrap'); // IMPORTING ERROR WRAPPER FUNCTION
const {makePayment} = require('../../controllers/digitalGold/razorPay/razorPay');
const checkRolePermission = require('../../middleware/checkRolesPermissions');
const customerCheckAuth = require('../../middleware/customerCheckAuth'); // IMPORTING CHECKAUTH MIDDLEWARE

route.post('/', customerCheckAuth, wrapper(makePayment));

module.exports = route; // EXPORTING ALL ROUTES
