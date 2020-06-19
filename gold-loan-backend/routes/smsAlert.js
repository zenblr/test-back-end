const {addSmsAlert,readSmsAlert,readSmsAlertById,updateSmsAlert}=require('../controllers/smsAlert/smsAlert.js');
const {wrapper}=require('../utils/errorWrap');
const {editSmsAlertValidation , addSmsAlertValidation} = require('../validations/smsAlert');
const validationError = require('../middleware/validationError');
const express=require('express');
const route=express.Router();
const checkAuth=require('../middleware/checkAuth');

route.post('/',checkAuth,addSmsAlertValidation,validationError,wrapper(addSmsAlert));//add sms alert

route.get('/',checkAuth,wrapper(readSmsAlert)); // read sms alert

route.get('/:id',checkAuth,wrapper(readSmsAlertById)); // read sms alert by id

route.put('/:id',checkAuth,editSmsAlertValidation,validationError,wrapper(updateSmsAlert)); // update sms alert by id

module.exports=route;