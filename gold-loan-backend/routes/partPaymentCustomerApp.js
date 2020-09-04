const { wrapper } = require('../utils/errorWrap');
const checkAuth = require('../middleware/customerCheckAuth');
const { viewLog, getInterestInfo, checkPartAmount, partPayment, payableAmountConfirmPartPayment, confirmPartPaymentTranscation } = require('../controllers/partPayment/partPayment');
const checkRolePermission = require('../middleware/checkRolesPermissions');

const express = require('express');
const route = express.Router();

route.get('/view-log', checkAuth, checkRolePermission, wrapper(viewLog))

route.get('/part-payment-info', checkAuth, checkRolePermission, wrapper(getInterestInfo))

route.post('/check-part-amount', checkAuth, checkRolePermission, wrapper(checkPartAmount))

route.post('/confirm-payment-info', checkAuth, checkRolePermission, wrapper(payableAmountConfirmPartPayment))

route.post('/payment', checkAuth, checkRolePermission, wrapper(partPayment))

module.exports = route;   
