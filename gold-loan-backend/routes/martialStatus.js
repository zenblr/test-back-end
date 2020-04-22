const {addMartialStatus,readMartialStatus,deactivateMartialStatus}=require('../controllers/martialStatus/martialStatus');
const checkAuth=require('../middleware/checkAuth');
const express=require('express');
const route=express.Router();
const {wrapper}=require('../utils/errorWrap');

route.post('/',checkAuth,wrapper(addMartialStatus));// add Martial Status

route.get('/',checkAuth,wrapper(readMartialStatus)); // read Martial Status

route.delete('/', checkAuth, wrapper(deactivateMartialStatus)) // deactive  Martial Status

module.exports=route;

