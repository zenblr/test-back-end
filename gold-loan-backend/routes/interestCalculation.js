const express = require('express');
const { interestCalculation } = require('../controllers/interestCalculation/interestCalculation');
const route = express.Router();
const { wrapper } = require('../utils/errorWrap');

const checkAuth = require('../middleware/checkAuth');

route.post('/',checkAuth, wrapper(interestCalculation));

module.exports = route;