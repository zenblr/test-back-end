var express = require('express');
var router = express.Router();

const { wrapper } = require('../utils/errorWrap')

const { addCustomer, deactivateCustomer, getAllCustomers, getSingleCustomer } = require('../controllers/customer/customer')

router.post('/add-customer', addCustomer);

router.delete('/deactivate-customer', deactivateCustomer);

router.get('/get-all-customers', getAllCustomers);

router.get('/get-single-customer', getSingleCustomer)

module.exports = router;