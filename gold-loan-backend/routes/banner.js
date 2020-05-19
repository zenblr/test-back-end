const express = require('express');
const { addUpdateBanner, readBanner, deleteBanner } = require('../controllers/banner/banner');
const route = express.Router();
const { wrapper } = require('../utils/errorWrap');

const checkAuth = require('../middleware/checkAuth');
const checkRolePermission = require('../middleware/checkRolesPermissions');


route.post('/', checkAuth, checkRolePermission, wrapper(addUpdateBanner));
route.get('/', checkAuth, checkRolePermission, wrapper(readBanner));
// route.delete('/:id', checkAuth, wrapper(deleteBanner));

module.exports = route;