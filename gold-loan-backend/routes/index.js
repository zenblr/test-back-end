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


const offer = require('./offer'); //Offer Route
router.use('/offer', offer)


const lenderBanner = require('./lenderBanner'); //lenderBanner Route
router.use('/lender-banner', lenderBanner)


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

const scheme = require('./scheme'); // scheme Route
router.use('/scheme',scheme);

const uploadScheme=require('./uploadSchemes'); // upload Scheme Route
router.use('/upload-scheme',uploadScheme);

const roughLoanAmount=require('./roughLoanAmount'); // rough amount calculator
router.use('/rough-amount',roughLoanAmount);

const addressType=require('./addressType'); // address Type
router.use('/address-type',addressType)

module.exports = router;