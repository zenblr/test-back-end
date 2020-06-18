var express = require('express');
var router = express.Router();

const { wrapper } = require('../utils/errorWrap');

const { addOrnamentType, getOrnamentType, updateOrnamentType, deactivateOrnamentType } = require('../controllers/ornamentType/ornamentType');
const checkAuth = require('../middleware/checkAuth');


router.post('/', checkAuth, wrapper(addOrnamentType))

router.get('/', checkAuth, wrapper(getOrnamentType));

router.put('/:id', checkAuth, wrapper(updateOrnamentType))

router.delete('/', checkAuth, wrapper(deactivateOrnamentType))
module.exports = router;