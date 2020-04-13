const { addPermission, deactivePermission, updatePermission, readPermission } = require("../controllers/permission/permission");

const { wrapper } = require('../utils/errorWrap');

const express = require('express');
const route = express.Router();
const checkAuth = require('../middleware/checkAuth');


route.post('/', checkAuth, wrapper(addPermission));// add  permission

route.get('/', checkAuth, wrapper(readPermission)); //get permission

route.delete('/', checkAuth, wrapper(deactivePermission)); // delete permission

route.put("/:id", checkAuth, wrapper(updatePermission)); // update permission

module.exports = route;