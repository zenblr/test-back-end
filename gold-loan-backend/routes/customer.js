var express = require('express');
var router = express.Router();

const { wrapper } = require('../utils/errorWrap')
const validationError = require('../middleware/validationError');
const { customerValidation, customerUpdateValidation } = require('../validations/customer');

const { getOtp, addCustomer, editCustomer, deactivateCustomer, getAllCustomersForLead, getSingleCustomer, registerCustomerSendOtp, verifyOtp, sendOtp, getCustomerUniqueId, getAllCustomerForCustomerManagement, getsingleCustomerManagement } = require('../controllers/customer/customer')
const checkAuth = require('../middleware/checkAuth');
const checkRolePermission = require('../middleware/checkRolesPermissions');

const customerCheckAuth = require('../middleware/customerCheckAuth')

const { readBanner, readOffer, readLenderBanner, readGoldRate, readPersonalDetailsOfCustomer, readBankDetailsOfCustomer, readNomineeDetailsOfCustomer, readAddressDetailsOfCustomer,
    readPanCardImageOfCustomer, readAddressImageOfCustomer, readPartnerBranch, readAllScheme, readMyLoan
    , schemeBasedOnPriceRange, readLoanDetails,
    readFeedBack, addFeedBack } = require('../controllers/customer/customerApp')

//customer
router.get('/get-otp', checkAuth, wrapper(getOtp))

router.post('/', customerValidation, validationError, checkAuth, checkRolePermission, wrapper(addCustomer));

router.post('/send-register-otp', checkAuth, registerCustomerSendOtp);

router.post('/send-otp', sendOtp);

router.post('/verify-otp', checkAuth, verifyOtp);

router.put('/:customerId', validationError, checkAuth, checkRolePermission, wrapper(editCustomer))

router.delete('/', checkAuth, checkRolePermission, wrapper(deactivateCustomer));

router.get('/', checkAuth, checkRolePermission, wrapper(getAllCustomersForLead));

router.get('/customer-management', checkAuth, checkRolePermission, wrapper(getAllCustomerForCustomerManagement));

router.get('/customer-management/:customerId', checkAuth, checkRolePermission, wrapper(getsingleCustomerManagement));

router.get('/customer-unique', checkAuth, wrapper(getCustomerUniqueId));

//customer App

router.get('/banner', customerCheckAuth, wrapper(readBanner)); // read banner

router.get('/offer', customerCheckAuth, wrapper(readOffer)); // read order

router.get('/lender-banner', customerCheckAuth, wrapper(readLenderBanner)); // read lender banner

router.get('/gold-rate', customerCheckAuth, wrapper(readGoldRate));// read gold rate

router.get('/personal-detail', customerCheckAuth, wrapper(readPersonalDetailsOfCustomer)); //read personal details

router.get('/bank-detail', customerCheckAuth, wrapper(readBankDetailsOfCustomer)); // read bank details

router.get('/nominee-detail', customerCheckAuth, wrapper(readNomineeDetailsOfCustomer));// read nominee details

router.get('/address-detail', customerCheckAuth, wrapper(readAddressDetailsOfCustomer));// read address details

router.get('/address-proof-image-detail', customerCheckAuth, wrapper(readAddressImageOfCustomer)); // read address proof

router.get('/pan-card-image-detail', customerCheckAuth, wrapper(readPanCardImageOfCustomer));// read identity proof or pan card

router.get('/partner-branch/:id', customerCheckAuth, wrapper(readPartnerBranch));// read partner branch by city id(contact us screen)

router.get('/get-all-scheme', customerCheckAuth, wrapper(readAllScheme));// read   all schemes details

router.get('/my-loan', customerCheckAuth, wrapper(readMyLoan));//read my loan 

router.get('/scheme-based-on-price', customerCheckAuth, wrapper(schemeBasedOnPriceRange)); // read scheme based on price

router.get('/loan-detail', customerCheckAuth, wrapper(readLoanDetails));// read loan details

router.get('/customer-feedback', customerCheckAuth, wrapper(readFeedBack)); // read customer feed back

router.post('/customer-feedback', customerCheckAuth, wrapper(addFeedBack)); // add customer feedback

//customer App

router.get('/:customerId', checkAuth, checkRolePermission, wrapper(getSingleCustomer));




module.exports = router;