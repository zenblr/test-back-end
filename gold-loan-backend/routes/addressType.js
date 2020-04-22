const {addAddressType,readAddressType}=require('../controllers/addressType/addressType');
const checkAuth=require('../middleware/checkAuth');
const express=require('express');
const router=express.Router();
const {wrapper}=require('../utils/errorWrap');

router.post('/',checkAuth,wrapper(addAddressType));// add address Type

router.get('/',checkAuth,wrapper(readAddressType)); // read address Type

module.exports=router;

