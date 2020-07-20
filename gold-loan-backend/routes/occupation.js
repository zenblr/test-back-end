const express = require('express');
const { addOccupation, readOccupation, deactiveOccupation, updateOccupation } = require('../controllers/occupation/occupation');
const route = express.Router();
const { wrapper } = require('../utils/errorWrap');
const validationError = require('../middleware/validationError');
const { addOccupationValidation, updateOccupationValidation } = require('../validations/occupation.js');

const checkAuth = require('../middleware/checkAuth');
const checkRolePermission = require('../middleware/checkRolesPermissions');


route.post('/', checkAuth, checkRolePermission, validationError, addOccupationValidation, wrapper(addOccupation)); // add occupation
route.get('/', checkAuth, wrapper(readOccupation)); // read occupation
route.delete('/', checkAuth, checkRolePermission, wrapper(deactiveOccupation)); // deactive occupation
route.put('/:id', checkAuth, checkRolePermission, updateOccupationValidation, validationError, wrapper(updateOccupation)); // update identity type


module.exports = route;