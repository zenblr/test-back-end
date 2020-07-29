const express = require('express');
const route = express.Router();
const { wrapper } = require('../../utils/errorWrap');
const { addScrapGlobalSetting, getScrapGlobalSetting, getScrapGlobalSettingLog } = require('../../controllers/scrap/globalSettings/scrapGlobalSettings')
const checkAuth = require('../../middleware/checkAuth');
const checkRolePermission = require('../../middleware/checkRolesPermissions');
const validationError = require('../../middleware/validationError');
const { scrapGlobalSettingsValidation } = require('../../validations/scrap/scrapGlobalSettings');


route.post('/', checkAuth, scrapGlobalSettingsValidation, validationError, wrapper(addScrapGlobalSetting));

route.get('/', checkAuth, wrapper(getScrapGlobalSetting));

route.get('/scrap-global-settings-log', checkAuth, wrapper(getScrapGlobalSettingLog));

module.exports = route;