// LOAD REQUIRED PACKGES
const express = require('express');
const route = express.Router();
const { wrapper } = require('../utils/errorWrap'); // IMPORTING ERROR WRAPPER FUNCTION
const { applyForLoanApplication, updateCustomerLoanDetail, addPackageImagesForLoan, disbursementOfLoanAmount, getLoanDetails, getSingleLoanDetails, appliedLoanDetails, customerDetails } =
    require('../controllers/customerLoanProcess/customerLoanProcess'); // IMPORTING LOAN PROCESS FUNCTIONS

const checkAuth = require('../middleware/checkAuth'); // IMPORTING CHECK AUTH MIDDLEWARE

route.post('/apply-for-loan', checkAuth, wrapper(applyForLoanApplication)); // ADD CUSTOMER BANK DETAIL

route.get('/single-loan', checkAuth, wrapper(getSingleLoanDetails)); // ADD CUSTOMER BANK DETAIL

route.put('/change-loan-detail/:loanId', checkAuth, wrapper(updateCustomerLoanDetail)); // UPDATE CUSTOMER LOAN DETAIL

route.post('/add-packet-images', checkAuth, wrapper(addPackageImagesForLoan)); // ADD PACKAGE IMAGES

route.post('/disbursement-of-loan', checkAuth, wrapper(disbursementOfLoanAmount)); // DISBURSEMENT OF LOAN AMOUNT

route.get('/loan-details', checkAuth, wrapper(getLoanDetails)); // FETCH LOAN DETAILS

route.get('/applied-loan-details', checkAuth, wrapper(appliedLoanDetails)); // FETCH APLLIED LOAN DETAILS

route.get('/customer-loan-details/:customerUniqueId', checkAuth, wrapper(customerDetails)); // FETCH CUSTOMER DETAILS

module.exports = route; // EXPORTING ALL ROUTES