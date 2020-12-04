// LOAD REQUIRED PACKGES
const express = require('express');
const route = express.Router();
const { wrapper } = require('../../utils/errorWrap'); // IMPORTING ERROR WRAPPER FUNCTION
const { createCustomerAddress, getCustomerAddressList, deleteCustomerAddress} = require('../../controllers/digitalGold/customer/customerAddress');
const checkRolePermission = require('../../middleware/checkRolesPermissions');
const customerCheckAuth = require('../../middleware/customerCheckAuth'); // IMPORTING CHECKAUTH MIDDLEWARE


route.post('/', customerCheckAuth, wrapper(createCustomerAddress)); 

route.get('/', customerCheckAuth, wrapper(getCustomerAddressList));

route.delete('/:userAddressId', customerCheckAuth, wrapper(deleteCustomerAddress));

module.exports = route; // EXPORTING ALL ROUTES
