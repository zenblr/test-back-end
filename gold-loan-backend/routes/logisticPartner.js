const { addLogisticPartner, readLogisticPartner, readLogisticPartnerById, updateLogisticPartner, deactiveLogisticPartner, getAllLogisticPartner } = require('../controllers/logisticPartner/logisticPartner');
const { wrapper } = require('../utils/errorWrap');
const validationError = require('../middleware/validationError');
const { logisticPartnerUpdateValidation, logisticPartnerValidation } = require('../validations/logisticPartner');
const checkAuth = require('../middleware/checkAuth');
const express = require('express');
const route = express.Router();

route.post('/', logisticPartnerValidation, validationError, checkAuth, wrapper(addLogisticPartner)); // add logistic partner

route.get('/', checkAuth, wrapper(readLogisticPartner)); // read logistic partner

route.get('/get-all-logistic-partner', checkAuth, wrapper(getAllLogisticPartner)); // read logistic partner without pagination

route.delete('/', checkAuth, wrapper(deactiveLogisticPartner)); // delete logistic partner

route.get('/:id', checkAuth, wrapper(readLogisticPartnerById)); // read logistic partner by id

route.put('/:id', logisticPartnerUpdateValidation, validationError, checkAuth, wrapper(updateLogisticPartner)); // update logistic partner


module.exports = route;