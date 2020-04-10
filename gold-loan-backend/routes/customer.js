var express = require('express');
var router = express.Router();

const { wrapper } = require('../utils/errorWrap')
const validationError=require('../middleware/validationError');
const {customerValidation}=require('../validations/customer');

const { addCustomer, editCustomer, deactivateCustomer, getAllCustomers, getSingleCustomer , registerCustomerSendOtp,verifiedRegisterOtp } = require('../controllers/customer/customer')
const checkAuth = require('../middleware/checkAuth');



router.post('/',customerValidation,validationError, checkAuth, wrapper(addCustomer));

router.post('/send-register-otp',checkAuth,registerCustomerSendOtp);

router.post('/verified-register-otp',checkAuth,verifiedRegisterOtp);

router.put('/', checkAuth, wrapper(editCustomer))

router.delete('/', checkAuth, wrapper(deactivateCustomer));

router.get('/', checkAuth, wrapper(getAllCustomers));

router.get('/:customerId', checkAuth, wrapper(getSingleCustomer))

module.exports = router;