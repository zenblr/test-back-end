const express = require('express');
const route = express.Router();
const { wrapper } = require('../utils/errorWrap');
const { addAssignAppraiser, editAssignAppraiser, getListAssignAppraiser, getSingleAssign } = require('../controllers/assignAppraiser/assignAppraiser')

const checkAuth = require('../middleware/checkAuth');
const checkRolePermission = require('../middleware/checkRolesPermissions');


route.post('/', checkAuth, checkRolePermission, wrapper(addAssignAppraiser));

route.get('/', checkAuth, checkRolePermission, wrapper(getListAssignAppraiser))

route.put('/:id', checkAuth, checkRolePermission, wrapper(editAssignAppraiser))

route.get('/:id', checkAuth, checkRolePermission, wrapper(getSingleAssign))

module.exports = route;