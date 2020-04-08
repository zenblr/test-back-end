const express = require('express');
const { addUpdateOffer, readOffer } = require('../controllers/offer/offer');
const route = express.Router();
const { wrapper } = require('../utils/errorWrap');

const checkAuth = require('../middleware/checkAuth');

route.post('/', checkAuth, wrapper(addUpdateOffer));
route.get('/', checkAuth, wrapper(readOffer));

module.exports = route;