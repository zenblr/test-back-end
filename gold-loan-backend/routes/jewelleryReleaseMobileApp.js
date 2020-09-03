const express = require('express');
const { ornamentsDetails, ornamentsAmountDetails,ornamentsPartRelease,getCustomerDetails,ornamentsFullRelease} = require('../controllers/jewelleryRelease/jewelleryRelease');
const route = express.Router();
const { partReleasePayment,fullReleasePayment } = require('../validations/jewelleryRelease');
const validatiError = require('../middleware/validationError');
const { wrapper } = require('../utils/errorWrap');
const customerCheckAuth = require('../middleware/customerCheckAuth');



route.get('/:customerId', customerCheckAuth, wrapper(getCustomerDetails)); 

route.get('/:masterLoanId', customerCheckAuth, wrapper(ornamentsDetails)); 

route.post('/', customerCheckAuth, wrapper(ornamentsAmountDetails)); 

route.post('/part-release', customerCheckAuth,partReleasePayment,validatiError, wrapper(ornamentsPartRelease)); 

route.post('/full-release', customerCheckAuth,fullReleasePayment,validatiError, wrapper(ornamentsFullRelease)); 


module.exports = route;