// LOAD REQUIRED PACKGES
const express = require('express');
const route = express.Router();
const { wrapper } = require('../../utils/errorWrap'); // IMPORTING ERROR WRAPPER FUNCTION
const {augmontBankDetails} = require('../../controllers/digitalGold/augmontBankDetail/augmontBankDetail');
const checkRolePermission = require('../../middleware/checkRolesPermissions');
const customerCheckAuth = require('../../middleware/customerCheckAuth'); // IMPORTING CHECKAUTH MIDDLEWARE

route.get('/', customerCheckAuth, wrapper(augmontBankDetails));

module.exports = route; // EXPORTING ALL ROUTES