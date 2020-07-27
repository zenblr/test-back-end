// LOAD REQUIRED PACKGES
const express = require('express');
const route = express.Router();
const { wrapper } = require('../utils/errorWrap'); // IMPORTING ERROR WRAPPER FUNCTION
const { addPackageImagesForLoan, disbursementOfLoanAmount,
  disbursementOfLoanBankDetails, getLoanDetails, getSingleLoanDetails, appliedLoanDetails, customerDetails, loanBmRating, loanOpsTeamRating,checkForLoanType,
  loanBasicDeatils, loanNomineeDetails, loanOrnmanetDetails, loanDocuments, loanFinalLoan, loanBankDetails, loanAppraiserRating, getAssignAppraiserCustomer, getSingleLoanInCustomerManagment, getDetailsForPrint } =
  require('../controllers/customerLoanProcess/customerLoanProcess'); // IMPORTING LOAN PROCESS FUNCTIONS

const checkAuth = require('../middleware/checkAuth'); // IMPORTING CHECK AUTH MIDDLEWARE

route.post('/basic-details', checkAuth, wrapper(loanBasicDeatils)); // ADD CUSTOMER BANK DETAIL

route.post('/nominee-details', checkAuth, wrapper(loanNomineeDetails)); // ADD CUSTOMER BANK DETAIL

route.post('/ornaments-details', checkAuth, wrapper(loanOrnmanetDetails)); // ADD CUSTOMER BANK DETAIL

route.post('/check-loan-type',checkAuth,wrapper(checkForLoanType)) // amount validation and check for loan type

route.post('/final-loan-details', checkAuth, wrapper(loanFinalLoan)); // ADD CUSTOMER BANK DETAIL

route.post('/bank-details', checkAuth, wrapper(loanBankDetails)); // ADD CUSTOMER BANK DETAIL

route.post('/appraiser-rating', checkAuth, wrapper(loanAppraiserRating)); // ADD CUSTOMER BANK DETAIL

route.post('/bm-rating', checkAuth, wrapper(loanBmRating)); // ADD CUSTOMER BANK DETAIL

route.post('/ops-rating', checkAuth, wrapper(loanOpsTeamRating)); // ADD CUSTOMER BANK DETAIL

route.get('/single-loan', checkAuth, wrapper(getSingleLoanDetails)); // ADD CUSTOMER BANK DETAIL

route.get('/single-loan-customer', checkAuth, wrapper(getSingleLoanInCustomerManagment))//customer-managment single loan

route.post('/add-packet-images', checkAuth, wrapper(addPackageImagesForLoan)); // ADD PACKAGE IMAGES

route.post('/disbursement-of-loan', checkAuth, wrapper(disbursementOfLoanAmount)); // DISBURSEMENT OF LOAN AMOUNT

route.get('/disbursement-loan-bank-detail', checkAuth, wrapper(disbursementOfLoanBankDetails)); // DISBURSEMENT OF LOAN BANK DETAIL

route.get('/loan-details', checkAuth, wrapper(getLoanDetails)); // FETCH LOAN DETAILS

route.get('/applied-loan-details', checkAuth, wrapper(appliedLoanDetails)); // FETCH APLLIED LOAN DETAILS

route.get('/customer-loan-details/:customerUniqueId', checkAuth, wrapper(customerDetails)); // FETCH CUSTOMER DETAILS

route.get('/assign-appraiser-customer', checkAuth, wrapper(getAssignAppraiserCustomer)) //get customer of appraiser

route.post('/loan-documents', checkAuth, wrapper(loanDocuments))// ADD loan documents

route.get('/get-print-details', checkAuth, wrapper(getDetailsForPrint)); //Print details

module.exports = route; // EXPORTING ALL ROUTES