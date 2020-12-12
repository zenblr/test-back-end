const { refundCron } = require("../controllers/razorpay/razorpay");
const { wrapper } = require("../utils/errorWrap");

const express = require("express");
const checkAuth = require('../middleware/checkAuth');


const route = express.Router();

route.post('/', checkAuth, wrapper(refundCron)); 

module.exports = route;