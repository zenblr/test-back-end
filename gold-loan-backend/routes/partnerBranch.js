const { addBranch, readBranch, readBranchById, updateBranch, deleteBranch } = require('../controllers/partnerBranch/partnerBranch');
const express = require('express');
const route = express.Router();
const validationError = require('../middleware/validationError')
const { wrapper } = require('../utils/errorWrap');
const { branchValidation } = require('../validations/partnerBranch')

const checkAuth = require('../middleware/checkAuth');
const checkRolePermission = require('../middleware/checkRolesPermissions');

route.post('/', branchValidation, validationError, checkAuth, checkRolePermission, wrapper(addBranch)); // add branch

route.get('/', checkAuth, checkRolePermission, wrapper(readBranch)); // get branch

route.get('/:id', checkAuth, checkRolePermission, wrapper(readBranchById)); //get branch by id

route.put('/:id', branchValidation, validationError, checkAuth, checkRolePermission, wrapper(updateBranch)); //update branch 

route.delete('/', checkAuth, checkRolePermission, wrapper(deleteBranch)); //delete branch

module.exports = route;