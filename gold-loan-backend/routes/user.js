const express = require('express');
const route = express.Router();

const { wrapper } = require('../utils/errorWrap');

const checkAuth = require('../middleware/checkAuth')

const { userValidation, addInternalUserValidation, UpdateInternalUserValidation } = require('../validations/user');
const validationError = require('../middleware/validationError')

const { addUser, getReleaser, addInternalUser, updateInternalUser, deleteInternalUser, GetInternalUser, sendOtp, changePassword, updatePassword, getUser, verifyOtp, addAdmin, getInternalBranchUser, getAppraiser, getUserTypeInternal, getUserDetails, getConcurrentList, removeKeyFromAppraiser } = require('../controllers/user/user')
const checkRolePermission = require('../middleware/checkRolesPermissions');

//Register User

// route.post('/register-otp',userValidation,validationError, wrapper(registerSendOtp));
route.post('/', checkAuth, wrapper(addUser))

route.post('/send-otp', wrapper(sendOtp));

route.post('/verify-otp', verifyOtp)

route.post('/update-password', wrapper(updatePassword));

route.post('/change-password', checkAuth, wrapper(changePassword));

route.get('/appraiser-list', checkAuth, wrapper(getAppraiser));

route.get('/releaser-list', checkAuth, wrapper(getReleaser));

route.post('/internal-user', checkAuth, checkRolePermission, addInternalUserValidation, validationError, wrapper(addInternalUser));

route.put('/internal-user/:id', checkAuth, checkRolePermission, UpdateInternalUserValidation, validationError, wrapper(updateInternalUser));

route.delete('/internal-user/:id', checkAuth, checkRolePermission, wrapper(deleteInternalUser));

route.get('/internal-user', checkAuth, checkRolePermission, wrapper(GetInternalUser));

route.get('/get-user-details', checkAuth, wrapper(getUserDetails))

route.get('/', getUser);

route.get('/internal-branch-user', checkAuth, wrapper(getInternalBranchUser))

route.post('/addadmin', wrapper(addAdmin))

route.get('/user-type-internal', checkAuth, wrapper(getUserTypeInternal))

route.get('/concurrent-list', checkAuth, wrapper(getConcurrentList))

route.put('/concurrent-list', checkAuth, wrapper(removeKeyFromAppraiser))









module.exports = route;