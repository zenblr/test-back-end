// LOAD REQUIRED PACKGES
const express = require('express');
const route = express.Router();
const { wrapper } = require('../../utils/errorWrap'); // IMPORTING ERROR WRAPPER FUNCTION
const {redeemOrderValidation} = require('../../validations/digitalGold/redeemOrder');
const validationError = require('../../middleware/validationError');
const { AddOrder, getOrderList, getOrderDetailsWithTransId, generateOrderInvoice, generateOrderInvoiceWeb} = require('../../controllers/digitalGold/RedeemOrder/redeemOrder');
const checkRolePermission = require('../../middleware/checkRolesPermissions');
const customerCheckAuth = require('../../middleware/customerCheckAuth'); // IMPORTING CHECKAUTH MIDDLEWARE


route.post('/delivery',customerCheckAuth, wrapper(AddOrder));

route.get('/', customerCheckAuth, wrapper(getOrderList));

route.get('/order-info/:merchantTransactionId', customerCheckAuth, wrapper(getOrderDetailsWithTransId));

route.get('/invoice/:transactionId', customerCheckAuth, wrapper(generateOrderInvoice));

route.get('/invoice-web/:transactionId', customerCheckAuth, wrapper(generateOrderInvoiceWeb));

module.exports = route; // EXPORTING ALL ROUTES
