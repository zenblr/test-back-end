const { wrapper } = require('../utils/errorWrap');
const checkAuth = require('../middleware/checkAuth');

const { getDepositData } = require('../utils/depositDataTransfer');
const { getDepositDataOfPrevious } = require('../utils/depositDataTransfer');
const { getWithdrawData } = require('../utils/withdrawDataTransfer');
const { getWithdrawPreviousData } = require('../utils/withdrawDataTransfer');


const express = require('express');
const route = express.Router();

route.post('/deposit-transfer', checkAuth, wrapper(getDepositData));

route.post('/withdraw-transfer', checkAuth, wrapper(getWithdrawData));

//to fetch old data
route.post('/deposit-transfer-previous-data', checkAuth, wrapper(getDepositDataOfPrevious));

route.post('/withdraw-transfer-previous-data', checkAuth, wrapper(getWithdrawPreviousData));

module.exports = route;