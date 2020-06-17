var express = require('express');
var router = express.Router();

const { wrapper } = require('../utils/errorWrap');

const { addPacketLocation, getPacketLocation,  updatePacketLocation ,deactivatePacketLoaction } = require('../controllers/packetLocation/packetLoaction');
const checkAuth = require('../middleware/checkAuth');


router.post('/', checkAuth, wrapper(addPacketLocation));

router.get('/', checkAuth, wrapper(getPacketLocation));

router.put('/:id', checkAuth, wrapper(updatePacketLocation))

router.delete('/', checkAuth, wrapper(deactivatePacketLoaction))
module.exports = router;