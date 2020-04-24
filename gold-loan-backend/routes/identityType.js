const {addIdentityType,readIdentityType,deactivateIdentityType}=require('../controllers/identityType/identityType');
const checkAuth=require('../middleware/checkAuth');
const express=require('express');
const route=express.Router();
const {wrapper}=require('../utils/errorWrap');

route.post('/',checkAuth,wrapper(addIdentityType));// add Identity Type

route.get('/',checkAuth,wrapper(readIdentityType)); // read Identity Type

route.delete('/', checkAuth, wrapper(deactivateIdentityType)) // deactive  identity Type

module.exports=route;

