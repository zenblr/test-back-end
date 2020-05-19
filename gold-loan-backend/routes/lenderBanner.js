const express = require('express');
const { addUpdateLenderBanner, readLenderBanner } = require('../controllers/lenderBanner/lenderBanner');
const route = express.Router();
const { wrapper } = require('../utils/errorWrap');

const checkAuth = require('../middleware/checkAuth');
const checkRolePermission = require('../middleware/checkRolesPermissions');


route.post('/', checkAuth, checkRolePermission, wrapper(addUpdateLenderBanner));
route.get('/', checkAuth, checkRolePermission, wrapper(readLenderBanner));

module.exports = route;