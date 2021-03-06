var express = require('express');
var route = express.Router();

const { wrapper } = require('../utils/errorWrap');
const checkAuth = require('../middleware/checkAuth');
const validatiError = require('../middleware/validationError');
const { addAppraiserRequest, updateAppraiserRequest, updateAppraiser, getAllNewRequest, assignAppraiser, getAssignedRequest } = require('../controllers/appraiserRequest/appraiserRequest');
const checkRolePermission = require('../middleware/checkRolesPermissions');


route.post('/', checkAuth, wrapper(addAppraiserRequest)); // add new request

route.post('/assign-appraiser', checkAuth, wrapper(assignAppraiser)); // ASSIGN APPRAISER

route.put('/update-appraiser', checkAuth, wrapper(updateAppraiser)); // update new request

route.put('/:id', checkAuth, wrapper(updateAppraiserRequest)); // update new request

route.get('/view-all', checkAuth, checkRolePermission, wrapper(getAllNewRequest));//view all new request 

route.get('/my-request', checkAuth, wrapper(getAssignedRequest));//view assigned request 

module.exports = route;