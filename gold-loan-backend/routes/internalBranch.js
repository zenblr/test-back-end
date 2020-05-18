const express = require('express');
const { addInternalBranch, readInternalBranch, readInternalBranchById, updateInternalBranch, deactiveInternalBranch } = require('../controllers/internalBranch/internalBranch');
const route = express.Router();
const validatiError = require('../middleware/validationError');
const { addInternalBranchValidation, updateInternalBranchValidation } = require('../validations/internalBranch');
const { wrapper } = require('../utils/errorWrap');
const checkRolePermission = require('../middleware/checkRolesPermissions');

const checkAuth = require('../middleware/checkAuth');

route.post('/', addInternalBranchValidation, validatiError, checkAuth, checkRolePermission, wrapper(addInternalBranch));// add internal branch
route.get('/', checkAuth, checkRolePermission, wrapper(readInternalBranch)); // read internal branch
route.delete('/', checkAuth, checkRolePermission, wrapper(deactiveInternalBranch)); // delete internal branch
route.get('/:id', checkAuth, checkRolePermission, wrapper(readInternalBranchById)); // read internal branch by id
route.put('/:id', updateInternalBranchValidation, validatiError, checkAuth, checkRolePermission, wrapper(updateInternalBranch)); // update Internal branch

module.exports = route;