const { wrapper } = require('../utils/errorWrap');
const checkAuth = require('../middleware/checkAuth');
const { getInterestTable,razorPayCreateOrder, getInterestInfo, payableAmount, payableAmountConfirm, quickPayment, confirmationForPayment,transcationHistory } = require('../controllers/quickPay/quickPay');

const express = require('express');
const route = express.Router();
const checkRolePermission = require('../middleware/checkRolesPermissions');


route.get('/interest-table', checkAuth, checkRolePermission, wrapper(getInterestTable));

route.get('/interest-info', checkAuth, checkRolePermission, wrapper(getInterestInfo))

route.get('/payable-amount', checkAuth, checkRolePermission, wrapper(payableAmount));

route.get('/confirm-payment-info', checkAuth, checkRolePermission, wrapper(payableAmountConfirm))

route.post('/payment', checkAuth, checkRolePermission, wrapper(quickPayment));

route.post('/confirm-payment', checkAuth, checkRolePermission, wrapper(confirmationForPayment));

route.post('/razor-pay', checkAuth, wrapper(razorPayCreateOrder));

route.get('/transcation-history',checkAuth,wrapper(transcationHistory))


module.exports = route;   
