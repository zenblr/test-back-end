const express = require('express');
const route = express.Router();

const { wrapper } = require('../utils/errorWrap');


const { registerSendOtp, verifyRegistrationOtp, resendOtp } = require('../controllers/user/user')

//Register User

route.post('/registerOtp', registerSendOtp);

route.post('/verifyOtp', verifyRegistrationOtp);

route.post('/resendOtp', resendOtp);



module.exports = route;