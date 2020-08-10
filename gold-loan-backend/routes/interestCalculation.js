const express = require('express');
const { interestCalculation, app,interestAmount } = require('../controllers/interestCalculation/interestCalculation');
const route = express.Router();
const { wrapper } = require('../utils/errorWrap');

const checkAuth = require('../middleware/checkAuth');

route.post('/', checkAuth, wrapper(interestCalculation));

route.get('/', checkAuth, wrapper(interestAmount));

route.get('/normal', wrapper(app))

module.exports = route;