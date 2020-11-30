const express = require('express');
const route = express.Router();
const { wrapper } = require('../../utils/errorWrap'); // IMPORTING ERROR WRAPPER FUNCTION
// const {configDetail} = require('../../validations/digitalGold/configDetail');
const validationError = require('../../middleware/validationError');
const { createConfigDetail,getConfigDetail,editConfigDetail,deleteConfigDetail} = require('../../controllers/digitalGold/configDetail/configDetail');
const checkRolePermission = require('../../middleware/checkRolesPermissions');
const customerCheckAuth = require('../../middleware/customerCheckAuth'); // IMPORTING CHECKAUTH MIDDLEWARE


route.post('/', customerCheckAuth,validationError,wrapper(createConfigDetail));

route.get('/', customerCheckAuth, wrapper(getConfigDetail));

route.put('/', customerCheckAuth, wrapper(editConfigDetail))

route.delete('/:configId', customerCheckAuth, wrapper(deleteConfigDetail))

module.exports = route; // EXPORTING ALL ROUTES