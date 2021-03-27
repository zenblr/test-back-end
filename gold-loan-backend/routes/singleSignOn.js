
const express = require('express');
const errorWrap = require('../utils/errorWrap'); 
const signOn = require('../controllers/singleSignOn/singleSignOn');

const route = express.Router();

route.post('/', errorWrap.wrapper(signOn.singleSignOnBroker)); 

module.exports = route;