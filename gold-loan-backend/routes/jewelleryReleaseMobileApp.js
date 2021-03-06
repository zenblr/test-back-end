const express = require('express');
const { ornamentsDetails, ornamentsAmountDetails, ornamentsPartRelease, getCustomerDetails, ornamentsFullRelease, razorPayCreateOrderForOrnament } = require('../controllers/jewelleryRelease/jewelleryRelease');
const route = express.Router();
const { partReleasePayment, fullReleasePayment } = require('../validations/jewelleryRelease');
const validatiError = require('../middleware/validationError');
const { wrapper } = require('../utils/errorWrap');
const customerCheckAuth = require('../middleware/customerCheckAuth');



route.get('/data/:customerId', customerCheckAuth, wrapper(getCustomerDetails));

route.get('/:masterLoanId', customerCheckAuth, wrapper(ornamentsDetails));

route.post('/', customerCheckAuth, wrapper(ornamentsAmountDetails));

route.post('/part-release', partReleasePayment, wrapper(ornamentsPartRelease));

route.post('/full-release', fullReleasePayment, wrapper(ornamentsFullRelease));

route.post('/razor-pay', customerCheckAuth, wrapper(razorPayCreateOrderForOrnament));

module.exports = route;