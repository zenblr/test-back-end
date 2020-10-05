const express = require('express');
const { addUpdateOrganisationType, readOrganizationType } = require('../controllers/organizationType/organizationType');
const route = express.Router();
const { wrapper } = require('../utils/errorWrap');

const checkAuth = require('../middleware/checkAuth');
const checkRolePermission = require('../middleware/checkRolesPermissions');


route.post('/', checkAuth, wrapper(addUpdateOrganisationType));

route.get('/', checkAuth, wrapper(readOrganizationType));

module.exports = route;