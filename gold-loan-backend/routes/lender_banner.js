const express = require('express');
const { addUpdateLenderBanner, readLenderBanner } = require('../controllers/lender_banner/lender_banner');
const route = express.Router();
const { wrapper } = require('../utils/errorWrap');

const checkAuth = require('../middleware/checkAuth');

route.post('/', checkAuth, wrapper(addUpdateLenderBanner));
route.get('/', checkAuth, wrapper(readLenderBanner));

module.exports = route;