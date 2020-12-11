const express = require('express');
const route = express.Router();

const { wrapper } = require('../utils/errorWrap');
const customerCheckAuth = require('../middleware/customerCheckAuth');
const { makePayment, addAmountWallet, getAllDepositDetails, getWalletDetailByIdAdmin, getTransactionDetails, getWalletBalance, withdrawAmount } = require('../controllers/wallet/walletCustomer');
const validatiError = require('../middleware/validationError');
const { addWalletAmountValidation } = require('../validations/wallet');

route.get('/deposit-detail', customerCheckAuth, wrapper(getAllDepositDetails));

route.post('/pay', customerCheckAuth, addWalletAmountValidation, validatiError, wrapper(makePayment));

route.post('/add-amount', wrapper(addAmountWallet));

route.get('/transaction-detail', customerCheckAuth,wrapper(getTransactionDetails));

route.post('/withdraw-amount', customerCheckAuth,wrapper(withdrawAmount));

route.get('/wallet-balance', customerCheckAuth,wrapper(getWalletBalance));

route.get('/:depositWithdrawId', customerCheckAuth, wrapper(getWalletDetailByIdAdmin));

module.exports = route;
