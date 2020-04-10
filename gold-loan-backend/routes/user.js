const express = require('express');
const route = express.Router();

const { wrapper } = require('../utils/errorWrap');

const checkAuth = require('../middleware/checkAuth')

const {userValidation}=require('../validations/user');
const validationError=require('../middleware/validationError')

const { registerSendOtp, verifyRegistrationOtp, sendOtp,changePassword,updatePassword,getUser } = require('../controllers/user/user')

//Register User

route.post('/register-otp',userValidation,validationError, wrapper(registerSendOtp));

route.post('/verify-otp', wrapper(verifyRegistrationOtp));

route.post('/send-otp', wrapper(sendOtp));

route.post('/update-password', wrapper(updatePassword));

route.post('/change-password',checkAuth, wrapper(changePassword));
route.get('/',getUser);









module.exports = route;