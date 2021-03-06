// LOAD REQUIRED PACKGES
const express = require('express');
const multer = require('multer');
const route = express.Router();
const { wrapper } = require('../utils/errorWrap'); // IMPORTING ERROR WRAPPER FUNCTION
const { changeWithdrawStatus} = require('../controllers/webhook/digiGoldSellWithdrawStatus');
const { changeOrderDeliveryStatus} = require('../controllers/webhook/digiGoldDeliveryStatus');
const { changeKycStatus} = require('../controllers/webhook/digiGoldKycStatus');

const { apiKeyGenerate} = require('../controllers/webhook/generateApiKey');

const webHookCheckAuth = require('../middleware/webHookCheckAuth');

route.get('/generate-api-key', wrapper(apiKeyGenerate));

route.post('/change-order-status', webHookCheckAuth,wrapper(changeOrderDeliveryStatus));

route.post('/change-withdraw-status', webHookCheckAuth,wrapper(changeWithdrawStatus));

route.post('/change-kyc-status', webHookCheckAuth,wrapper(changeKycStatus));

module.exports = route; // EXPORTING ALL ROUTES
