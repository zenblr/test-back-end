const express = require('express');
const route = express.Router();
const { wrapper } = require('../utils/errorWrap'); 
const { loanTransferBasicDeatils,customerDetails,loanTransferDocuments,loanTransferBmRating,loanTransferDisbursal,getSingleLoanDetails,getLoanTransferList,customerDetailsLoanTransfer } =require('../controllers/customerLoanTransfer/customerLoanTransfer'); // IMPORTING LOAN PROCESS FUNCTIONS
const validationError = require('../middleware/validationError');
const { loanTransferStep1,loanTransferStep2,loanTransferStep3,loanTransferStep4 } = require('../validations/customerLoanTransfer');
const checkAuth = require('../middleware/checkAuth'); 
const checkRolePermission = require('../middleware/checkRolesPermissions');

route.get('/single-loan', checkAuth,checkRolePermission, wrapper(getSingleLoanDetails)); 

route.get('/apply-loan/:customerUniqueId', checkAuth, wrapper(customerDetailsLoanTransfer));

route.get('/:customerUniqueId', checkAuth,checkRolePermission, wrapper(customerDetails));

route.get('/', checkAuth,checkRolePermission, wrapper(getLoanTransferList)); 

route.post('/basic-details', checkAuth,checkRolePermission,loanTransferStep1,validationError, wrapper(loanTransferBasicDeatils)); 

route.post('/documents',checkAuth,checkRolePermission,loanTransferStep2,validationError,wrapper(loanTransferDocuments)); 

route.post('/bm-rating',checkAuth,checkRolePermission,loanTransferStep3,validationError,wrapper(loanTransferBmRating)); 

route.post('/disbursal',checkAuth,checkRolePermission, loanTransferStep4,validationError,wrapper(loanTransferDisbursal));


module.exports = route; 