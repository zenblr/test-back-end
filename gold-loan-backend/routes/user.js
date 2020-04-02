const express = require('express');
const route = express.Router();

const { wrapper } = require('../utils/errorWrap');


const { registerSendOtp, verifyRegistrationOtp, resendOtp } = require('../controllers/user/user')

//Register User

route.post('/register-otp', wrapper(registerSendOtp));

route.post('/verify-otp', wrapper(verifyRegistrationOtp));

route.post('/resend-otp', wrapper(resendOtp));



module.exports = route;