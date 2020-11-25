const express = require('express');
const { submitApplyKyc, submitEditKycInfo, getKycInfo } = require('../controllers/customerKyc/customerWebsiteKyc');
const route = express.Router();
const validatiError = require('../middleware/validationError');
const { wrapper } = require('../utils/errorWrap');
const customerCheckAuth = require('../middleware/customerCheckAuth');



route.post('/apply-kyc', customerCheckAuth, wrapper(submitApplyKyc));

route.post('/edit-kyc', customerCheckAuth, wrapper(submitEditKycInfo));

route.get('/kyc-info', customerCheckAuth, wrapper(getKycInfo))

module.exports = route;