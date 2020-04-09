const { addBranch, readBranch, readBranchById, updateBranch, deleteBranch } = require('../controllers/branch/branch');
const express = require('express');
const route = express.Router();
const { wrapper } = require('../utils/errorWrap');
const {branchValidation}=require('../validations/branch')

const checkAuth = require('../middleware/checkAuth');

route.post('/',branchValidation,checkAuth, wrapper(addBranch)); // add branch

route.get('/', checkAuth, wrapper(readBranch)); // get branch

route.get('/:id', checkAuth, wrapper(readBranchById)); //get branch by id

route.put('/:id', checkAuth, wrapper(updateBranch)); //update branch 

route.delete('/:id', checkAuth, wrapper(deleteBranch)); //delete branch

module.exports = route;