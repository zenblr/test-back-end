const express = require('express');
const route = express.Router();
const { wrapper } = require('../utils/errorWrap');
const { addAppraisalRating, readKycSubmmitedCustomer, addBranchManagerRating, readFirstStageVerifiedCustomer, readAllCustomerClassification, readAllCustomerClassificationById, updateAppraisalRating } = require('../controllers/customerClassification/customerClassification')

const checkAuth = require('../middleware/checkAuth');

route.post('/cce', checkAuth, wrapper(addAppraisalRating));

route.put('/cce/:id', checkAuth, wrapper(updateAppraisalRating));

route.get('/cce', checkAuth, wrapper(readKycSubmmitedCustomer));

route.post('/branch-manager', checkAuth, wrapper(addBranchManagerRating));

route.get('/branch-manager', checkAuth, wrapper(readFirstStageVerifiedCustomer));

route.get('/', checkAuth, wrapper(readAllCustomerClassification));

route.get('/:id', checkAuth, wrapper(readAllCustomerClassificationById));

module.exports = route;