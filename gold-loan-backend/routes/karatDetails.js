const {addKaratDetails,deactiveKaratdetails,readKaratDetails,updateKaratDetails,readKaratDetailsById}=require('../controllers/karatDetails/karatDetails.js');
const express=require('express');
const route=express.Router();
const {wrapper}=require('../utils/errorWrap');
const checkAuth=require('../middleware/checkAuth');
const validationError=require('../middleware/validationError');
const {karatDetailsValidation,karatDedtailsUpdateValidation}=require('../validations/karatDetails');


route.post('/',karatDetailsValidation,validationError,checkAuth,wrapper(addKaratDetails));
route.get('/',checkAuth,wrapper(readKaratDetails));
route.delete('/',checkAuth,wrapper(deactiveKaratdetails));
route.get('/:id',checkAuth,wrapper(readKaratDetailsById));
route.put('/:id',karatDedtailsUpdateValidation,validationError,checkAuth,wrapper(updateKaratDetails));

module.exports=route;