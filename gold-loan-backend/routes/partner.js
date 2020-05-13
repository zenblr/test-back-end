const { addPartner, readPartner, updatePartner, deletePartner, readPartnerById } = require('../controllers/partner/partner');
const validationError =require('../middleware/validationError');
const {partnerValidation,partnerUpdateValidation}=require('../validations/partner');
const { wrapper } = require('../utils/errorWrap');
const express = require('express');
const checkAuth = require('../middleware/checkAuth');

const route = express.Router();

route.post('/',partnerValidation,validationError, checkAuth, wrapper(addPartner)); // add partner

route.get('/', checkAuth, wrapper(readPartner)); // read partner

route.put('/:id',partnerUpdateValidation,validationError, checkAuth, wrapper(updatePartner)); // update partner

route.delete('/', checkAuth, wrapper(deletePartner)); // delete partner

route.get('/:id', checkAuth, wrapper(readPartnerById)); // read by id partner

module.exports = route;