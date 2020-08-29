const { wrapper } = require('../utils/errorWrap');
const checkAuth = require('../middleware/checkAuth');
const { getInterestInfo, checkPartAmount, partPayment, payableAmountConfirmPartPayment } = require('../controllers/partPayment/partPayment');

const express = require('express');
const route = express.Router();

route.get('/interest-info', checkAuth, wrapper(getInterestInfo))

route.post('/check-part-amount', checkAuth, wrapper(checkPartAmount))

route.post('/confirm-payment-info', checkAuth, wrapper(payableAmountConfirmPartPayment))

route.post('/payment', checkAuth, wrapper(partPayment))

module.exports = route;   
