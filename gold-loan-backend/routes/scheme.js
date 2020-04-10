const {addScheme,readScheme,readSchemeById,deactiveScheme,updateScheme}=require("../controllers/schemes/scheme");

const {wrapper}=require('../utils/errorWrap');
const validationError=require('../middleware/validationError');
const  {schemeValidation}=require('../validations/scheme');

const express=require('express');

const route=express.Router();

route.post('/',schemeValidation,validationError,wrapper(addScheme)); // add scheme route

route.get('/',wrapper(readScheme)); // read Scheme route

route.get('/:id',wrapper(readSchemeById)); // read scheme by id route

route.put('/:id',schemeValidation,validationError,wrapper(updateScheme));  // update scheme 

route.delete('/:id',wrapper(deactiveScheme)); // deactive scheme


module.exports=route;


