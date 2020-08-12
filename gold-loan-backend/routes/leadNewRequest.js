var express = require('express');
var route = express.Router();

const { wrapper } = require('../utils/errorWrap');
const checkAuth = require('../middleware/checkAuth');
const validatiError = require('../middleware/validationError');
const { addLeadNewRequest, updateLeadNewRequest, getAllNewRequest, assignAppraiser, getAssignedRequest } = require('../controllers/leadNewRequest/leadNewRequest');

const { addleadNewRequestValidation ,updateleadNewRequestValidation} = require('../validations/leadNewRequest')

route.post('/', checkAuth, wrapper(addLeadNewRequest)); // add new request

route.put('/assign-appraiser/:id', checkAuth, wrapper(assignAppraiser)); // ASSIGN APPRAISER

route.put('/:id', checkAuth, wrapper(updateLeadNewRequest)); // update new request

route.get('/view-all', checkAuth, wrapper(getAllNewRequest));//view all new request 

route.get('/my-request', checkAuth, wrapper(getAssignedRequest));//view assigned request 

module.exports = route;