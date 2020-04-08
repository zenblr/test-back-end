const {addRole,readRole,updateRole,deactiveRole}=require("../controllers/role/role");

const{wrapper}=require("../utils/errorWrap");

const express=require("express");

const route=express.Router();

route.post('/',wrapper(addRole)); // add role

route.get('/',wrapper(readRole)); //read role

route.put('/:id',wrapper(updateRole)); //update role

route.delete('/:id',wrapper(deactiveRole)); //delete role

module.exports=route;