// LOAD REQUIRED PACKGES
const express = require('express');
const route = express.Router();
const { wrapper } = require('../../utils/errorWrap'); // IMPORTING ERROR WRAPPER FUNCTION
const {getAllProduct, getProductBySku} = require('../../controllers/digitalGold/product/product');
// const checkRolePermission = require('../../middleware/checkRolesPermissions');
const customerCheckAuth = require('../../middleware/customerCheckAuth'); // IMPORTING CHECKAUTH MIDDLEWARE

route.get('/', customerCheckAuth, wrapper(getAllProduct));

route.get('/:productSku', customerCheckAuth, wrapper(getProductBySku));

module.exports = route; // EXPORTING ALL ROUTES
