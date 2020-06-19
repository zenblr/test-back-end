var express = require('express');
var router = express.Router();

const { wrapper } = require('../utils/errorWrap');

const { addPurpose, getPurpose, updatePurpose, deactivatePurpose } = require('../controllers/purpose/purpose');
const checkAuth = require('../middleware/checkAuth');


router.post('/', checkAuth, wrapper(addPurpose))

router.get('/', checkAuth, wrapper(getPurpose));

router.put('/:id', checkAuth, wrapper(updatePurpose))

router.delete('/', checkAuth, wrapper(deactivatePurpose))
module.exports = router;