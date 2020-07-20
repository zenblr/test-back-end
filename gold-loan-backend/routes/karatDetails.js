const { addKaratDetails, deactiveKaratdetails, readKaratDetails, updateKaratDetails, readKaratDetailsById } = require('../controllers/karatDetails/karatDetails.js');
const express = require('express');
const route = express.Router();
const { wrapper } = require('../utils/errorWrap');
const checkAuth = require('../middleware/checkAuth');
const validationError = require('../middleware/validationError');
const { karatDetailsValidation, karatDedtailsUpdateValidation } = require('../validations/karatDetails');
const checkRolePermission = require('../middleware/checkRolesPermissions');


route.post('/', karatDetailsValidation, validationError, checkAuth, checkRolePermission, wrapper(addKaratDetails));
route.get('/', checkAuth, wrapper(readKaratDetails));
route.delete('/', checkAuth, checkRolePermission, wrapper(deactiveKaratdetails));
route.get('/:id', checkAuth, wrapper(readKaratDetailsById));
route.put('/:id', karatDedtailsUpdateValidation, validationError, checkAuth, checkRolePermission, wrapper(updateKaratDetails));

module.exports = route;