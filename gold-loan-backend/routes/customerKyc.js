const express = require('express');
const route = express.Router();
const { wrapper } = require('../utils/errorWrap');
const validationError = require('../middleware/validationError');
const { submitCustomerKycAddressValidation, submitAllKycInfoValidation, submitCustomerKycBankDetailValidation,
    submitCustomerKycInfoValidation, submitCustomerKycpersonalDetailValidation, getCustomerDetailsValidation, submitCustomerKycDetailValidation,z } = require('../validations/customerKyc');
const { getCustomerDetails, submitCustomerKycinfo, submitCustomerKycAddress, submitCustomerKycPersonalDetail, submitCustomerKycBankDetail, submitAllKycInfo, appliedKyc, getReviewAndSubmit,editAppKyc } = require('../controllers/customerKyc/customerKyc')

const { submitAppKyc, getAssignedCustomer } = require('../controllers/customerKyc/appCustomerKyc')
const checkAuth = require('../middleware/checkAuth');
const checkRolePermission = require('../middleware/checkRolesPermissions');


route.post('/get-customer-detail', getCustomerDetailsValidation, validationError, checkAuth, checkRolePermission, wrapper(getCustomerDetails))

route.post('/customer-info', submitCustomerKycInfoValidation, validationError, checkAuth, checkRolePermission, wrapper(submitCustomerKycinfo))

route.post('/customer-kyc-address', submitCustomerKycAddressValidation, validationError, checkAuth, checkRolePermission, wrapper(submitCustomerKycAddress))

route.post('/customer-kyc-personal', submitCustomerKycpersonalDetailValidation, validationError, checkAuth, checkRolePermission, wrapper(submitCustomerKycPersonalDetail))

route.post('/customer-kyc-bank', submitCustomerKycBankDetailValidation, validationError, checkAuth, checkRolePermission, wrapper(submitCustomerKycBankDetail))

route.post('/submit-all-kyc-info', submitAllKycInfoValidation, validationError, checkAuth, checkRolePermission, wrapper(submitAllKycInfo))

route.get('/applied-kyc', checkAuth, checkRolePermission, wrapper(appliedKyc))

route.get('/kyc-form-review', checkAuth, checkRolePermission, wrapper(getReviewAndSubmit));

//customerApp

route.post('/submit-kyc', submitCustomerKycDetailValidation, validationError, checkAuth, wrapper(submitAppKyc))

route.post('/edit-kyc', submitCustomerKycDetailValidation, validationError, checkAuth, wrapper(editAppKyc))



route.get('/get-assigned-customer', checkAuth, wrapper(getAssignedCustomer))

//customerApp


module.exports = route;