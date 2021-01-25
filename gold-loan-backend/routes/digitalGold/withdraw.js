// LOAD REQUIRED PACKGES
const express = require('express');
const route = express.Router();
const { wrapper } = require('../../utils/errorWrap'); // IMPORTING ERROR WRAPPER FUNCTION
const {getWithdrawDetailsWithTransId} = require('../../controllers/digitalGold/withdraw/withdraw');
const checkRolePermission = require('../../middleware/checkRolesPermissions');
const customerCheckAuth = require('../../middleware/customerCheckAuth'); // IMPORTING CHECKAUTH MIDDLEWARE

route.get('/:transactionId', customerCheckAuth, wrapper(getWithdrawDetailsWithTransId));

module.exports = route; // EXPORTING ALL ROUTES
