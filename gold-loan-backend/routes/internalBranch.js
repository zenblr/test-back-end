const express = require('express');
const { addInternalBranch,readInternalBranch,readInternalBranchById,updateInternalBranch,deactiveInternalBranch } = require('../controllers/internalBranch/internalBranch');
const route = express.Router();
const validatiError=require('../middleware/validationError');
const{addInternalBranchValidation,updateInternalBranchValidation}=require('../validations/internalBranch');
const { wrapper } = require('../utils/errorWrap');

const checkAuth = require('../middleware/checkAuth');

route.post('/', addInternalBranchValidation,validatiError,checkAuth, wrapper(addInternalBranch));// add internal branch
route.get('/', checkAuth, wrapper(readInternalBranch)); // read internal branch
route.delete('/',checkAuth,wrapper(deactiveInternalBranch)); // delete internal branch
route.get('/:id',checkAuth,wrapper(readInternalBranchById)); // read internal branch by id
route.put('/:id',updateInternalBranchValidation,validatiError,checkAuth,wrapper(updateInternalBranch)); // update Internal branch

module.exports = route;