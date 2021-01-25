// LOAD REQUIRED PACKGES
const express = require('express');
const multer = require('multer');
const route = express.Router();
const { wrapper } = require('../../utils/errorWrap'); // IMPORTING ERROR WRAPPER FUNCTION
const validationError = require('../../middleware/validationError');
const  {customerKycValidation} = require('../../validations/digitalGold/customerKyc')
const { addCustomerKycDetails, getCustomerKycDetails} = require('../../controllers/digitalGold/customer/customerKyc');
const checkRolePermission = require('../../middleware/checkRolesPermissions');
const customerCheckAuth = require('../../middleware/customerCheckAuth'); // IMPORTING CHECKAUTH MIDDLEWARE

route.post('/', customerCheckAuth, customerKycValidation, validationError,wrapper(addCustomerKycDetails)); 

route.get('/', customerCheckAuth, wrapper(getCustomerKycDetails));

module.exports = route; // EXPORTING ALL ROUTES
