var express = require('express');
var router = express.Router();

const { wrapper } = require('../utils/errorWrap');

const { addLead, getLead, updateLead, deactivateLead } = require('../controllers/lead/lead');
const checkAuth = require('../middleware/checkAuth');
const checkRolePermission = require('../middleware/checkRolesPermissions');



router.post('/', checkAuth, checkRolePermission, wrapper(addLead))

router.get('/', checkAuth, wrapper(getLead));

router.put('/:id', checkAuth, checkRolePermission, wrapper(updateLead))

router.delete('/', checkAuth, checkRolePermission, wrapper(deactivateLead))
module.exports = router;