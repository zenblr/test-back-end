// LOAD REQUIRED PACKGES
const express = require('express');
const route = express.Router();
const { wrapper } = require('../utils/errorWrap'); // IMPORTING ERROR WRAPPER FUNCTION
const { loanDateChange, addPackageImagesForLoan, disbursementOfLoanAmount, interestRate, generateInterestTable, unsecuredTableGeneration,
  disbursementOfLoanBankDetails, getLoanDetails, getSingleLoanDetails, appliedLoanDetails, customerDetails, loanBmRating, loanOpsTeamRating, checkForLoanType,
  loanBasicDeatils, loanNomineeDetails, loanOrnmanetDetails, loanDocuments, loanFinalLoan, loanBankDetails, loanAppraiserRating, getSingleLoanInCustomerManagment, getDetailsForPrint, getLoanOrnaments, getUnsecuredScheme, getCustomerBankDetails, getBankInfo, termsConditions, getCustomerBankDetailsByCustomerId } =
  require('../controllers/customerLoanProcess/customerLoanProcess'); // IMPORTING LOAN PROCESS FUNCTIONS
const checkRolePermission = require('../middleware/checkRolesPermissions');


const { loanRequest, getLoanDetailsForPrint } = require('../controllers/customerLoanProcess/customerLoanProcessForApp')

const checkAuth = require('../middleware/checkAuth'); // IMPORTING CHECK AUTH MIDDLEWARE

route.post('/loan-date-change', checkAuth, wrapper(loanDateChange))

route.post('/basic-details', checkAuth, wrapper(loanBasicDeatils)); // ADD CUSTOMER BANK DETAIL

route.post('/nominee-details', checkAuth, wrapper(loanNomineeDetails)); // ADD CUSTOMER BANK DETAIL

route.post('/ornaments-details', checkAuth, wrapper(loanOrnmanetDetails)); // ADD CUSTOMER BANK DETAIL

route.post('/check-loan-type', checkAuth, wrapper(checkForLoanType)) // amount validation and check for loan type

route.post('/interest-rate', checkAuth, wrapper(interestRate)) // return interest for secure and unsecure

route.post('/generate-interest-table', checkAuth, wrapper(generateInterestTable)) //main table generation

route.post('/generate-unsecured-interest-table', checkAuth, wrapper(unsecuredTableGeneration)) // unsecured interestTable 

route.post('/final-loan-details', checkAuth, wrapper(loanFinalLoan)); // ADD CUSTOMER BANK DETAIL

route.post('/bank-details', checkAuth, wrapper(loanBankDetails)); // ADD CUSTOMER BANK DETAIL

route.post('/appraiser-rating', checkAuth,checkRolePermission, wrapper(loanAppraiserRating)); // ADD CUSTOMER BANK DETAIL

route.post('/bm-rating', checkAuth, checkRolePermission,wrapper(loanBmRating)); // ADD CUSTOMER BANK DETAIL

route.post('/ops-rating', checkAuth,checkRolePermission, wrapper(loanOpsTeamRating)); // ADD CUSTOMER BANK DETAIL

route.get('/single-loan', checkAuth, wrapper(getSingleLoanDetails)); // ADD CUSTOMER BANK DETAIL

route.get('/single-loan-customer', checkAuth, wrapper(getSingleLoanInCustomerManagment))//customer-managment single loan

route.get('/bank-details', checkAuth, wrapper(getCustomerBankDetails));  //get customer bank details

route.get('/customer-bank-details', checkAuth, wrapper(getCustomerBankDetailsByCustomerId));  //get customer bank details

route.post('/add-packet-images', checkAuth, wrapper(addPackageImagesForLoan)); // ADD PACKAGE IMAGES

route.post('/disbursement-of-loan', checkAuth, checkRolePermission, wrapper(disbursementOfLoanAmount)); // DISBURSEMENT OF LOAN AMOUNT

route.get('/disbursement-loan-bank-detail', checkAuth, wrapper(disbursementOfLoanBankDetails)); // DISBURSEMENT OF LOAN BANK DETAIL

route.get('/loan-details', checkAuth, checkRolePermission, wrapper(getLoanDetails)); // FETCH LOAN DETAILS

route.get('/applied-loan-details', checkAuth, checkRolePermission, wrapper(appliedLoanDetails)); // FETCH APLLIED LOAN DETAILS

route.get('/customer-loan-details/:customerUniqueId', checkAuth, wrapper(customerDetails)); // FETCH CUSTOMER DETAILS

route.post('/loan-documents', checkAuth, wrapper(loanDocuments))// ADD loan documents

route.get('/get-print-details', checkAuth, wrapper(getDetailsForPrint)); //Print details

route.get('/get-loan-ornamets', checkAuth, wrapper(getLoanOrnaments)) //GET LOAN ORNAMENTS

route.get('/unsecured-scheme', checkAuth, wrapper(getUnsecuredScheme)) //GET unsecured Scheme

route.get('/download-bank-details', checkAuth, wrapper(getBankInfo)) // DOWNLOAD BANK DETAILS IN DISBURSMENT PAGE

route.post('/terms-conditions', checkAuth, wrapper(termsConditions))

// appraiseApp 
route.post('/loan-request', checkAuth, wrapper(loanRequest)); //apply loan for backoffice app

route.get('/get-loanDetails', checkAuth, wrapper(getLoanDetailsForPrint)); //Print details

module.exports = route; // EXPORTING ALL ROUTES