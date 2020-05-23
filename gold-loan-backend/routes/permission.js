const {  readPermission,addsystemInfoPermissions } = require("../controllers/permission/permission");

const { wrapper } = require('../utils/errorWrap');

const express = require('express');
const route = express.Router();
const checkAuth = require('../middleware/checkAuth');

route.get('/:roleId', checkAuth, wrapper(readPermission)); //get permission
route.post('/add',addsystemInfoPermissions);

module.exports = route;