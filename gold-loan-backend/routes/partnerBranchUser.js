const express = require('express');
const route = express.Router();

const { wrapper } = require('../utils/errorWrap');
const checkAuth = require('../middleware/checkAuth');

const { addPartnerBranchUser ,updatePartnerBranchUser ,readPartnerBranchUser,readPartnerBranchUserById,deactivatePartnerBranchUser,getBranchByPartnerId} = require('../controllers/partnerBranchUser/partnerBranchUser');
const { partnerBranchUserValidation } = require('../validations/partnerBranchUser');
const validationError = require('../middleware/validationError')

route.get('/:id',checkAuth,wrapper(getBranchByPartnerId));//FETCH ALL PARTNER BRANCH BY PARTNER

route.post('/',checkAuth,partnerBranchUserValidation ,validationError,wrapper(addPartnerBranchUser));//ADD PARTNER BRANCH USER

route.put('/:id',checkAuth,wrapper(updatePartnerBranchUser));//UPDATE PARTNER BRANCH USER

route.get('/',checkAuth,wrapper(readPartnerBranchUser));//FETCH  All PARTNER BRANCH USER

route.get('/single-user',checkAuth,wrapper(readPartnerBranchUserById));//FETCH SINGLE PARTNER BRANCH USER

route.delete('/',checkAuth,wrapper(deactivatePartnerBranchUser));//DEACTIVATE USER



module.exports = route;