var express = require('express');
var route = express.Router();

const { wrapper } = require('../utils/errorWrap');
const checkAuth = require('../middleware/checkAuth');
const validatiError = require('../middleware/validationError');
const { addAppraiserRequest, updateAppraiserRequest, getAllNewRequest, assignAppraiser, getAssignedRequest } = require('../controllers/appraiserRequest/appraiserRequest');


route.post('/', checkAuth, wrapper(addAppraiserRequest)); // add new request

route.post('/assign-appraiser', checkAuth, wrapper(assignAppraiser)); // ASSIGN APPRAISER

route.put('/:id', checkAuth, wrapper(updateAppraiserRequest)); // update new request

route.get('/view-all', checkAuth, wrapper(getAllNewRequest));//view all new request 

route.get('/my-request', checkAuth, wrapper(getAssignedRequest));//view assigned request 

module.exports = route;