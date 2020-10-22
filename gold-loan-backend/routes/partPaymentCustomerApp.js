const { wrapper } = require('../utils/errorWrap');
const checkAuth = require('../middleware/customerCheckAuth');
const { viewLog, getInterestInfo, checkPartAmount, partPayment, payableAmountConfirmPartPayment, confirmPartPaymentTranscation } = require('../controllers/partPayment/partPayment');
const checkRolePermission = require('../middleware/checkRolesPermissions');

const express = require('express');
const route = express.Router();

route.get('/view-log', checkAuth, wrapper(viewLog))

route.get('/part-payment-info', checkAuth, wrapper(getInterestInfo))

route.post('/check-part-amount', checkAuth, wrapper(checkPartAmount))

route.post('/confirm-payment-info', checkAuth, wrapper(payableAmountConfirmPartPayment))

route.post('/payment', checkAuth, wrapper(partPayment))



module.exports = route;   
