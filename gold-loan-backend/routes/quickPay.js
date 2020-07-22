const { wrapper } = require('../utils/errorWrap');
const checkAuth = require('../middleware/checkAuth');
const { getInterestTable, getInterestInfo } = require('../controllers/quickPay/quickPay');

const express = require('express');
const route = express.Router();

route.get('/interest-table', checkAuth, wrapper(getInterestTable));

route.get('/interest-info', checkAuth, wrapper(getInterestInfo))


module.exports = route;   
