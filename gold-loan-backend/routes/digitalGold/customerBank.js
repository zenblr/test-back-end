// LOAD REQUIRED PACKGES
const express = require('express');
const route = express.Router();
const { wrapper } = require('../../utils/errorWrap'); // IMPORTING ERROR WRAPPER FUNCTION
const validationError = require('../../middleware/validationError');
const { createCustomerBankAccount, getCustomerBankDetails, updateCustomerBankDetails, deleteCustomerBankDetails} = require('../../controllers/digitalGold/customer/customerBank');
const checkRolePermission = require('../../middleware/checkRolesPermissions');
const customerCheckAuth = require('../../middleware/customerCheckAuth'); // IMPORTING CHECKAUTH MIDDLEWARE


route.post('/', customerCheckAuth, wrapper(createCustomerBankAccount)); 

route.get('/', customerCheckAuth, wrapper(getCustomerBankDetails));

route.put('/:customerBankId', customerCheckAuth, wrapper(updateCustomerBankDetails));

route.delete('/:customerBankId', customerCheckAuth, wrapper(deleteCustomerBankDetails));

module.exports = route; // EXPORTING ALL ROUTES
