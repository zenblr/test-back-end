// LOAD REQUIRED PACKGES
const express = require('express');
const route = express.Router();
const { wrapper } = require('../../utils/errorWrap'); // IMPORTING ERROR WRAPPER FUNCTION
const { customerDetails, scrapBasicDeatils, acknowledgementDetails, scrapBankDetails, scrapOrnmanetDetails, scrapAppraiserRating, scrapBmRating, scrapOpsTeamRating, singleScrapDetails, scrapDocuments, addPackageImagesForScrap, scrapOrnmanetMeltingDetails, disbursementOfScrapBankDetails, disbursementOfScrapAmount, appliedScrapDetails, getScrapDetails, quickPay, printCustomerAcknowledgement, printPurchaseVoucher, getScrapStatus } =
  require('../../controllers/scrap/customerScrapProcess/customerScrapProcess'); // IMPORTING SCRAP PROCESS FUNCTIONS
const checkRolePermission = require('../../middleware/checkRolesPermissions');


const checkAuth = require('../../middleware/checkAuth'); // IMPORTING CHECKAUTH MIDDLEWARE

route.get('/single-scrap', checkAuth, wrapper(singleScrapDetails)); // ADD OPERATIONAL TEAM RATING

route.get('/customer-scrap-details/:customerUniqueId', checkAuth, wrapper(customerDetails)); // FETCH CUSTOMER DETAILS

route.get('/disbursement-bank-detail', checkAuth, wrapper(disbursementOfScrapBankDetails)); // FETCH DISBURSEMENT OF SCRAP BANK DETAILS

route.post('/basic-details', checkAuth, wrapper(scrapBasicDeatils)); // ADD CUSTOMER BASIC DETAIL

route.post('/acknowledgement-details', checkAuth, wrapper(acknowledgementDetails)); // ADD CUSTOMER ACKNOWLEDGEMENT DETAIL

route.post('/bank-details', checkAuth, wrapper(scrapBankDetails)); // ADD CUSTOMER ACKNOWLEDGEMENT DETAIL

route.post('/ornaments-details', checkAuth, wrapper(scrapOrnmanetDetails)); // ADD CUSTOMER ORNAMENT DETAIL

route.post('/ornaments-melting-details', checkAuth, wrapper(scrapOrnmanetMeltingDetails)); // ADD CUSTOMER ORNAMENT DETAIL

route.post('/scrap-documents', checkAuth, wrapper(scrapDocuments))// ADD scrap documents

route.post('/add-packet-images', checkAuth, wrapper(addPackageImagesForScrap)); // ADD PACKAGE IMAGES

route.post('/appraiser-rating', checkAuth, wrapper(scrapAppraiserRating)); // ADD APPRAISER RATING DETAIL

route.post('/bm-rating', checkAuth, wrapper(scrapBmRating)); // ADD BM RATING DETAIL

route.post('/ops-rating', checkAuth, wrapper(scrapOpsTeamRating)); // ADD OPERATIONAL TEAM RATING

route.post('/scrap-disbursement', checkAuth, wrapper(disbursementOfScrapAmount)); // DISBURSEMENT OF SCRAP AMOUNT

route.get('/applied-scrap-details', checkAuth, wrapper(appliedScrapDetails)); // FETCH APLLIED SCRAP DETAILS

route.get('/scrap-details', checkAuth, wrapper(getScrapDetails)); // FETCH APLLIED SCRAP DETAILS

route.post('/quick-pay', checkAuth, wrapper(quickPay)); // DISBURSEMENT OF SCRAP AMOUNT

route.get('/get-customer-acknowledgement', checkAuth, wrapper(printCustomerAcknowledgement)); //Print details

route.get('/get-purchase-voucher', checkAuth, wrapper(printPurchaseVoucher)); //Print details

route.get('/get-scrap-status', checkAuth, wrapper(getScrapStatus)); // // To get all scrap ststus

module.exports = route; // EXPORTING ALL ROUTES
