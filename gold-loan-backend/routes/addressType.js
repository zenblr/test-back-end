const {addAddressType,readAddressType,deactivateAddressType}=require('../controllers/addressType/addressType');
const checkAuth=require('../middleware/checkAuth');
const express=require('express');
const route=express.Router();
const {wrapper}=require('../utils/errorWrap');

route.post('/',checkAuth,wrapper(addAddressType));// add address Type

route.get('/',checkAuth,wrapper(readAddressType)); // read address Type

route.delete('/', checkAuth, wrapper(deactivateAddressType)) // deactive address type

module.exports=route;

