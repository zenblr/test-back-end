const express = require('express');
const route = express.Router();
const { wrapper } = require('../utils/errorWrap');
const { addCceRating, readKycSubmmitedCustomer, addBranchManagerRating, readFirstStageVerifiedCustomer, readAllCustomerClassification, readAllCustomerClassificationById, updateCceRating } = require('../controllers/customerClassification/customerClassification')

const checkAuth = require('../middleware/checkAuth');

route.post('/cce', checkAuth, wrapper(addCceRating));

route.put('/cce/:id', checkAuth, wrapper(updateCceRating));

route.get('/cce', checkAuth, wrapper(readKycSubmmitedCustomer));

route.post('/branch-manager', checkAuth, wrapper(addBranchManagerRating));

route.get('/branch-manager', checkAuth, wrapper(readFirstStageVerifiedCustomer));

route.get('/', checkAuth, wrapper(readAllCustomerClassification));

route.get('/:id', checkAuth, wrapper(readAllCustomerClassificationById));

module.exports = route;