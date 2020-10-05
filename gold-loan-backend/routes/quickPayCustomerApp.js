const { wrapper } = require('../utils/errorWrap');
const checkAuth = require('../middleware/customerCheckAuth');
const { getInterestTable, getInterestInfo, payableAmount, transcationHistory, payableAmountConfirm, quickPayment } = require('../controllers/quickPay/quickPay');

const express = require('express');
const route = express.Router();
const checkRolePermission = require('../middleware/checkRolesPermissions');


route.get('/interest-table', checkAuth, wrapper(getInterestTable));

route.get('/interest-info', checkAuth, wrapper(getInterestInfo));

route.get('/payable-amount', checkAuth, wrapper(payableAmount));

route.get('/confirm-payment-info', checkAuth, wrapper(payableAmountConfirm))

route.post('/payment', checkAuth, wrapper(quickPayment));

route.get('/transcation-history', checkAuth, wrapper(transcationHistory))


module.exports = route;   
