const {  readPermission } = require("../controllers/permission/permission");

const { wrapper } = require('../utils/errorWrap');

const express = require('express');
const route = express.Router();
const checkAuth = require('../middleware/checkAuth');

route.get('/', checkAuth, wrapper(readPermission)); //get permission

module.exports = route;