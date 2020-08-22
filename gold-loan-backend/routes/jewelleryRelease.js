const express = require('express');
const { partReleaseApplyLoan,getFullReleaseList,uploadDocument,updateAppraiser,updatePartReleaseStatus,partReleaseApprovedList,partReleaseAssignAppraiser,ornamentsDetails, ornamentsAmountDetails,ornamentsPartRelease,getPartReleaseList,updateAmountStatus,getCustomerDetails,ornamentsFullRelease,updateAmountStatusFullRelease,fullReleaseAssignReleaser,updateReleaser,getFullReleaseApprovedList,updatePartReleaseReleaserStatus,uploadDocumentFullRelease } = require('../controllers/jewelleryRelease/jewelleryRelease');
const route = express.Router();
const { partReleaseValidation,partReleasePayment,amountStatusValidation,documentValidation, assignAppriserValidation,documentValidationFullRelease,fullReleaseValidation,assignReleaserValidationFullRelease,
amountStatusValidationfullRelease,fullReleasePayment } = require('../validations/jewelleryRelease');
const validatiError = require('../middleware/validationError');
const { wrapper } = require('../utils/errorWrap');
const checkRolePermission = require('../middleware/checkRolesPermissions');

const checkAuth = require('../middleware/checkAuth');

route.get('/part-release',checkAuth,checkRolePermission,wrapper(getPartReleaseList));

route.get('/full-release',checkAuth,checkRolePermission,wrapper(getFullReleaseList));

route.get('/part-release-approved_list',checkAuth,checkRolePermission,wrapper(partReleaseApprovedList));

route.get('/full-release-approved_list',checkAuth,checkRolePermission,wrapper(getFullReleaseApprovedList));

route.get('/apply-loan/:customerUniqueId', checkAuth, wrapper(partReleaseApplyLoan)); 

route.get('/customer/:customerId', checkAuth, wrapper(getCustomerDetails)); 

route.get('/:masterLoanId', checkAuth,checkRolePermission, wrapper(ornamentsDetails)); 

route.post('/', checkAuth,checkRolePermission, wrapper(ornamentsAmountDetails)); 

route.post('/part-release', checkAuth,checkRolePermission,partReleasePayment,validatiError, wrapper(ornamentsPartRelease)); 

route.put('/amount-status', checkAuth,checkRolePermission,amountStatusValidation,validatiError, wrapper(updateAmountStatus)); 

route.put('/appraiser-status', checkAuth,checkRolePermission,partReleaseValidation,validatiError, wrapper(updatePartReleaseStatus)); 

route.post('/assign-appraiser', checkAuth,checkRolePermission,assignAppriserValidation,validatiError, wrapper(partReleaseAssignAppraiser)); 

route.put('/update-appraiser', checkAuth,checkRolePermission,assignAppriserValidation,validatiError, wrapper(updateAppraiser)); 

route.post('/document', checkAuth,checkRolePermission,documentValidation,validatiError, wrapper(uploadDocument)); 

route.post('/full-release/document', checkAuth,checkRolePermission,documentValidationFullRelease,validatiError, wrapper(uploadDocumentFullRelease)); 

route.post('/full-release', checkAuth,checkRolePermission,fullReleasePayment,validatiError, wrapper(ornamentsFullRelease)); 

route.put('/full-release/amount-status', checkAuth,checkRolePermission,amountStatusValidationfullRelease,validatiError, wrapper(updateAmountStatusFullRelease));

route.post('/assign-releaser', checkAuth,checkRolePermission,assignReleaserValidationFullRelease,validatiError, wrapper(fullReleaseAssignReleaser)); 

route.put('/update-releaser', checkAuth,checkRolePermission,assignReleaserValidationFullRelease,validatiError, wrapper(updateReleaser)); 

route.put('/releaser-status', checkAuth,checkRolePermission,fullReleaseValidation,validatiError, wrapper(updatePartReleaseReleaserStatus)); 

module.exports = route;