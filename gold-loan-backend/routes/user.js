const express = require('express');
const route = express.Router();

const { wrapper } = require('../utils/errorWrap');

const checkAuth = require('../middleware/checkAuth')

const { userValidation, addInternalUserValidation, UpdateInternalUserValidation } = require('../validations/user');
const validationError = require('../middleware/validationError')

const { addUser, registerSendOtp, addInternalUser, updateInternalUser, deleteInternalUser, GetInternalUser, verifyRegistrationOtp, sendOtp, changePassword, updatePassword, getUser, verifyOtp, addAdmin, getInternalBranchUser } = require('../controllers/user/user')

//Register User

// route.post('/register-otp',userValidation,validationError, wrapper(registerSendOtp));
route.post('/', checkAuth, wrapper(addUser))

route.post('/register-otp', wrapper(registerSendOtp));

route.post('/verify-register-otp', wrapper(verifyRegistrationOtp));

route.post('/send-otp', wrapper(sendOtp));

route.post('/verify-otp', verifyOtp)

route.post('/update-password', wrapper(updatePassword));

route.post('/change-password', checkAuth, wrapper(changePassword));

route.post('/internal-user', checkAuth, addInternalUserValidation, validationError, wrapper(addInternalUser));

route.put('/internal-user/:id', checkAuth, UpdateInternalUserValidation, validationError, wrapper(updateInternalUser));

route.delete('/internal-user/:id', checkAuth, wrapper(deleteInternalUser));

route.get('/internal-user', checkAuth, wrapper(GetInternalUser));

route.get('/', getUser);

route.get('/internal-branch-user', checkAuth, wrapper(getInternalBranchUser))

route.post('/addadmin', wrapper(addAdmin))









module.exports = route;