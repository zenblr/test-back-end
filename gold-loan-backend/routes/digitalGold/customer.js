// LOAD REQUIRED PACKGES
const express = require('express');
const route = express.Router();
const { wrapper } = require('../../utils/errorWrap'); // IMPORTING ERROR WRAPPER FUNCTION
// const {customerValidation} = require('../../validations/digitalGold/customer');
const validationError = require('../../middleware/validationError');
const { createCustomer , getCustomerDetails, updateCustomerDetails, getCustomerPassbookDetails} = require('../../controllers/digitalGold/customer/customer');
const checkRolePermission = require('../../middleware/checkRolesPermissions');
const customerCheckAuth = require('../../middleware/customerCheckAuth'); // IMPORTING CHECKAUTH MIDDLEWARE


// route.post('/',customerValidation, validationError, wrapper(createCustomer)); 

route.get('/', customerCheckAuth, wrapper(getCustomerDetails));

route.get('/passbook-details', customerCheckAuth, wrapper(getCustomerPassbookDetails));

route.put('/', customerCheckAuth, wrapper(updateCustomerDetails));

module.exports = route; // EXPORTING ALL ROUTES
