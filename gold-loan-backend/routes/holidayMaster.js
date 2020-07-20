const { addHolidayMaster, readHolidayMaster, deactiveHolidayMaster, updateHolidayMaster, readHolidayMasterById } = require('../controllers/holidayMaster/holidayMaster.js');
const checkAuth = require('../middleware/checkAuth');
const { wrapper } = require('../utils/errorWrap');
const validationError = require('../middleware/validationError');
const { holidayMasterValidation, holidayMasterUpdateValidation } = require('../validations/holidayMaster');
const express = require('express');
const route = express.Router();
const checkRolePermission = require('../middleware/checkRolesPermissions');

route.post('/', checkAuth, checkRolePermission, holidayMasterValidation, validationError, wrapper(addHolidayMaster)); // add holiday list

route.get('/', checkAuth, wrapper(readHolidayMaster)); // read holiday list

route.delete('/', checkAuth, checkRolePermission, wrapper(deactiveHolidayMaster)); // delete holiday list

route.get('/:id', checkAuth, wrapper(readHolidayMasterById)); // read  holiday list by id

route.put('/:id', checkAuth, checkRolePermission, holidayMasterUpdateValidation, validationError, wrapper(updateHolidayMaster)); // update holiday list

module.exports = route;

