const express = require('express');
const route = express.Router();

const { wrapper } = require('../utils/errorWrap');
const checkAuth = require('../middleware/checkAuth');
const { getAllDepositWithdrawDetailsAdmin, updateDepositWithdrawStatus, getWalletDetailByIdAdmin } = require('../controllers/wallet/wallet');
const validatiError = require('../middleware/validationError');
const { editWalletStatusValidation } = require('../validations/wallet');

route.get('/get-request-admin', checkAuth, wrapper(getAllDepositWithdrawDetailsAdmin));

route.put('/:depositWithdrawId', checkAuth, editWalletStatusValidation, validatiError, wrapper(updateDepositWithdrawStatus));

route.get('/:depositWithdrawId', checkAuth, wrapper(getWalletDetailByIdAdmin));



module.exports = route;   
