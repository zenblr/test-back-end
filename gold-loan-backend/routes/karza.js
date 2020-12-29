const { panCardNameByPan, checkNameSimilarity, verifyPanCardData, kycOcrForAadhaar, kycOcrFoPanCard, getCustomerEkycData, kycOcrAddressVoterId  } = require('../controllers/karza/karza');
const express = require('express');
const route = express.Router();
const { wrapper } = require('../utils/errorWrap');
const checkAuth = require('../middleware/checkAuth');


route.post('/pan-details',  checkAuth, wrapper(panCardNameByPan));

route.post('/name-similarity',  checkAuth, wrapper(checkNameSimilarity));

route.post('/pan-status',  checkAuth, wrapper(verifyPanCardData));

route.post('/ocr-aadhaar',  checkAuth, wrapper(kycOcrForAadhaar));

route.post('/ocr-pan',  checkAuth, wrapper(kycOcrFoPanCard));

route.get('/data', checkAuth, wrapper(getCustomerEkycData));

route.post('/ocr-voter',  checkAuth, wrapper(kycOcrAddressVoterId));

module.exports = route;