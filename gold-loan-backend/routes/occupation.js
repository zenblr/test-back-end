const express = require('express');
const { addOccupation, readOccupation } = require('../controllers/occupation/occupation');
const route = express.Router();
const { wrapper } = require('../utils/errorWrap');

const checkAuth = require('../middleware/checkAuth');

route.post('/', checkAuth, wrapper(addOccupation));
route.get('/', checkAuth, wrapper(readOccupation));

module.exports = route;