const { addHolidayMaster, readHolidayMaster, deactiveHolidayMaster, updateHolidayMaster,readHolidayMasterById } = require('../controllers/holidayMaster/holidayMaster.js');
const checkAuth = require('../middleware/checkAuth');
const { wrapper } = require('../utils/errorWrap');
const validationError=require('../middleware/validationError');
const {holidayMasterValidation,holidayMasterUpdateValidation}=require('../validations/holidayMaster');
const express = require('express');
const route = express.Router();

route.post('/', checkAuth,holidayMasterValidation,validationError, wrapper(addHolidayMaster)); // add holiday list

route.get('/', checkAuth, wrapper(readHolidayMaster)); // read holiday list

route.delete('/', checkAuth, wrapper(deactiveHolidayMaster)); // delete holiday list

route.get('/:id',checkAuth,wrapper(readHolidayMasterById)); // read  holiday list by id

route.put('/:id', checkAuth,holidayMasterUpdateValidation,validationError, wrapper(updateHolidayMaster)); // update holiday list

module.exports = route;

