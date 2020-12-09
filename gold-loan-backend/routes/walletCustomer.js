const express = require('express');
const route = express.Router();

const { wrapper } = require('../utils/errorWrap');
const customerCheckAuth = require('../middleware/customerCheckAuth');
const { makePayment, addAmountWallet, getAllDepositDetails, getWalletDetailByIdAdmin, getTransactionDetails, getWalletBalance } = require('../controllers/wallet/walletCustomer');
const validatiError = require('../middleware/validationError');
const { addWalletAmountValidation } = require('../validations/wallet');

route.get('/', customerCheckAuth, wrapper(getAllDepositDetails));

route.post('/pay', customerCheckAuth, addWalletAmountValidation, validatiError, wrapper(makePayment));

route.post('/add-amount', wrapper(addAmountWallet));

route.get('/:depositWithdrawId', customerCheckAuth, wrapper(getWalletDetailByIdAdmin));

route.get('/transaction-detail', customerCheckAuth,wrapper(getTransactionDetails));

route.get('/wallet-balance', customerCheckAuth,wrapper(getWalletBalance));

module.exports = route;
