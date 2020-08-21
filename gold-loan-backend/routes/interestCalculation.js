const express = require('express');
const { interestCalculation, app,interestAmount,getInterestTableInExcel,interestCalculationOneLoan,getTransactionDetailTable,interestCalculationUpdate } = require('../controllers/interestCalculation/interestCalculation');
const route = express.Router();
const { wrapper } = require('../utils/errorWrap');

const checkAuth = require('../middleware/checkAuth');

route.post('/', checkAuth, wrapper(interestCalculation));

route.post('/loan', checkAuth, wrapper(interestCalculationOneLoan));

route.post('/update-interest', checkAuth, wrapper(interestCalculationUpdate));

route.get('/', checkAuth, wrapper(interestAmount));

route.get('/interest-table', checkAuth, wrapper(getInterestTableInExcel));

route.get('/transaction-table', checkAuth, wrapper(getTransactionDetailTable));

route.get('/normal', wrapper(app))

module.exports = route;