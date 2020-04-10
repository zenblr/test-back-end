var express = require('express');
var router = express.Router();

const { userLogin } = require('../controllers/auth/userAuthController');
const { wrapper } = require('../utils/errorWrap');
const{authValidation}=require('../validations/auth');
const validationError=require('../middleware/validationError');
const { customerLogin } = require('../controllers/auth/customerAuthController');


//User Login
router.post('/user-login', authValidation,validationError,wrapper(userLogin));


//Customer Login
router.post('/customer-login',authValidation,validationError, wrapper(customerLogin));

module.exports = router;