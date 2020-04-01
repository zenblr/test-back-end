const { AddBranch, ReadBranch, ReadBranchById, UpdateBranch, DeleteBranch } = require('../controllers/branch/branch');
const express = require('express');
const route = express.Router();
const { wrapper } = require('../utils/errorWrap');

const checkAuth = require('../middleware/checkAuth');

route.post('/', checkAuth, wrapper(AddBranch)); // add branch

route.get('/', checkAuth, wrapper(ReadBranch)); // get branch

route.get('/:id', checkAuth, wrapper(ReadBranchById)); //get branch by id

route.put('/:id', checkAuth, wrapper(UpdateBranch)); //update branch 

route.delete('/:id', checkAuth, wrapper(DeleteBranch)); //delete branch

module.exports = route;