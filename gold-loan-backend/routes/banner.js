const express = require('express');
const { addUpdateBanner, readBanner, deleteBanner } = require('../controllers/banner/banner');
const route = express.Router();
const { wrapper } = require('../utils/errorWrap');

const checkAuth = require('../middleware/checkAuth');

route.post('/', checkAuth, wrapper(addUpdateBanner));
route.get('/', checkAuth, wrapper(readBanner));
// route.delete('/:id', checkAuth, wrapper(deleteBanner));

module.exports = route;