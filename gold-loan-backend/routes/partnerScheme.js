const {addPartnerScheme,readPartnerSchemeById,readPartnerScheme,deactivePartnerScheme,updatePartnerScheme}=require("../controllers/schemes/partnerSchemes");

const {wrapper}=require('../utils/errorWrap');

const express=require('express');

const route=express.Router();

route.post('/',wrapper(addPartnerScheme)); // add  Partner scheme route

route.get('/',wrapper(readPartnerScheme)); // read Partner  Scheme route

route.get('/:id',wrapper(readPartnerSchemeById)); // read Partner scheme by id route

route.put('/:id',wrapper(updatePartnerScheme));  // update  Partner scheme 

route.delete('/:id',wrapper(deactivePartnerScheme)); // deactive Partner scheme


module.exports=route;
