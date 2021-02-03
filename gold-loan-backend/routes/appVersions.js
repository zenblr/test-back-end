const { addAppVersion, readAppVersion } = require('../controllers/appVersions/appVersions');
const checkAuth = require('../middleware/checkAuth');
const express = require('express');
const route = express.Router();
const { wrapper } = require('../utils/errorWrap');

route.post('/', checkAuth, wrapper(addAppVersion));// add Identity Type

route.get('/', checkAuth, wrapper(readAppVersion)); // read Identity Type

module.exports = route;

