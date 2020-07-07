// LOAD REQUIRED PACKGES
const express = require('express');
const route = express.Router();
const { wrapper } = require('../utils/errorWrap'); // IMPORTING ERROR WRAPPER FUNCTION
const { loanTransferBasicDeatils } =
  require('../controllers/customerLoanTransfer/customerLoanTransfer'); // IMPORTING LOAN PROCESS FUNCTIONS

const checkAuth = require('../middleware/checkAuth'); // IMPORTING CHECK AUTH MIDDLEWARE

route.post('/basic-details', checkAuth, wrapper(loanTransferBasicDeatils)); // ADD CUSTOMER BANK DETAIL

module.exports = route; // EXPORTING ALL ROUTES