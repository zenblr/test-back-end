const { addRole, readAllRole, updateRole, deactiveRole, readRolesPagination, addPermissions } = require("../controllers/role/role");
const {createRoleValidation, updateRoleValidation, addPermissionsValidation} = require("../validations/role");
const validationError = require('../middleware/validationError');
const { wrapper } = require("../utils/errorWrap");

const express = require("express");
const checkAuth = require('../middleware/checkAuth');


const route = express.Router();

route.post('/', checkAuth,createRoleValidation,validationError, wrapper(addRole)); // add role

route.post('/add-permissions',checkAuth,addPermissionsValidation,validationError,wrapper(addPermissions))

route.get('/', checkAuth, wrapper(readRolesPagination)); //read role

route.get('/all-role', checkAuth, wrapper(readAllRole)); //read role

route.put('/:id', checkAuth,updateRoleValidation, validationError, wrapper(updateRole)); //update role

route.delete('/', checkAuth, wrapper(deactiveRole)); //delete role

module.exports = route;