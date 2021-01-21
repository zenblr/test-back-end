const { wrapper } = require('../utils/errorWrap');
const checkAuth = require('../middleware/checkAuth');

const { getDepositData } = require('../utils/depositDataTransfer');
const { getWithdrawData } = require('../utils/withdrawDataTransfer');


const express = require('express');
const route = express.Router();

route.post('/deposit-transfer', checkAuth, wrapper(getDepositData));

route.post('/withdraw-transfer', checkAuth, wrapper(getWithdrawData));


module.exports = route;