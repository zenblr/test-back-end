const express = require('express');
const route = express.Router();
const { wrapper } = require('../utils/errorWrap');
const {addGoldRate, readGoldRate, goldRateLog} = require('./../controllers/goldRate/goldRate')
const checkAuth = require('../middleware/checkAuth');
const checkRolePermission = require('../middleware/checkRolesPermissions');


route.post('/', checkAuth,checkRolePermission, wrapper(addGoldRate));
route.get('/', checkAuth,checkRolePermission, wrapper(readGoldRate));
route.get('/log', checkAuth,checkRolePermission, wrapper(goldRateLog));

// route.delete('/:id', checkAuth, wrapper(deleteBanner));

module.exports = route;