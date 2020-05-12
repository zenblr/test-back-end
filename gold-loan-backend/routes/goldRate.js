const express = require('express');
const route = express.Router();
const { wrapper } = require('../utils/errorWrap');
const {addGoldRate, readGoldRate} = require('./../controllers/goldRate/goldRate')
const checkAuth = require('../middleware/checkAuth');

route.post('/', checkAuth, wrapper(addGoldRate));
route.get('/', checkAuth, wrapper(readGoldRate));
// route.delete('/:id', checkAuth, wrapper(deleteBanner));

module.exports = route;