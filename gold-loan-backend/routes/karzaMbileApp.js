const { panCardNameByPan, checkNameSimilarity, verifyPanCardData, kycOcrForAadhaar, kycOcrFoPanCard, getCustomerEkycData, kycOcrAddressVoterId  } = require('../controllers/karza/karza');
const express = require('express');
const route = express.Router();
const { wrapper } = require('../utils/errorWrap');
const customerCheckAuth = require('../middleware/customerCheckAuth');


route.post('/pan-details', customerCheckAuth, wrapper(panCardNameByPan));

route.post('/name-similarity', customerCheckAuth, wrapper(checkNameSimilarity));

route.post('/pan-status',  customerCheckAuth, wrapper(verifyPanCardData));

route.post('/ocr-aadhaar',  customerCheckAuth, wrapper(kycOcrForAadhaar));

route.post('/ocr-pan',  customerCheckAuth, wrapper(kycOcrFoPanCard));

route.get('/data', customerCheckAuth, wrapper(getCustomerEkycData));

route.post('/ocr-voter',  customerCheckAuth, wrapper(kycOcrAddressVoterId));

module.exports = route;