const express = require('express');
const route = express.Router();
const { wrapper } = require('../utils/errorWrap');

const { getMapDetails } = require('../controllers/globalMap/globalMap');

route.get('/map-info', wrapper(getMapDetails))

module.exports = route;