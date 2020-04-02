const { addPartner, readPartner, updatePartner, deletePartner, readPartnerById } = require('../controllers/partner/partner');
const { wrapper } = require('../utils/errorWrap');
const express = require('express');
const checkAuth = require('../middleware/checkAuth');

const route = express.Router();

route.post('/', checkAuth, wrapper(addPartner)); // add partner

route.get('/', checkAuth, wrapper(readPartner)); // read partner

route.put('/:id', checkAuth, wrapper(updatePartner)); // update partner

route.delete('/:id', checkAuth, wrapper(deletePartner)); // delete partner

route.get('/:id', checkAuth, wrapper(readPartnerById)); // read by id partner

module.exports = route;