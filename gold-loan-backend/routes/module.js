const { readAllModule, readAllRequestModule } = require("../controllers/module/module");
const { wrapper } = require("../utils/errorWrap");
const express = require("express");
const checkAuth = require('../middleware/checkAuth');


const route = express.Router();

route.get('/', checkAuth, wrapper(readAllModule));

route.get('/appraiser-request-module', checkAuth, wrapper(readAllRequestModule))

module.exports = route;