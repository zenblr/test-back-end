const { addRole, readRole, updateRole, deactiveRole } = require("../controllers/role/role");

const { wrapper } = require("../utils/errorWrap");

const express = require("express");
const checkAuth = require('../middleware/checkAuth');


const route = express.Router();

route.post('/', checkAuth, wrapper(addRole)); // add role

route.get('/', checkAuth, wrapper(readRole)); //read role

route.put('/:id', checkAuth, wrapper(updateRole)); //update role

route.delete('/', checkAuth, wrapper(deactiveRole)); //delete role

module.exports = route;