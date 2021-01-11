const express = require('express');
const route = express.Router();

const { wrapper } = require('../utils/errorWrap');
const checkAuth = require('../middleware/checkAuth');
const { getAllDepositWithdrawDetailsAdmin, updateDepositWithdrawStatus, getWalletDetailByIdAdmin, getwithdrawDetail, getDepositReuest } = require('../controllers/wallet/wallet');
const validatiError = require('../middleware/validationError');
const { editWalletStatusValidation } = require('../validations/wallet');

route.get('/get-request-admin', checkAuth, wrapper(getAllDepositWithdrawDetailsAdmin));

route.get('/withdraw-detail-report', checkAuth, wrapper(getwithdrawDetail));

route.get('/deposit-detail-report', checkAuth, wrapper(getDepositReuest));

route.put('/:depositWithdrawId', checkAuth, editWalletStatusValidation, validatiError, wrapper(updateDepositWithdrawStatus));

route.get('/:depositWithdrawId', checkAuth, wrapper(getWalletDetailByIdAdmin));


module.exports = route;   
