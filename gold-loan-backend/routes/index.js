var express = require('express');
var router = express.Router();

//AUTH ROUTE
const auth = require('./auth'); //auth Route
router.use('/auth', auth);


//CUSTOMER ROUTE
const customer = require('./customer'); //Customer Route
router.use('/customer', customer);


//ADMIN ROUTES
const city = require('./city'); //city Route
router.use('/city', city);

const state = require('./state'); //state Route
router.use('/state', state);

const banner = require('./banner'); // banner Route
router.use('/banner', banner)

const uploadfile = require('./fileUpload'); // uploadfile Route
router.use('/upload-file', uploadfile)


module.exports = router;