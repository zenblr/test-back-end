const { wrapper } = require('../utils/errorWrap');
const checkAuth = require('../middleware/checkAuth');

const { getAllDeposits, updateDepositStatus } = require('../controllers/deposit/deposit');

const express = require('express');
const route = express.Router();

route.get('/',checkAuth,wrapper(getAllDeposits));//FETCH ALL DEPOSITS LIST

route.put('/:id',checkAuth,wrapper(updateDepositStatus));//UPDATE DEPOSIT STATUS

module.exports = route;  