const express = require('express');
const route = express.Router();
const { wrapper } = require('../utils/errorWrap');
const validationError= require('../middleware/validationError');
const {submitCustomerKycAddressValidation,submitAllKycInfoValidation,submitCustomerKycBankDetailValidation,
        submitCustomerKycInfoValidation,submitCustomerKycpersonalDetailValidation,getCustomerDetailsValidation}=require('../validations/customerKyc');
const { sendOtpKycNumber, verifyCustomerKycNumber, getCustomerDetails, submitCustomerKycinfo, submitCustomerKycAddress, submitCustomerKycPersonalDetail, submitCustomerKycBankDetail, submitAllKycInfo, appliedKyc } = require('../controllers/customerKyc/customerKyc')

const checkAuth = require('../middleware/checkAuth');

route.post('/send-otp-kyc-number', checkAuth, wrapper(sendOtpKycNumber))

route.post('/verify-kyc-number', checkAuth, wrapper(verifyCustomerKycNumber))

route.post('/get-customer-detail',getCustomerDetailsValidation ,validationError,checkAuth, wrapper(getCustomerDetails))

route.post('/customer-info', submitCustomerKycInfoValidation,validationError,checkAuth, wrapper(submitCustomerKycinfo))

route.post('/customer-kyc-address', submitCustomerKycAddressValidation,validationError,checkAuth, wrapper(submitCustomerKycAddress))

route.post('/customer-kyc-personal', submitCustomerKycpersonalDetailValidation,validationError,checkAuth, wrapper(submitCustomerKycPersonalDetail))

route.post('/customer-kyc-bank', submitCustomerKycBankDetailValidation,validationError,checkAuth, wrapper(submitCustomerKycBankDetail))

route.post('/submit-all-kyc-info', submitAllKycInfoValidation,validationError,checkAuth, wrapper(submitAllKycInfo))

route.get('/applied-kyc', wrapper(appliedKyc))

module.exports = route;