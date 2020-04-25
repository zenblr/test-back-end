const { readAllModule } = require("../controllers/module/module");
const { wrapper } = require("../utils/errorWrap");
const express = require("express");
const checkAuth = require('../middleware/checkAuth');


const route = express.Router();

route.get('/', checkAuth, wrapper(readAllModule)); 

module.exports = route;