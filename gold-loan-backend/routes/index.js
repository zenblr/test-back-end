var express = require('express');
var router = express.Router();

const auth = require('./auth'); //Auth Route
router.use('/auth', auth);


const user = require('./user'); //User Route
router.use('/user', user);


const customer = require('./customer'); //Customer Route
router.use('/customer', customer);

const appraiserRequest = require('./appraiserRequest'); //leadNewRquest Route
router.use('/appraiser-request', appraiserRequest);

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

const partnerBranchUser = require('./partnerBranchUser'); //Partner Branch User
router.use('/partner-branch-user', partnerBranchUser);

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

const emailAlert = require('./emailAlert'); // email alert
router.use('/email-alert', emailAlert)

const smsAlert = require('./smsAlert');  // sms alert
router.use('/sms-alert', smsAlert)

const query = require('./query'); // customer query
router.use('/customer-query', query)

const customerLoanProcess = require('./customerLoanProcess'); // customer loan process module
router.use('/loan-process', customerLoanProcess);

const loanAccount = require('./loanAccount'); // customer loan account process module
router.use('/loan-account', loanAccount);

const feedBack = require('./feedBack'); // feed back module
router.use('/customer-feedback', feedBack)

const customerClassification = require('./customerClassification')
router.use('/classification', customerClassification)

const rolePermission = require('./rolePermission');
router.use('/role-permission', rolePermission);

const modules = require('./module');
router.use('/modules', modules);

const internalBranch = require('./internalBranch'); // internal branch module
router.use('/internal-branch', internalBranch)

const goldRate = require('./goldRate');
router.use('/gold-rate', goldRate)

const logisticPartner = require('./logisticPartner'); // logistic partner module
router.use('/logistic-partner', logisticPartner)

const karatDetails = require('./karatDetails'); // karat details module
router.use('/karat-details', karatDetails)

const assignAppraiser = require('./customerAssignAppraiser');
router.use('/assign-appraiser', assignAppraiser);

const packet = require('./packet');
router.use('/packet', packet)

const packetTracking = require('./packetTracking'); // PACKET TRACKING DETAILS
router.use('/packet-tracking', packetTracking)

// const globalMap = require('./globalMap'); // GLOBAL MAP
// router.use('/global-map', globalMap)

const uploadPacket = require('./uploadPackets');  //upload Packets List 
router.use('/upload-packets-file', uploadPacket)

const ratingReason = require('./ratingReason');
router.use('/rating-reason', ratingReason)

const holidayMaster = require('./holidayMaster'); // add holiday list master
router.use('/holiday-master', holidayMaster)

const uploadHolidayMaster = require('./uploadHolidayMaster'); // upload holiday list master
router.use('/upload-holiday-master', uploadHolidayMaster)

const purpose = require('./purpose'); // upload purpose list master
router.use('/purpose', purpose)

const ornamentType = require('./ornamentType'); // upload ornamentType list master
router.use('/ornament-type', ornamentType)

const otherCharges = require('./loanOtherChargesMaster'); // upload otherCharges list master
router.use('/other-charges', otherCharges)

const lead = require('./lead');
router.use('/lead', lead)

const packetLocation = require('./packetLocation');
router.use('/packet-location', packetLocation)

const globalSetting = require('./globalSettings');
router.use('/global-setting', globalSetting)

const singleSignOn = require('./singleSignOn');
router.use('/single-sign-on', singleSignOn);

const customerLoanTransfer = require('./customerLoanTransfer');
router.use('/loan-transfer', customerLoanTransfer);

const jewelleryRelese = require('./jewelleryRelease');
router.use('/jewellery-release', jewelleryRelese);

const quickPay = require('./quickPay');
router.use('/quick-pay', quickPay);

const deposit = require('./deposit');// DEPOSIT
router.use('/deposit', deposit);

const partPayment = require('./partPayment');
router.use('/part-payment', partPayment);

const soaOfLoan = require('./soaOfLoan');
router.use('/loan-soa', soaOfLoan);

const product = require('./product');
router.use('/product', product)

const processNote = require('./processNote')
router.use('/process-note', processNote)

const scrapPacket = require('./scrap/scrapPacket'); // Scrap packet
router.use('/scrap/packet', scrapPacket);

const customerScrapProcess = require('./scrap/customerScrapProcess'); // customer scrap process
router.use('/scrap/scrap-process', customerScrapProcess);

const scrapCustomerManagement = require('./scrap/customerManagement'); // customer scrap process
router.use('/scrap/customer', scrapCustomerManagement);

const scrapGlobalSettings = require('./scrap/scrapGlobalSettings'); // customer scrap process
router.use('/scrap/global-setting', scrapGlobalSettings);

const standardDeduction = require('./scrap/standardDeduction'); // customer scrap process
router.use('/scrap/standard-deduction', standardDeduction);

const interestCalculation = require('./interestCalculation');
router.use('/calculation', interestCalculation);

const scrapUploadPacket = require('./scrap/uploadScrapPackets');  //upload Packets List 
router.use('/scrap/upload-packets-file', scrapUploadPacket)

const organizationType = require('./organizationType'); //organization Type Route
router.use('/organization-type', organizationType)

const scrapPacketTracking = require('./scrap/scrapPacketTracking'); // PACKET TRACKING SCRAP
router.use('/scrap/scrap-packet-tracking', scrapPacketTracking);

const scrapPacketLocation = require('./scrap/scrapPacketLocation');
router.use('/scrap/scrap-packet-location', scrapPacketLocation)

const cronList = require('./cronList');
router.use('/cron-list', cronList)

const goldSilverRates = require('./digitalGold/goldSilverRates');
router.use('/digital-gold/rates', goldSilverRates);

const digiGoldCustomer = require('./digitalGold/customer');
router.use('/digital-gold/customer', digiGoldCustomer);

const paymentRoute = require('./digitalGold/razorPay')
router.use('/digital-gold/payment', paymentRoute);

const buyProductRoute = require('./digitalGold/buyProduct')
router.use('/digital-gold/buy', buyProductRoute);

const customerBankRoute = require('./digitalGold/customerBank')
router.use('/digital-gold/customer-bank', customerBankRoute);

const bankRoute = require('./digitalGold/bank')
router.use('/digital-gold/bank', bankRoute);

const sellProductRoute = require('./digitalGold/sell')
router.use('/digital-gold/sell', sellProductRoute); //import sell gold/silver route

const productRoute = require('./digitalGold/product')
router.use('/digital-gold/product', productRoute); 

const cartRoute = require('./digitalGold/cart')
router.use('/digital-gold/cart', cartRoute); 

const withDrawRoute = require('./digitalGold/withdraw')
router.use('/digital-gold/withdraw', withDrawRoute); 

const redeemOrderRoute = require('./digitalGold/redeemOrder')
router.use('/digital-gold/redeem-order', redeemOrderRoute); 

const customerAddressRoute = require('./digitalGold/customerAddress')
router.use('/digital-gold/customer-address', customerAddressRoute);

const customerKycRoute = require('./digitalGold/customerKyc')
router.use('/digital-gold/customer-kyc', customerKycRoute);

const migration = require('./migration');
router.use('/migration', migration)

const configDetail = require('./digitalGold/configDetail')
router.use('/digital-gold/config-detail', configDetail);

module.exports = router;