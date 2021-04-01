
const express = require('express');
const errorWrap = require('../utils/errorWrap'); 
const signOn = require('../controllers/singleSignOn/singleSignOn');
const checkAuth = require('../middleware/checkAuth');

const route = express.Router();

route.post('/', errorWrap.wrapper(signOn.singleSignOnBroker)); 

route.get('/user-data' ,checkAuth,errorWrap.wrapper(signOn.getTokenInfo)  )

module.exports = route;