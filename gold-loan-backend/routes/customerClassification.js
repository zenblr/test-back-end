const express = require('express');
const route = express.Router();
const { wrapper } = require('../utils/errorWrap');
const { cceKycRating, updateRating, updateRatingAppraiserOrCce, operationalTeamKycRating } = require('../controllers/customerClassification/customerClassification')

const checkAuth = require('../middleware/checkAuth');
const checkRolePermission = require('../middleware/checkRolesPermissions');


route.post('/cce', checkAuth, checkRolePermission, wrapper(cceKycRating));

route.put('/', checkAuth, checkRolePermission, wrapper(updateRating));

route.post('/ops-team', checkAuth, wrapper(operationalTeamKycRating))

route.put('/kyc-rating', checkAuth, wrapper(updateRatingAppraiserOrCce))


module.exports = route;