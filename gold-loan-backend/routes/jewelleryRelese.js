const express = require('express');
const { ornamentsDetails } = require('../controllers/jewelleryRelese/jewelleryRelese');
const route = express.Router();
const validatiError = require('../middleware/validationError');
const { wrapper } = require('../utils/errorWrap');
const checkRolePermission = require('../middleware/checkRolesPermissions');

const checkAuth = require('../middleware/checkAuth');


route.get('/:masterLoanId', checkAuth, wrapper(ornamentsDetails)); 

module.exports = route;