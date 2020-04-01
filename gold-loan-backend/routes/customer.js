var express = require('express');
var router = express.Router();

const { wrapper } = require('../utils/errorWrap')

const { addCustomer, editCustomer, deactivateCustomer, getAllCustomers, getSingleCustomer } = require('../controllers/customer/customer')
const checkAuth = require('../middleware/checkAuth');


router.post('/add-customer', checkAuth, addCustomer);

router.put('/edit-customer', checkAuth, editCustomer)

router.delete('/deactivate-customer', checkAuth, deactivateCustomer);

router.get('/get-all-customers', checkAuth, getAllCustomers);

router.get('/get-single-customer', checkAuth, getSingleCustomer)

module.exports = router;