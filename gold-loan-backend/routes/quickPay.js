const { wrapper } = require('../utils/errorWrap');
const checkAuth = require('../middleware/checkAuth');
const { getInterestTable, getInterestInfo, payableAmount, payableAmountConfirm } = require('../controllers/quickPay/quickPay');

const express = require('express');
const route = express.Router();

route.get('/interest-table', checkAuth, wrapper(getInterestTable));

route.get('/interest-info', checkAuth, wrapper(getInterestInfo))

route.get('/payable-amount', checkAuth, wrapper(payableAmount));

route.get('/confirm-payment-info', checkAuth, wrapper(payableAmountConfirm))

module.exports = route;   
