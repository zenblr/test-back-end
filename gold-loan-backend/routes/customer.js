var express = require('express');
var router = express.Router();

const { wrapper } = require('../utils/errorWrap')
const validationError = require('../middleware/validationError');
const { customerValidation, customerUpdateValidation, registerCustomerValidation } = require('../validations/customer');

const { getOtp, signUpCustomer, addCustomer, editCustomer, deactivateCustomer, getAllCustomersForLead, getSingleCustomer, registerCustomerSendOtp, verifyOtp, sendOtp, getCustomerUniqueId, addBranch, getAllCustomerForCustomerManagement, getsingleCustomerManagement, getAllRegisteredCustomer, customerSignUp } = require('../controllers/customer/customer')
const checkAuth = require('../middleware/checkAuth');
const checkRolePermission = require('../middleware/checkRolesPermissions');

const customerCheckAuth = require('../middleware/customerCheckAuth');
const customerApp = require('./customerApp');  //upload Packets List 

const { readBanner, readOffer, readLenderBanner, readGoldRate, readPersonalDetailsOfCustomer, readBankDetailsOfCustomer, readNomineeDetailsOfCustomer, readAddressDetailsOfCustomer,
    readPanCardImageOfCustomer, readAddressImageOfCustomer, readPartnerBranch, readAllScheme, readMyLoan
    , schemeBasedOnPriceRange, readLoanDetails,
    readFeedBack, addFeedBack } = require('../controllers/customer/customerApp')

//customer
router.get('/get-otp', checkAuth, wrapper(getOtp));

router.post('/sign-up', registerCustomerValidation, validationError, wrapper(signUpCustomer)); //Register customer from customer website

router.post('/', customerValidation, validationError, checkAuth, checkRolePermission, wrapper(addCustomer));

router.post('/send-register-otp', checkAuth, registerCustomerSendOtp);

router.post('/customer-sign-up', wrapper(customerSignUp))

router.post('/send-otp', sendOtp);

router.post('/verify-otp', verifyOtp);

router.put('/:customerId', customerUpdateValidation, validationError, checkAuth, checkRolePermission, wrapper(editCustomer))

router.post('/add-branch', checkAuth, wrapper(addBranch))

router.delete('/', checkAuth, checkRolePermission, wrapper(deactivateCustomer));

router.get('/registered-customer', checkAuth, wrapper(getAllRegisteredCustomer));//To get customers registered by their own

router.get('/', checkAuth, checkRolePermission, wrapper(getAllCustomersForLead));

router.get('/customer-management', checkAuth, checkRolePermission, wrapper(getAllCustomerForCustomerManagement));

router.get('/customer-management/:customerId', checkAuth, checkRolePermission, wrapper(getsingleCustomerManagement));

router.get('/customer-unique', checkAuth, wrapper(getCustomerUniqueId));

router.get('/:customerId', checkAuth, checkRolePermission, wrapper(getSingleCustomer));

router.use('/app', customerApp)


module.exports = router;