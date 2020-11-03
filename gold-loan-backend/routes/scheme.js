const { addScheme, readScheme,exportSchemes, readSchemeById, readSchemeByPartnerId, deactiveScheme, readSchemeOnAmount, UpdateDefault, readUnsecuredSchemeOnAmount, checkSlab, getUnsecuredScheme } = require("../controllers/scheme/scheme");

const { wrapper } = require('../utils/errorWrap');
const validationError = require('../middleware/validationError');
const { schemeValidation } = require('../validations/scheme');
const checkAuth = require('../middleware/checkAuth');
const checkRolePermission = require('../middleware/checkRolesPermissions');


const express = require('express');

const route = express.Router();
route.get('/check-slab', checkAuth, wrapper(checkSlab)) //not in role permission

route.post('/', schemeValidation, validationError, checkAuth, checkRolePermission, wrapper(addScheme)); // add scheme route

route.get('/', checkAuth, checkRolePermission, wrapper(readScheme)); // read Scheme route

route.delete('/', checkAuth, checkRolePermission, wrapper(deactiveScheme)); // deactive scheme

route.get('/export-scheme', checkAuth, wrapper(exportSchemes));

route.get('/partner-scheme/:id', checkAuth, checkRolePermission, wrapper(readSchemeByPartnerId)) //read partner scheme

route.get('/partner-scheme-amount/:masterLoanId', checkAuth, wrapper(readSchemeOnAmount)) //read scheme on amount

route.get('/:id', checkAuth, checkRolePermission, wrapper(readSchemeById)); // read scheme by id route

route.put('/update-default/:id', checkAuth, checkRolePermission, wrapper(UpdateDefault)); // api to update default

route.get('/unsecured-scheme/:id/:amount', checkAuth, checkRolePermission, wrapper(readUnsecuredSchemeOnAmount));

route.post('/unsecured-scheme', checkAuth, wrapper(getUnsecuredScheme))

module.exports = route;


