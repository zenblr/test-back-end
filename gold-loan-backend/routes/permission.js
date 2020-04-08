const {addPermission,deactivePermission,updatePermission,readPermission} =require("../controllers/permission/permission");

const {wrapper} =require('../utils/errorWrap');

const express=require('express');
const route=express.Router();


route.post('/',wrapper(addPermission));// add  permission

route.get('/',wrapper(readPermission)); //get permission

route.delete('/:id',wrapper(deactivePermission)); // delete permission

route.put("/:id",wrapper(updatePermission)); // update permission

module.exports=route;