const express = require('express');
const route = express.Router();
const { wrapper } = require('../utils/errorWrap');
const { addAppraisalRating } = require('../controllers/customerClassification/customerClassification')

const checkAuth = require('../middleware/checkAuth');

route.post('/appraisal', checkAuth, wrapper(addAppraisalRating))






module.exports = route;