const { readErrorLogs, getErrorForMail } = require('../controllers/errorLogs/errorLogs');
const { wrapper } = require('../utils/errorWrap');
const express = require('express');
const route = express.Router();
const checkAuth = require('../middleware/checkAuth');

route.get('/', checkAuth, wrapper(readErrorLogs)); // read email alert

route.get('/for-mail', checkAuth, wrapper(getErrorForMail));


module.exports = route;