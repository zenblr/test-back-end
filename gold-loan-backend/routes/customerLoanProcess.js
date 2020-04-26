// LOAD REQUIRED PACKGES
const express = require('express');
const route = express.Router();
const { wrapper } = require('../utils/errorWrap'); // IMPORTING ERROR WRAPPER FUNCTION
const { applyForLoanApplication, updateCustomerOrnamentsDetail, addPackageImagesForLoan, disbursementOfLoanAmount, getLoanDetails } =
    require('../controllers/customerLoanProcess/customerLoanProcess'); // IMPORTING LOAN PROCESS FUNCTIONS

const checkAuth = require('../middleware/checkAuth'); // IMPORTING CHECK AUTH MIDDLEWARE

route.post('/apply-for-loan', checkAuth, wrapper(applyForLoanApplication)); // ADD CUSTOMER BANK DETAIL

route.put('/change-loan-ornaments-detail/:id', checkAuth, wrapper(updateCustomerOrnamentsDetail)); // UPDATE CUSTOMER ORNAMENTS DETAIL

route.post('/add-package-images', checkAuth, wrapper(addPackageImagesForLoan)); // ADD PACKAGE IMAGES

route.post('/disbursement-of-loan', checkAuth, wrapper(disbursementOfLoanAmount)); // DISBURSEMENT OF LOAN AMOUNT

route.get('/loan-details', checkAuth, wrapper(getLoanDetails)); // FETCH AMOUNT DETAILS

module.exports = route; // EXPORTING ALL ROUTES