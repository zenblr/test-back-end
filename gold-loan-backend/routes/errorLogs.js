const {readErrorLogs}=require('../controllers/errorLogs/errorLogs');
const {wrapper}=require('../utils/errorWrap');
const express=require('express');
const route=express.Router();
const checkAuth=require('../middleware/checkAuth');

route.get('/',checkAuth,wrapper(readErrorLogs)); // read email alert


module.exports=route;