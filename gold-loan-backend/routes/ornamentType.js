var express = require('express');
var router = express.Router();

const { wrapper } = require('../utils/errorWrap');

const { addOrnamentType, getOrnamentType, updateOrnamentType, deactivateOrnamentType } = require('../controllers/ornamentType/ornamentType');
const checkAuth = require('../middleware/checkAuth');
const checkRolePermission = require('../middleware/checkRolesPermissions');


router.post('/', checkAuth, checkRolePermission, wrapper(addOrnamentType))

router.get('/', checkAuth, wrapper(getOrnamentType));

router.put('/:id', checkAuth, checkRolePermission, wrapper(updateOrnamentType))

router.delete('/', checkAuth, checkRolePermission, wrapper(deactivateOrnamentType))
module.exports = router;