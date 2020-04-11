const { addScheme, readScheme, readSchemeById, deactiveScheme, updateScheme } = require("../controllers/schemes/scheme");

const { wrapper } = require('../utils/errorWrap');
const validationError = require('../middleware/validationError');
const { schemeValidation } = require('../validations/scheme');
const checkAuth = require('../middleware/checkAuth');


const express = require('express');

const route = express.Router();

route.post('/', schemeValidation, validationError, checkAuth, wrapper(addScheme)); // add scheme route

route.get('/', checkAuth, wrapper(readScheme)); // read Scheme route

route.get('/:id', checkAuth, wrapper(readSchemeById)); // read scheme by id route

route.put('/:id', checkAuth, schemeValidation, validationError, wrapper(updateScheme));  // update scheme 

route.delete('/:id', checkAuth, wrapper(deactiveScheme)); // deactive scheme


module.exports = route;


