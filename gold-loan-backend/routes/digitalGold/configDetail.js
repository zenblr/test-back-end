const express = require('express');
const route = express.Router();
const { wrapper } = require('../../utils/errorWrap'); // IMPORTING ERROR WRAPPER FUNCTION
// const {configDetail} = require('../../validations/digitalGold/configDetail');
const validationError = require('../../middleware/validationError');
const { createConfigDetail, getConfigDetail, editConfigDetail, deleteConfigDetail } = require('../../controllers/digitalGold/configDetail/configDetail');
const checkRolePermission = require('../../middleware/checkRolesPermissions');
const customerCheckAuth = require('../../middleware/customerCheckAuth'); // IMPORTING CHECKAUTH MIDDLEWARE
const checkAuth = require('../../middleware/checkAuth'); // IMPORTING CHECKAUTH MIDDLEWARE


route.post('/', checkAuth, validationError, wrapper(createConfigDetail));

route.get('/', checkAuth, wrapper(getConfigDetail));

route.put('/', checkAuth, wrapper(editConfigDetail))

route.delete('/:configId', checkAuth, wrapper(deleteConfigDetail))

module.exports = route; // EXPORTING ALL ROUTES