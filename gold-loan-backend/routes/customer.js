var express = require('express');
var router = express.Router();

const { wrapper } = require('../utils/errorWrap')

const { addCustomer, editCustomer, deactivateCustomer, getAllCustomers, getSingleCustomer } = require('../controllers/customer/customer')

router.post('/add-customer', addCustomer);

router.put('/edit-customer', editCustomer)

router.delete('/deactivate-customer', deactivateCustomer);

router.get('/get-all-customers', getAllCustomers);

router.get('/get-single-customer', getSingleCustomer)

module.exports = router;