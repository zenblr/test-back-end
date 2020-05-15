// LOAD REQUIRED PACKGES
const express = require('express');
const route = express.Router();
const { wrapper } = require('../utils/errorWrap'); // IMPORTING ERROR WRAPPER FUNCTION
const { addLoanDisbursementForAccount, getLoanDisbursementAccountDetails, addLoanRepaymentForAccount, getLoanRepaymentAccountDetails } =
    require('../controllers/customerLoanProcess/loanAccount'); // IMPORTING LOAN ACCOUNT PROCESS FUNCTIONS

const checkAuth = require('../middleware/checkAuth'); // IMPORTING CHECK AUTH MIDDLEWARE

route.post('/add-account-for-disbursed', checkAuth, wrapper(addLoanDisbursementForAccount)); // ADD LOAN DISBURSED ACCOUNT

route.get('/get-details-of-disbursed-account', checkAuth, wrapper(getLoanDisbursementAccountDetails)); // FETCH LOAN DISBURSED ACCOUNT DETAILS

route.post('/add-account-for-repayment', checkAuth, wrapper(addLoanRepaymentForAccount)); // ADD LOAN REPAYMENT ACCOUNT

route.get('/get-details-of-repayment-account', checkAuth, wrapper(getLoanRepaymentAccountDetails)); // FETCH LOAN REPAYMENT ACCOUNT DETAILS


module.exports = route; // EXPORTING ALL ROUTES