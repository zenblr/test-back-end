const express = require('express');
const { penalInterestCalculationCron,interestCalculationCron,interestCalculation, app,interestAmount,getInterestTableInExcel,interestCalculationOneLoan,getTransactionDetailTable,interestCalculationUpdate } = require('../controllers/interestCalculation/interestCalculation');
const route = express.Router();
const { wrapper } = require('../utils/errorWrap');

const checkAuth = require('../middleware/checkAuth');

route.post('/', checkAuth, wrapper(interestCalculation));

route.post('/loan', checkAuth, wrapper(interestCalculationOneLoan));
////cron api
route.post('/interest-cron', checkAuth, wrapper(interestCalculationCron));
////cron api
route.post('/penal-cron', checkAuth, wrapper(penalInterestCalculationCron));

route.post('/update-interest', checkAuth, wrapper(interestCalculationUpdate));

route.get('/', checkAuth, wrapper(interestAmount));

route.get('/interest-table', checkAuth, wrapper(getInterestTableInExcel));

route.get('/transaction-table', checkAuth, wrapper(getTransactionDetailTable));

route.get('/normal', wrapper(app))

module.exports = route;