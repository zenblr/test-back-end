const { panCardNameByPan, checkNameSimilarity, verifyPanCardData, kycOcr } = require('../controllers/karza/karza');
const express = require('express');
const route = express.Router();
const { wrapper } = require('../utils/errorWrap');
const checkAuth = require('../middleware/checkAuth');


route.post('/pan-details',  checkAuth, wrapper(panCardNameByPan));

route.post('/name-similarity',  checkAuth, wrapper(checkNameSimilarity));

route.post('/pan-status',  checkAuth, wrapper(verifyPanCardData));

route.post('/ocr',  checkAuth, wrapper(kycOcr));

module.exports = route;