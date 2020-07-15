var express = require('express');
var router = express.Router();

const { wrapper } = require('../utils/errorWrap');

const { addPacketLocation, getPacketLocation, updatePacketLocation, deactivatePacketLoaction } = require('../controllers/packetLocation/packetLoaction');
const checkAuth = require('../middleware/checkAuth');
const checkRolePermission = require('../middleware/checkRolesPermissions');


router.post('/', checkAuth, checkRolePermission, wrapper(addPacketLocation));

router.get('/', checkAuth, wrapper(getPacketLocation));

router.put('/:id', checkAuth, checkRolePermission, wrapper(updatePacketLocation))

router.delete('/', checkAuth, checkRolePermission, wrapper(deactivatePacketLoaction))
module.exports = router;