const {addEmailAlert,readEmailAlert,readEmailAlertById,updateEmailAlert,deactiveEmailAlert}=require('../controllers/emailAlert/emailAlert');
const {wrapper}=require('../utils/errorWrap');
const express=require('express');
const route=express.Router();
const checkAuth=require('../middleware/checkAuth');

route.post('/',checkAuth,wrapper(addEmailAlert));//add email alert

route.get('/',checkAuth,wrapper(readEmailAlert)); // read email alert

route.delete('/',checkAuth,wrapper(deactiveEmailAlert)); // deactive email alert

route.get('/:id',checkAuth,wrapper(readEmailAlertById)); // read email alert by id

route.put('/:id',checkAuth,wrapper(updateEmailAlert)); // update email alert by id

module.exports=route;