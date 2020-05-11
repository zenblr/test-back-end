var express = require('express');
var router = express.Router();

const { wrapper } = require('../utils/errorWrap')
const validationError = require('../middleware/validationError');
const { customerValidation, customerUpdateValidation } = require('../validations/customer');

const { addCustomer, editCustomer, deactivateCustomer, getAllCustomers, getSingleCustomer, registerCustomerSendOtp, verifyOtp, sendOtp, filterCustomer } = require('../controllers/customer/customer')
const checkAuth = require('../middleware/checkAuth');

const { readBanner, readOffer, readLenderBanner } = require('../controllers/customer/customerApp')

//customer
router.post('/', customerValidation, validationError, checkAuth, wrapper(addCustomer));

router.post('/send-register-otp', checkAuth, registerCustomerSendOtp);

router.post('/send-otp', sendOtp);

router.post('/verify-otp', checkAuth, verifyOtp);

router.put('/:customerId', customerUpdateValidation, validationError, checkAuth, wrapper(editCustomer))

router.delete('/', checkAuth, wrapper(deactivateCustomer));

router.get('/', checkAuth, wrapper(getAllCustomers));

router.get('/filter-customer', checkAuth, wrapper(filterCustomer));


//customer App
router.get('/banner', checkAuth, wrapper(readBanner));

router.get('/offer', checkAuth, wrapper(readOffer));

router.get('/lender-banner', checkAuth, wrapper(readLenderBanner));
//customer App


router.get('/:customerId', checkAuth, wrapper(getSingleCustomer));




module.exports = router;