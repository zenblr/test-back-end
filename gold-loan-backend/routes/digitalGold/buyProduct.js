// LOAD REQUIRED PACKGES
const express = require('express');
const route = express.Router();
const { wrapper } = require('../../utils/errorWrap'); // IMPORTING ERROR WRAPPER FUNCTION
const {buyValidation} = require('../../validations/digitalGold/buy');
const validationError = require('../../middleware/validationError');
const { buyProduct, getAllBuyDetails, getBuyDetailsWithTransId, generateInvoice, generateInvoiceweb} = require('../../controllers/digitalGold/buy/buyProduct');
const checkRolePermission = require('../../middleware/checkRolesPermissions');
const customerCheckAuth = require('../../middleware/customerCheckAuth'); // IMPORTING CHECKAUTH MIDDLEWARE


route.post('/buy-metal', customerCheckAuth,  wrapper(buyProduct));

route.get('/', customerCheckAuth, wrapper(getAllBuyDetails));

route.get('/buy-info/:transactionId', customerCheckAuth, wrapper(getBuyDetailsWithTransId));

route.get('/generate-invoice/:transactionId', customerCheckAuth, wrapper(generateInvoice));

route.get('/generate-invoice-web/:transactionId', customerCheckAuth, wrapper(generateInvoiceweb));

module.exports = route; // EXPORTING ALL ROUTES
