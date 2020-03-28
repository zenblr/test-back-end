var express = require('express');
var router = express.Router();

//AUTH ROUTE
const auth = require('./auth/auth'); //auth Route
router.use('/auth', auth);


//CUSTOMER ROUTE
const customer = require('./customer/customer'); //Customer Route
router.use('/customer', customer);


//ADMIN ROUTES
const city = require('./admin/city'); //city Route
router.use('/city', city);

const state = require('./admin/state'); //state Route
router.use('/state', state);

const banner = require('./admin/banner'); // banner Route
router.use('/banner', banner)

const uploadfile = require('./admin/fileUpload'); // uploadfile Route
router.use('/upload-file', uploadfile)


module.exports = router;