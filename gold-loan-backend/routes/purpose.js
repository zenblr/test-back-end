var express = require('express');
var router = express.Router();

const { wrapper } = require('../utils/errorWrap');

const { addPurpose, getPurpose, updatePurpose, deactivatePurpose } = require('../controllers/purpose/purpose');
const checkAuth = require('../middleware/checkAuth');
const checkRolePermission = require('../middleware/checkRolesPermissions');


router.post('/', checkAuth, checkRolePermission, wrapper(addPurpose))

router.get('/', checkAuth, wrapper(getPurpose));

router.put('/:id', checkAuth, checkRolePermission, wrapper(updatePurpose))

router.delete('/', checkAuth, checkRolePermission, wrapper(deactivatePurpose))
module.exports = router;