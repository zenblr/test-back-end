var express = require('express');
var router = express.Router();

const { wrapper } = require('../utils/errorWrap')
const validationError = require('../middleware/validationError');
const { customerValidation, customerUpdateValidation } = require('../validations/customer');

const { getOtp, addCustomer, editCustomer, deactivateCustomer, getAllCustomersForLead, getSingleCustomer, registerCustomerSendOtp, verifyOtp, sendOtp, getCustomerUniqueId, getAllCustomerForCustomerManagement, getsingleCustomerManagement } = require('../controllers/customer/customer')
const checkAuth = require('../middleware/checkAuth');
const checkRolePermission = require('../middleware/checkRolesPermissions');

const customerCheckAuth = require('../middleware/customerCheckAuth');
const customerApp = require('./customerApp');  //upload Packets List 

const { readBanner, readOffer, readLenderBanner, readGoldRate, readPersonalDetailsOfCustomer, readBankDetailsOfCustomer, readNomineeDetailsOfCustomer, readAddressDetailsOfCustomer,
    readPanCardImageOfCustomer, readAddressImageOfCustomer, readPartnerBranch, readAllScheme, readMyLoan
    , schemeBasedOnPriceRange, readLoanDetails,
    readFeedBack, addFeedBack } = require('../controllers/customer/customerApp')

//customer
router.get('/get-otp', checkAuth, wrapper(getOtp))

router.post('/', customerValidation, validationError, checkAuth, checkRolePermission, wrapper(addCustomer));

router.post('/send-register-otp', checkAuth, registerCustomerSendOtp);

router.post('/send-otp', sendOtp);

router.post('/verify-otp', verifyOtp);

router.put('/:customerId', validationError, checkAuth, checkRolePermission, wrapper(editCustomer))

router.delete('/', checkAuth, checkRolePermission, wrapper(deactivateCustomer));

router.get('/', checkAuth, checkRolePermission, wrapper(getAllCustomersForLead));

router.get('/customer-management', checkAuth, checkRolePermission, wrapper(getAllCustomerForCustomerManagement));

router.get('/customer-management/:customerId', checkAuth, checkRolePermission, wrapper(getsingleCustomerManagement));

router.get('/customer-unique', checkAuth, wrapper(getCustomerUniqueId));

router.get('/:customerId', checkAuth, checkRolePermission, wrapper(getSingleCustomer));

router.use('/app', customerApp)


module.exports = router;