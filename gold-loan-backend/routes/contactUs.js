const express = require('express');
const { contactUsEmail } = require('../controllers/contactUsEmail/contactUsEmail');
const route = express.Router();
const { wrapper } = require('../utils/errorWrap');



route.post('/', wrapper(contactUsEmail));

module.exports = route;