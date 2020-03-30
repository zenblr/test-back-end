const {AddPartner,ReadPartner ,UpdatePartner,DeletePartner ,ReadPartnerById}=require('../controllers/partner/partner');
const {wrapper}=require('../utils/errorWrap');
const express=require('express');
const route=express.Router();

route.post('/',wrapper(AddPartner));// add partner

route.get('/',wrapper(ReadPartner));// read partner

route.put('/:id',wrapper(UpdatePartner));// update partner

route.delete('/:id',wrapper(DeletePartner));// delete partner

route.get('/:id',wrapper(ReadPartnerById));// read by id partner

module.exports=route;   