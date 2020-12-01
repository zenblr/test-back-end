const migration = require('../controllers/migration/migration');
const { wrapper } = require("../utils/errorWrap");
const express = require("express");
const checkAuth = require('../middleware/checkAuth');


const route = express.Router();

route.get('/',checkAuth, wrapper(migration.schemeMigration)); 

module.exports = route;