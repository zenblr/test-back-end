const {addKaratDetails,deactiveKaratdetails,readKaratDetails,updateKaratDetails,readKaratDetailsById}=require('../controllers/karatDetails/karatDetails.js');
const express=require('express');
const route=express.Router();
const {wrapper}=require('../utils/errorWrap');
const checkAuth=require('../middleware/checkAuth');


route.post('/',checkAuth,wrapper(addKaratDetails));
route.get('/',checkAuth,wrapper(readKaratDetails));
route.delete('/',checkAuth,wrapper(deactiveKaratdetails));
route.get('/:id',checkAuth,wrapper(readKaratDetailsById));
route.put('/:id',checkAuth,wrapper(updateKaratDetails));

module.exports=route;