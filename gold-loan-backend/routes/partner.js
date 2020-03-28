const controller=require('../controllers/partner/partner');
const errorwrapper=require('../utils/errorWrap');
const express=require('express');
const route=express.Router();

route.post('/addpartner',errorwrapper.wrapper(controller.AddPartner));// add partner

route.get('/readpartner',errorwrapper.wrapper(controller.ReadPartner));// read partner

route.put('/updatepartner/:id',errorwrapper.wrapper(controller.UpdatePartner));// update partner

route.put('/deletepartner/:id',errorwrapper.wrapper(controller.DeletePartner));// delete partner

route.get('/readpartnerbyid/:id',errorwrapper.wrapper(controller.ReadPartnerById));// read by id partner

module.exports=route;   