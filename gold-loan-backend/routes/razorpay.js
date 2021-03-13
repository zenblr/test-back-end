var express = require('express');
var router = express.Router();

const { wrapper } = require('../utils/errorWrap');

const { razorPayCreateOrder } = require('../controllers/razorpay/razorpay');
const checkAuth = require('../middleware/checkAuth');


router.post('/', checkAuth, wrapper(razorPayCreateOrder))


module.exports = router;