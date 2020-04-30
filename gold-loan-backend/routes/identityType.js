const {addIdentityType,readIdentityType,deactivateIdentityType,updateIdentityType}=require('../controllers/identityType/identityType');
const checkAuth=require('../middleware/checkAuth');
const express=require('express');
const route=express.Router();
const {wrapper}=require('../utils/errorWrap');
const validationError=require('../middleware/validationError');
const {addIdentityTypeValidation,updateIdentityTypeValidation}=require('../validations/identityType')

route.post('/',addIdentityTypeValidation,validationError,checkAuth,wrapper(addIdentityType));// add Identity Type

route.get('/',checkAuth,wrapper(readIdentityType)); // read Identity Type

route.delete('/', checkAuth, wrapper(deactivateIdentityType)) // deactive  identity Type

route.put('/:id',updateIdentityTypeValidation,validationError,checkAuth,wrapper(updateIdentityType)); // update identity type


module.exports=route;

