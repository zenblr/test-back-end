const { readAllProduct } = require("../controllers/product/product");
const { wrapper } = require("../utils/errorWrap");
const express = require("express");
const checkAuth = require('../middleware/checkAuth');


const route = express.Router();

route.get('/', checkAuth, wrapper(readAllProduct)); 

module.exports = route;