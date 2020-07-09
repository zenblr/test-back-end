const express = require('express');
const route = express.Router();
const { wrapper } = require('../utils/errorWrap'); 
const { loanTransferBasicDeatils,customerDetails,loanTransferDocuments,loanTransferBmRating,loanTransferDisbursal,getSingleLoanDetails } =require('../controllers/customerLoanTransfer/customerLoanTransfer'); // IMPORTING LOAN PROCESS FUNCTIONS
const validationError = require('../middleware/validationError');
const { loanTransferStep1,loanTransferStep2,loanTransferStep3,loanTransferStep4 } = require('../validations/customerLoanTransfer');
const checkAuth = require('../middleware/checkAuth'); 

route.get('/single-loan', checkAuth, wrapper(getSingleLoanDetails)); 

route.get('/:customerUniqueId', checkAuth, wrapper(customerDetails));

route.post('/basic-details', checkAuth,loanTransferStep1,validationError, wrapper(loanTransferBasicDeatils)); 

route.post('/documents',checkAuth,loanTransferStep2,validationError,wrapper(loanTransferDocuments)); 

route.post('/bm-rating',checkAuth,loanTransferStep3,validationError,wrapper(loanTransferBmRating)); 

route.post('/disbursal',checkAuth, loanTransferStep4,validationError,wrapper(loanTransferDisbursal));


module.exports = route; 