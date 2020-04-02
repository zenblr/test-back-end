var express = require('express');
var router = express.Router();

const { userLogin } = require('../controllers/auth/userAuthController');
const { wrapper } = require('../utils/errorWrap');

const { customerLogin } = require('../controllers/auth/customerAuthController');


//User Login
router.post('/user-login', wrapper(userLogin));


//Customer Login
router.post('/customer-login', wrapper(customerLogin));

module.exports = router;