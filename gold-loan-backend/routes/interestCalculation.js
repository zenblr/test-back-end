const express = require('express');
const { interestCalculation, app,interestAmount,getInterestTableInExcel,interestCalculationOneLoan,getTransactionDetailTable } = require('../controllers/interestCalculation/interestCalculation');
const route = express.Router();
const { wrapper } = require('../utils/errorWrap');

const checkAuth = require('../middleware/checkAuth');

route.post('/', checkAuth, wrapper(interestCalculation));

route.post('/loan', checkAuth, wrapper(interestCalculationOneLoan));

route.get('/', checkAuth, wrapper(interestAmount));

route.get('/interest-table', checkAuth, wrapper(getInterestTableInExcel));

route.get('/transaction-table', checkAuth, wrapper(getTransactionDetailTable));

route.get('/normal', wrapper(app))

module.exports = route;