const { addRole, readAllRole, updateRole, deactiveRole, readRolesPagination, addPermissions, getRoleModules, deleteRole } = require("../controllers/role/role");
const {createRoleValidation, updateRoleValidation, addPermissionsValidation} = require("../validations/role");
const validationError = require('../middleware/validationError');
const { wrapper } = require("../utils/errorWrap");

const express = require("express");
const checkAuth = require('../middleware/checkAuth');


const route = express.Router();

route.post('/', checkAuth,createRoleValidation,validationError, wrapper(addRole)); 

route.post('/add-permissions',checkAuth,addPermissionsValidation,validationError,wrapper(addPermissions))

route.get('/', checkAuth, wrapper(readRolesPagination));

route.get('/all-role', checkAuth, wrapper(readAllRole));

route.get('/module/:roleId',checkAuth,wrapper(getRoleModules));

route.put('/:id', checkAuth,updateRoleValidation, validationError, wrapper(updateRole)); 

route.delete('/:roleId', checkAuth, wrapper(deleteRole)); 

module.exports = route;