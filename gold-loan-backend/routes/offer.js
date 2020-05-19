const express = require('express');
const { addUpdateOffer, readOffer, readGoldRate } = require('../controllers/offer/offer');
const route = express.Router();
const { wrapper } = require('../utils/errorWrap');

const checkAuth = require('../middleware/checkAuth');
const checkRolePermission = require('../middleware/checkRolesPermissions');


route.post('/', checkAuth, checkRolePermission, wrapper(addUpdateOffer));
route.get('/', checkAuth, checkRolePermission, wrapper(readOffer));


module.exports = route;