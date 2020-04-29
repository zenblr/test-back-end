const { addScheme, readScheme, readSchemeById, editScheme,readSchemeByPartnerId, deactiveScheme, updateScheme } = require("../controllers/scheme/scheme");

const { wrapper } = require('../utils/errorWrap');
const validationError = require('../middleware/validationError');
const { schemeValidation } = require('../validations/scheme');
const checkAuth = require('../middleware/checkAuth');


const express = require('express');

const route = express.Router();

route.post('/', schemeValidation, validationError, checkAuth, wrapper(addScheme)); // add scheme route

route.get('/', checkAuth, wrapper(readScheme)); // read Scheme route

route.put('/',checkAuth,wrapper(editScheme)); // edit scheme route

route.delete('/', checkAuth, wrapper(deactiveScheme)); // deactive scheme

route.get('/:id', checkAuth, wrapper(readSchemeById)); // read scheme by id route

route.get('/partner-scheme/:id', wrapper(readSchemeByPartnerId))

route.put('/:id', checkAuth, schemeValidation, validationError, wrapper(updateScheme));  // update scheme 


module.exports = route;


