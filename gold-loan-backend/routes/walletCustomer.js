const express = require('express');
const route = express.Router();

const { wrapper } = require('../utils/errorWrap');
const customerCheckAuth = require('../middleware/customerCheckAuth');
const { makePayment, addAmountWallet, getAllDepositDetails, getWalletDetailById, getTransactionDetails, getWalletBalance, withdrawAmount, getAllBankDetails,  AddCustomerBankDetails, updateCustomerBankDetails} = require('../controllers/wallet/walletCustomer');
const validatiError = require('../middleware/validationError');
const { addWalletAmountValidation } = require('../validations/wallet');
const { addCustomerBankDetails } = require('../validations/bankDetails');

route.get('/deposit-detail', customerCheckAuth, wrapper(getAllDepositDetails));

route.post('/pay', customerCheckAuth, addWalletAmountValidation, validatiError, wrapper(makePayment));

route.post('/add-amount', wrapper(addAmountWallet));

route.get('/transaction-detail', customerCheckAuth,wrapper(getTransactionDetails));

route.post('/withdraw-amount', customerCheckAuth,wrapper(withdrawAmount));

route.get('/wallet-balance', customerCheckAuth,wrapper(getWalletBalance));

route.get('/bank-detail-customer', customerCheckAuth, wrapper(getAllBankDetails));

route.post('/add-bank-details',customerCheckAuth, addCustomerBankDetails,validatiError,wrapper(AddCustomerBankDetails));

route.get('/:depositWithdrawId', customerCheckAuth, wrapper(getWalletDetailById));

route.put('/update-bank-details/:customerBankDetailId', customerCheckAuth, wrapper(updateCustomerBankDetails));


module.exports = route;
