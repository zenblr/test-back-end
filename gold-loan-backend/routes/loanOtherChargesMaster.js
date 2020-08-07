var express = require('express');
var router = express.Router();

const { wrapper } = require('../utils/errorWrap');

const checkAuth = require('../middleware/checkAuth');
const checkRolePermission = require('../middleware/checkRolesPermissions');

const { addOtherCharges, getOtherCharges, updateOtherCharges, deactivateOtherCharges } = require('../controllers/loanOtherChargesMaster/loanOthersChargesMaster');

router.post('/', checkAuth, wrapper(addOtherCharges))

router.get('/', checkAuth, wrapper(getOtherCharges));

router.put('/:id', checkAuth, wrapper(updateOtherCharges))

router.delete('/:id', checkAuth, wrapper(deactivateOtherCharges))
module.exports = router;