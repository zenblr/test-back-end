const express = require('express');
const route = express.Router();
const { wrapper } = require('../utils/errorWrap');
const validationError = require('../middleware/validationError');
const { submitCustomerKycAddressValidation, submitAllKycInfoValidation, submitCustomerKycBankDetailValidation,
    submitCustomerKycInfoValidation, submitCustomerKycpersonalDetailValidation, getCustomerDetailsValidation, submitCustomerKycDetailValidation } = require('../validations/customerKyc');
const { getCustomerDetails, submitCustomerKycinfo, submitCustomerKycAddress, submitCustomerKycPersonalDetail, submitCustomerKycBankDetail, submitAllKycInfo, appliedKyc, getReviewAndSubmit, allowToEdit, changeDigiKycStatus, getDigiKycList, applyDigiKyc } = require('../controllers/customerKyc/customerKyc')

const { submitAppKyc, getAssignedCustomer, editAppKyc, checkDuplicatePan, checkDuplicateAadhar, checkLoanAppraiser } = require('../controllers/customerKyc/appCustomerKyc')
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

route.post('/allow-to-edit', checkAuth, wrapper(allowToEdit))

route.get('/digi-list', checkAuth, wrapper(getDigiKycList))

route.post('/apply-digi-kyc', checkAuth, wrapper(applyDigiKyc))

route.post('/update-digi-status', checkAuth, wrapper(changeDigiKycStatus))

//appraiserApp

route.post('/submit-kyc', submitCustomerKycDetailValidation, validationError, checkAuth, wrapper(submitAppKyc))

route.post('/edit-kyc', submitCustomerKycDetailValidation, validationError, checkAuth, wrapper(editAppKyc))

route.post('/check-pan-card', checkAuth, wrapper(checkDuplicatePan));

route.post('/check-aadhar-card', checkAuth, wrapper(checkDuplicateAadhar));

route.get('/get-assigned-customer', checkAuth, wrapper(getAssignedCustomer))

route.post('/check-loan-assign', checkAuth, wrapper(checkLoanAppraiser))

//appraiserApp


module.exports = route;