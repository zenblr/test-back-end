const express = require('express');
const { addOccupation, readOccupation,deactiveOccupation,updateOccupation } = require('../controllers/occupation/occupation');
const route = express.Router();
const { wrapper } = require('../utils/errorWrap');
const validationError=require('../middleware/validationError');
const{addOccupationValidation,updateOccupationValidation}=require('../validations/occupation.js');

const checkAuth = require('../middleware/checkAuth');

route.post('/',validationError,addOccupationValidation, checkAuth, wrapper(addOccupation)); // add occupation
route.get('/', checkAuth, wrapper(readOccupation)); // read occupation
route.delete('/',checkAuth,wrapper(deactiveOccupation)); // deactive occupation
route.put('/:id',updateOccupationValidation,validationError,checkAuth,wrapper(updateOccupation)); // update identity type


module.exports = route;