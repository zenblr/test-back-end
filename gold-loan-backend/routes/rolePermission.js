var express = require('express');
const route = express.Router();
const {postModule, postEntity, postPermissions} = require('../controllers/rolePermissions/rolePermission');
const { wrapper } = require('../utils/errorWrap');
const checkAuth = require('../middleware/checkAuth');



route.post('/add-modules', checkAuth, wrapper(postModule));

route.post('/add-entity', checkAuth, wrapper(postEntity));

route.post('/add-permissions', checkAuth, wrapper(postPermissions));

module.exports = route;