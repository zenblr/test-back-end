const { addScheme, readScheme, readSchemeById, editScheme, readSchemeByPartnerId, deactiveScheme, updateScheme, filterScheme, readSchemeOnAmount, UpdateDefault, readUnsecuredSchemeOnAmount, checkSlab } = require("../controllers/scheme/scheme");

const { wrapper } = require('../utils/errorWrap');
const validationError = require('../middleware/validationError');
const { schemeValidation } = require('../validations/scheme');
const checkAuth = require('../middleware/checkAuth');
const checkRolePermission = require('../middleware/checkRolesPermissions');


const express = require('express');

const route = express.Router();
route.get('/check-slab', checkAuth, wrapper(checkSlab))

route.post('/', schemeValidation, validationError, checkAuth, checkRolePermission, wrapper(addScheme)); // add scheme route

route.get('/', checkAuth, checkRolePermission, wrapper(readScheme)); // read Scheme route

route.put('/', checkAuth, checkRolePermission, wrapper(editScheme)); // edit scheme route

route.delete('/', checkAuth, checkRolePermission, wrapper(deactiveScheme)); // deactive scheme

route.get('/filter-scheme', checkAuth, checkRolePermission, wrapper(filterScheme)) // filter scheme

route.get('/partner-scheme/:id', checkAuth, checkRolePermission, wrapper(readSchemeByPartnerId)) //read partner scheme

route.get('/partner-scheme-amount/:amount', checkAuth, wrapper(readSchemeOnAmount)) //read scheme on amount

route.get('/:id', checkAuth, checkRolePermission, wrapper(readSchemeById)); // read scheme by id route

route.put('/:id', checkAuth, checkRolePermission, schemeValidation, validationError, wrapper(updateScheme));  // update scheme 

route.put('/update-default/:id', checkAuth, wrapper(UpdateDefault)); // api to update default

route.get('/unsecured-scheme/:id/:amount', checkAuth, wrapper(readUnsecuredSchemeOnAmount));


module.exports = route;


