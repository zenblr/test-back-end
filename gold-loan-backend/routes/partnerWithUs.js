const express = require('express');
const { partnerUsEmail } = require('../controllers/partnerWithUs/partnerUsEmail');
const route = express.Router();
const { wrapper } = require('../utils/errorWrap');



route.post('/', wrapper(partnerUsEmail));

module.exports = route;