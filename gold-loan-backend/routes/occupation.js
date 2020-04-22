const express = require('express');
const { addOccupation, readOccupation,deactiveOccupation } = require('../controllers/occupation/occupation');
const route = express.Router();
const { wrapper } = require('../utils/errorWrap');

const checkAuth = require('../middleware/checkAuth');

route.post('/', checkAuth, wrapper(addOccupation)); // add occupation
route.get('/', checkAuth, wrapper(readOccupation)); // read occupation
route.delete('/',checkAuth,wrapper(deactiveOccupation)); // deactive occupation

module.exports = route;