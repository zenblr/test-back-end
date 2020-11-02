const express = require('express');
const { addUpdateProcessNote, readProcessNote, deleteProcessNote } = require('../controllers/processNote/processNote');
const route = express.Router();
const { wrapper } = require('../utils/errorWrap');

const checkAuth = require('../middleware/checkAuth');
const checkRolePermission = require('../middleware/checkRolesPermissions');


route.post('/', checkAuth, wrapper(addUpdateProcessNote));
route.get('/', checkAuth, wrapper(readProcessNote));
// route.delete('/:id', checkAuth, wrapper(deleteBanner));

module.exports = route;