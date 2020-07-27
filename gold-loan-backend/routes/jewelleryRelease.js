const express = require('express');
const { ornamentsDetails, ornamentsAmountDetails } = require('../controllers/jewelleryRelease/jewelleryRelease');
const route = express.Router();
const validatiError = require('../middleware/validationError');
const { wrapper } = require('../utils/errorWrap');
const checkRolePermission = require('../middleware/checkRolesPermissions');

const checkAuth = require('../middleware/checkAuth');


route.get('/:masterLoanId', checkAuth, wrapper(ornamentsDetails)); 

route.post('/', checkAuth, wrapper(ornamentsAmountDetails)); 

module.exports = route;