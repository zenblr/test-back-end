var express = require('express');
var router = express.Router();

const { wrapper } = require('../utils/errorWrap');

const {getSoa } = require('../controllers/soaOfLoan/soaOfLoan');
const checkAuth = require('../middleware/checkAuth');


router.post('/', checkAuth, wrapper(getSoa));

module.exports = router;