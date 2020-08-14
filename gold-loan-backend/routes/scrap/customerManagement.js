// LOAD REQUIRED PACKGES
const express = require('express');
const route = express.Router();
const { wrapper } = require('../../utils/errorWrap'); // IMPORTING ERROR WRAPPER FUNCTION
const { getScrapDetailCustomerManagement, getAllCustomerForCustomerManagement, getsingleCustomerManagement, getSingleScrapInCustomerManagment} =
  require('../../controllers/scrap/customerManagement/customerManagement'); // IMPORTING LOAN PROCESS FUNCTIONS
const checkRolePermission = require('../../middleware/checkRolesPermissions');
const checkAuth = require('../../middleware/checkAuth'); // IMPORTING CHECKAUTH MIDDLEWARE


route.get('/scrap-details', checkAuth, wrapper(getScrapDetailCustomerManagement)); // FETCH APLLIED LOAN DETAILS

route.get('/customer-management', checkAuth, wrapper(getAllCustomerForCustomerManagement));

route.get('/single-scrap-customer', checkAuth, wrapper(getSingleScrapInCustomerManagment))//customer-managment single SCRAP

route.get('/customer-management/:customerId', checkAuth, wrapper(getsingleCustomerManagement));

module.exports = route; // EXPORTING ALL ROUTES
