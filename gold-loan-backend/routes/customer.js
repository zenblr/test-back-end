var express = require('express');
var router = express.Router();

const { wrapper } = require('../utils/errorWrap')

const { addCustomer, editCustomer, deactivateCustomer, getAllCustomers, getSingleCustomer , registerCustomerSendOtp } = require('../controllers/customer/customer')
const checkAuth = require('../middleware/checkAuth');



router.post('/', checkAuth, wrapper(addCustomer));

router.post('/send-register-otp',registerCustomerSendOtp)

router.put('/', checkAuth, wrapper(editCustomer))

router.delete('/', checkAuth, wrapper(deactivateCustomer));

router.get('/', checkAuth, wrapper(getAllCustomers));

router.get('/:customerId', checkAuth, wrapper(getSingleCustomer))

module.exports = router;