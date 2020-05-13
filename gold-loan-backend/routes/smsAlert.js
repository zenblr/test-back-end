const {addSmsAlert,readSmsAlert,readSmsAlertById,updateSmsAlert,deactiveSmsAlert}=require('../controllers/smsAlert/smsAlert.js');
const {wrapper}=require('../utils/errorWrap');
const express=require('express');
const route=express.Router();
const checkAuth=require('../middleware/checkAuth');

route.post('/',checkAuth,wrapper(addSmsAlert));//add sms alert

route.get('/',checkAuth,wrapper(readSmsAlert)); // read sms alert

route.delete('/',checkAuth,wrapper(deactiveSmsAlert)); // deactive sms alert

route.get('/:id',checkAuth,wrapper(readSmsAlertById)); // read sms alert by id

route.put('/:id',checkAuth,wrapper(updateSmsAlert)); // update sms alert by id

module.exports=route;