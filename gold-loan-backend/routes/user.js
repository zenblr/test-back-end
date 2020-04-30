const express = require('express');
const route = express.Router();

const { wrapper } = require('../utils/errorWrap');

const checkAuth = require('../middleware/checkAuth')

const { userValidation,addInternalUser } = require('../validations/user');
const validationError = require('../middleware/validationError')

const { addUser, registerSendOtp,addInternalUser,updateInternalUser, verifyRegistrationOtp, sendOtp, changePassword, updatePassword, getUser, verifyOtp, addAdmin } = require('../controllers/user/user')

//Register User

// route.post('/register-otp',userValidation,validationError, wrapper(registerSendOtp));
route.post('/',checkAuth, wrapper(addUser))

route.post('/register-otp', wrapper(registerSendOtp));

route.post('/verify-register-otp', wrapper(verifyRegistrationOtp));

route.post('/send-otp', wrapper(sendOtp));

route.post('/verify-otp', verifyOtp)

route.post('/update-password', wrapper(updatePassword));

route.post('/change-password', checkAuth, wrapper(changePassword));

route.post('/internal-user', checkAuth,addInternalUser,validationError, wrapper(addInternalUser));

route.put('/internal-user/:id', checkAuth,addInternalUser,validationError, wrapper(updateInternalUser));

route.get('/', getUser);

route.post('/addadmin', wrapper(addAdmin))









module.exports = route;