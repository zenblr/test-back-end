var express = require('express');
var router = express.Router();

const auth = require('./auth'); //Auth Route
router.use('/auth', auth);


const user = require('./user'); //User Route
router.use('/user', user);


const customer = require('./customer'); //Customer Route
router.use('/customer', customer);


const city = require('./city'); //City Route
router.use('/city', city);


const state = require('./state'); //State Route
router.use('/state', state);


const banner = require('./banner'); //Banner Route
router.use('/banner', banner)


const uploadfile = require('./fileUpload'); //Uploadfile Route
router.use('/upload-file', uploadfile)


const status = require('./status'); //Status Route
router.use('/status', status)


const rating = require('./rating'); //Rating Route
router.use('/rating', rating)


const stage = require('./stage'); //Stage Route
router.use('/stage', stage)

const partner = require('./partner'); //  partner Route
router.use('/partner', partner);


const branch = require('./branch'); // branch Route
router.use('/branch', branch);

const role= require('./role'); // role Route
router.use('/role',role)

const permission= require('./permission'); // permission Route
router.use('/permission',permission);


module.exports = router;