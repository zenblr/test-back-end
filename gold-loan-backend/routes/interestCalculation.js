const express = require('express');
const { calculation } = require('../controllers/interestCalculation/interestCalculation');
const route = express.Router();
const { wrapper } = require('../utils/errorWrap');

const checkAuth = require('../middleware/checkAuth');

route.post('/',checkAuth, wrapper(calculation));

module.exports = route;