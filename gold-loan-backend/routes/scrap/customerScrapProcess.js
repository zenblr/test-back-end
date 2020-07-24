// LOAD REQUIRED PACKGES
const express = require('express');
const route = express.Router();
const { wrapper } = require('../../utils/errorWrap'); // IMPORTING ERROR WRAPPER FUNCTION
const { customerDetails, scrapBasicDeatils, acknowledgementDetails, scrapBankDetails, scrapOrnmanetDetails, scrapAppraiserRating} =
  require('../../controllers/scrap/customerScrapProcess/customerScrapProcess'); // IMPORTING LOAN PROCESS FUNCTIONS

const checkAuth = require('../../middleware/checkAuth'); // IMPORTING CHECKAUTH MIDDLEWARE

route.get('/customer-scrap-details/:customerUniqueId', checkAuth, wrapper(customerDetails)); // FETCH CUSTOMER DETAILS

route.post('/basic-details', checkAuth, wrapper(scrapBasicDeatils)); // ADD CUSTOMER BASIC DETAIL

route.post('/acknowledgement-details', checkAuth, wrapper(acknowledgementDetails)); // ADD CUSTOMER ACKNOWLEDGEMENT DETAIL

route.post('/bank-details', checkAuth, wrapper(scrapBankDetails)); // ADD CUSTOMER ACKNOWLEDGEMENT DETAIL

route.post('/ornaments-details', checkAuth, wrapper(scrapOrnmanetDetails)); // ADD CUSTOMER ORNAMENT DETAIL

route.post('/appraiser-rating', checkAuth, wrapper(scrapAppraiserRating)); // ADD CUSTOMER BANK DETAIL

module.exports = route; // EXPORTING ALL ROUTES
