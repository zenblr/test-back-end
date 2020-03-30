const {AddBranch,ReadBranch,ReadBranchById,UpdateBranch,DeleteBranch}=require('../controllers/branch/branch');
const express=require('express');
const route=express.Router();
const {wrapper}=require('../utils/errorWrap');

route.post('/',wrapper(AddBranch));// add branch

route.get('/',wrapper(ReadBranch)); // get branch

route.get('/:id',wrapper(ReadBranchById)); //get branch by id

route.put('/:id',wrapper(UpdateBranch)); //update branch 

route.delete('/:id',wrapper(DeleteBranch)); //delete branch

module.exports=route;