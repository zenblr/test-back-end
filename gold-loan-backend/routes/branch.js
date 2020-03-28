const controller=require('../controllers/branch/branch');
const express=require('express');
const route=express.Router();
const errorwrapper=require('../utils/errorWrap');

route.post('/addbranch',errorwrapper.wrapper(controller.AddBranch));// add branch

route.get('/getbranch',errorwrapper.wrapper(controller.ReadBranch)); // get branch

route.get('/getbranchbyid/:id',errorwrapper.wrapper(controller.ReadBranchById)); //get branch by id

route.put('/updatebranch/:id',errorwrapper.wrapper(controller.UpdateBranch)); //update branch 

route.put('/deletebranch/:id',errorwrapper.wrapper(controller.DeleteBranch)); //delete branch

module.exports=route;