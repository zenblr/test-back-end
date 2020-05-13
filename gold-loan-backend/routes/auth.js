var express = require('express');
var router = express.Router();

const { userLogin, verifyLoginOtp, logout } = require('../controllers/auth/userAuthController');
const { wrapper } = require('../utils/errorWrap');
const { authValidation,loginWithOtpValidation,customerLoginValidation } = require('../validations/auth');
const validationError = require('../middleware/validationError');
const { customerLogin } = require('../controllers/auth/customerAuthController');


//User Login
router.post('/user-login', authValidation, validationError, wrapper(userLogin));

router.post('/logout', wrapper(logout));

router.post('/verify-login', loginWithOtpValidation,validationError,wrapper(verifyLoginOtp))


//Customer Login
router.post('/customer-login', customerLoginValidation, validationError, wrapper(customerLogin));

module.exports = router;