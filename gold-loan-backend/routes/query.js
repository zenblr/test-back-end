const { addQuery, readQuery, deactiveQuery, updateQuery, readQueryById } = require('../controllers/query_feedBack/query');
// const validationError =require('../middleware/validationError');
const { wrapper } = require('../utils/errorWrap');
const checkAuth = require('../middleware/checkAuth');

const express = require('express');
const route = express.Router();

route.post('/', checkAuth, wrapper(addQuery));
route.get('/', checkAuth, wrapper(readQuery));
route.delete('/', checkAuth, wrapper(deactiveQuery))
route.get('/:id', checkAuth, wrapper(readQueryById));
route.put('/:id', checkAuth, wrapper(updateQuery));

module.exports = route;   