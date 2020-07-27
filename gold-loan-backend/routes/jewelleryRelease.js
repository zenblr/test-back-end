const express = require('express');
const { partReleaseApplyLoan,uploadDocument,updateAppraiser,updatePartReleaseStatus,partReleaseApprovedList,partReleaseAssignAppraiser,ornamentsDetails, ornamentsAmountDetails,ornamentsPartRelease,getPartReleaseList,updateAmountStatus,getCustomerDetails } = require('../controllers/jewelleryRelease/jewelleryRelease');
const route = express.Router();
const { partReleaseValidation,partReleasePayment,amountStatusValidation,documentValidation, assignAppriserValidation } = require('../validations/jewelleryRelease');
const validatiError = require('../middleware/validationError');
const { wrapper } = require('../utils/errorWrap');
const checkRolePermission = require('../middleware/checkRolesPermissions');

const checkAuth = require('../middleware/checkAuth');

route.get('/part-release',checkAuth,wrapper(getPartReleaseList));

route.get('/part-release-approved_list',checkAuth,wrapper(partReleaseApprovedList));

route.get('/apply-loan/:customerUniqueId', checkAuth, wrapper(partReleaseApplyLoan)); 

route.get('/customer/:customerId', checkAuth, wrapper(getCustomerDetails)); 

route.get('/:masterLoanId', checkAuth, wrapper(ornamentsDetails)); 

route.post('/', checkAuth, wrapper(ornamentsAmountDetails)); 

route.post('/part-release', checkAuth,partReleasePayment,validatiError, wrapper(ornamentsPartRelease)); 

route.put('/amount-status', checkAuth,amountStatusValidation,validatiError, wrapper(updateAmountStatus)); 

route.put('/appraiser-status', checkAuth,partReleaseValidation,validatiError, wrapper(updatePartReleaseStatus)); 

route.post('/assign-appraiser', checkAuth,assignAppriserValidation,validatiError, wrapper(partReleaseAssignAppraiser)); 

route.put('/update-appraiser', checkAuth,assignAppriserValidation,validatiError, wrapper(updateAppraiser)); 

route.post('/document', checkAuth,documentValidation,validatiError, wrapper(uploadDocument)); 


module.exports = route;