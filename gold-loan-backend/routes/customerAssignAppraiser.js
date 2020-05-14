const express = require('express');
const route = express.Router();
const { wrapper } = require('../utils/errorWrap');
const { addAssignAppraiser, editAssignAppraiser, getListAssignAppraiser, getSingleAssign } = require('../controllers/assignAppraiser/assignAppraiser')

const checkAuth = require('../middleware/checkAuth');

route.post('/', checkAuth, wrapper(addAssignAppraiser));

route.get('/', checkAuth, wrapper(getListAssignAppraiser))

route.put('/:id', checkAuth, wrapper(editAssignAppraiser))

route.get('/:id', checkAuth, wrapper(getSingleAssign))

module.exports = route;