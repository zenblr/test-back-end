const express = require('express');
const route = express.Router();
const { wrapper } = require('../utils/errorWrap');
const { verifyCustomerKycNumber, submitCustomerKycinfo, submitCustomerKycAddress, submitCustomerKycPersonalDetail, submitCustomerKycBankDetail, submitKyc } = require('../controllers/customerKyc/customerKyc')

const checkAuth = require('../middleware/checkAuth');

route.post('/verify-kyc-number', checkAuth, wrapper(verifyCustomerKycNumber))

route.post('/customer-info', checkAuth, wrapper(submitCustomerKycinfo))

route.post('/customer-kyc-address', checkAuth, wrapper(submitCustomerKycAddress))

route.post('/customer-kyc-personal', checkAuth, wrapper(submitCustomerKycPersonalDetail))

route.post('/customer-kyc-bank', checkAuth, wrapper(submitCustomerKycBankDetail))

route.post('/submit-kyc', checkAuth, wrapper(submitKyc))





module.exports = route;