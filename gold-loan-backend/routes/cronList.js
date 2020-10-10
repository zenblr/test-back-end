const { wrapper } = require('../utils/errorWrap');
const checkAuth = require('../middleware/checkAuth');


const express = require('express');
const route = express.Router();
let {getAllCronList} = require('../controllers/cronList/cronList')
const checkRolePermission = require('../middleware/checkRolesPermissions');


route.get('/', checkAuth, wrapper(getAllCronList));

// route.put('/:id', checkAuth, wrapper(updateDepositStatus));//UPDATE DEPOSIT STATUS

module.exports = route;  