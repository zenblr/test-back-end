const { AddPartner, ReadPartner, UpdatePartner, DeletePartner, ReadPartnerById } = require('../controllers/partner/partner');
const { wrapper } = require('../utils/errorWrap');
const express = require('express');
const checkAuth = require('../middleware/checkAuth');

const route = express.Router();

route.post('/', checkAuth, wrapper(AddPartner)); // add partner

route.get('/', checkAuth, wrapper(ReadPartner)); // read partner

route.put('/:id', checkAuth, wrapper(UpdatePartner)); // update partner

route.delete('/:id', checkAuth, wrapper(DeletePartner)); // delete partner

route.get('/:id', checkAuth, wrapper(ReadPartnerById)); // read by id partner

module.exports = route;