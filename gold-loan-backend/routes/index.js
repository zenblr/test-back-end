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


const partnerBranch = require('./partnerBranch'); // branch Route
router.use('/partner-branch', partnerBranch);

const role = require('./role'); // role Route
router.use('/role', role)

const permission = require('./permission'); // permission Route
router.use('/permission', permission);

const scheme = require('./scheme'); // scheme Route
router.use('/scheme', scheme);

const uploadScheme = require('./uploadSchemes'); // upload Scheme Route
router.use('/upload-scheme', uploadScheme);

const roughLoanAmount = require('./roughLoanAmount'); // rough amount calculations
router.use('/rough-amount', roughLoanAmount);

const occupation = require('./occupation'); // occupation
router.use('/occupation', occupation)


const identityType = require('./identityType'); // identity Type
router.use('/identity-type', identityType);

const addressProofType = require('./addressProofType'); // identity Type
router.use('/address-proof-type', addressProofType);

const customerKyc = require('./customerKyc')
router.use('/kyc', customerKyc)

const emailAlert=require('./emailAlert'); // email alert
router.use('/email-alert',emailAlert)

const smsAlert=require('./smsAlert');  // sms alert
router.use('/sms-alert',smsAlert)

const query=require('./query'); // customer query
router.use('/customer-query',query)

const customerLoanProcess = require('./customerLoanProcess'); // customer loan process module
router.use('/loan-process', customerLoanProcess);

const feedBack=require('./feedBack'); // feed back module
router.use('/customer-feedback',feedBack)

const customerClassification = require('./customerClassification')
router.use('/classification', customerClassification)

const rolePermission = require('./rolePermission');
router.use('/role-permission',rolePermission);

const modules = require('./module');
router.use('/modules',modules);

const internalBranch=require('./internalBranch'); // internal branch module
router.use('/internal-branch',internalBranch)

module.exports = router;