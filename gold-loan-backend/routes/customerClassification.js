const express = require('express');
const route = express.Router();
const { wrapper } = require('../utils/errorWrap');
const { addCceRating, updateRating, updateRatingAppraiserOrCce } = require('../controllers/customerClassification/customerClassification')

const checkAuth = require('../middleware/checkAuth');
const checkRolePermission = require('../middleware/checkRolesPermissions');


route.post('/cce', checkAuth, checkRolePermission, wrapper(addCceRating));

route.put('/', checkAuth, checkRolePermission, wrapper(updateRating));

route.put('/kyc-rating', checkAuth, wrapper(updateRatingAppraiserOrCce))


module.exports = route;