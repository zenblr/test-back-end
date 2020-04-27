const express = require('express');
const route = express.Router();
const { wrapper } = require('../utils/errorWrap');
const { sendOtpKycNumber, verifyCustomerKycNumber, getCustomerDetails, submitCustomerKycinfo, submitCustomerKycAddress, submitCustomerKycPersonalDetail, submitCustomerKycBankDetail, submitAllKycInfo } = require('../controllers/customerKyc/customerKyc')

const checkAuth = require('../middleware/checkAuth');

route.post('/send-otp-kyc-number', checkAuth, wrapper(sendOtpKycNumber))

route.post('/verify-kyc-number', checkAuth, wrapper(verifyCustomerKycNumber))

route.post('/get-customer-detail', checkAuth, wrapper(getCustomerDetails))

route.post('/customer-info', checkAuth, wrapper(submitCustomerKycinfo))

route.post('/customer-kyc-address', checkAuth, wrapper(submitCustomerKycAddress))

route.post('/customer-kyc-personal', checkAuth, wrapper(submitCustomerKycPersonalDetail))

route.post('/customer-kyc-bank', checkAuth, wrapper(submitCustomerKycBankDetail))

route.post('/submit-all-kyc-info', checkAuth, wrapper(submitAllKycInfo))





module.exports = route;