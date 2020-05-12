var express = require('express');
var router = express.Router();

const { wrapper } = require('../utils/errorWrap')
const validationError = require('../middleware/validationError');
const { customerValidation, customerUpdateValidation } = require('../validations/customer');

const { addCustomer, editCustomer, deactivateCustomer, getAllCustomers, getSingleCustomer, registerCustomerSendOtp, verifyOtp, sendOtp, filterCustomer } = require('../controllers/customer/customer')
const checkAuth = require('../middleware/checkAuth');

const customerCheckAuth = require('../middleware/customerCheckAuth')

const { readBanner, readOffer, readLenderBanner,readGoldRate,readPersonalDetailsOfCustomer,readBankDetailsOfCustomer,readNomineeDetailsOfCustomer,readAddressDetailsOfCustomer,readPanCardImageOfCustomer,readAddressImageOfCustomer } = require('../controllers/customer/customerApp')

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
router.get('/banner', customerCheckAuth, wrapper(readBanner));

router.get('/offer', customerCheckAuth, wrapper(readOffer));

router.get('/lender-banner', customerCheckAuth, wrapper(readLenderBanner));
//customer App

router.get('/gold-rate',customerCheckAuth,wrapper(readGoldRate));
router.get('/personal-detail',customerCheckAuth,wrapper(readPersonalDetailsOfCustomer));
router.get('/bank-detail',customerCheckAuth,wrapper(readBankDetailsOfCustomer));
router.get('/nominee-detail',customerCheckAuth,wrapper(readNomineeDetailsOfCustomer));
router.get('/address-detail',customerCheckAuth,wrapper(readAddressDetailsOfCustomer));
router.get('/address-proof-image-detail',customerCheckAuth,wrapper(readAddressImageOfCustomer));
router.get('/pan-card-image-detail',customerCheckAuth,wrapper(readPanCardImageOfCustomer));

router.get('/:customerId', checkAuth, wrapper(getSingleCustomer));




module.exports = router;