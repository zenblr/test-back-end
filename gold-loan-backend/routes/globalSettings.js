const express = require('express');
const route = express.Router();
const { wrapper } = require('../utils/errorWrap');
const {addGlobalSetting, getGlobalSetting, getGlobalSettingLog} = require('./../controllers/globalSettings/globalSettings')
const checkAuth = require('../middleware/checkAuth');
const checkRolePermission = require('../middleware/checkRolesPermissions');
const validationError = require('../middleware/validationError');
const { globalSettingsValidation } = require('../validations/globalSettings');


route.post('/', checkAuth,globalSettingsValidation,validationError, wrapper(addGlobalSetting));

route.get('/', checkAuth, wrapper(getGlobalSetting));

route.get('/global-settings-log', checkAuth, wrapper(getGlobalSettingLog));

module.exports = route;