const express = require('express');
const route = express.Router();

const { wrapper } = require('../utils/errorWrap');

const checkAuth = require('../middleware/checkAuth')

const { userValidation } = require('../validations/user');
const validationError = require('../middleware/validationError')

const { addUser, registerSendOtp, verifyRegistrationOtp, sendOtp, changePassword, updatePassword, getUser,getInternalBranchUser, verifyOtp, addAdmin } = require('../controllers/user/user')

//Register User

// route.post('/register-otp',userValidation,validationError, wrapper(registerSendOtp));
route.post('/',checkAuth, wrapper(addUser))

route.post('/register-otp', wrapper(registerSendOtp));

route.post('/verify-register-otp', wrapper(verifyRegistrationOtp));

route.post('/send-otp', wrapper(sendOtp));

route.post('/verify-otp', verifyOtp)

route.post('/update-password', wrapper(updatePassword));

route.post('/change-password', checkAuth, wrapper(changePassword));

route.get('/', getUser);

route.get('/internal-branch-user',checkAuth,wrapper(getInternalBranchUser))

route.post('/addadmin', wrapper(addAdmin))









module.exports = route;