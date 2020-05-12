const {addRoughLoanAmount,readRoughLoanAmount}=require('../controllers/loanAmount/roughLoanAmount');
const models=require('../models');
const {wrapper}=require('../utils/errorWrap');
const express=require('express');
const router=express.Router();
const checkAuth=require('../middleware/checkAuth');

router.post('/',checkAuth,wrapper(addRoughLoanAmount));

module.exports=router;
