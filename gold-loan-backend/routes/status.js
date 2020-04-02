var express = require('express');
var router = express.Router();

const { wrapper } = require('../utils/errorWrap');

const { addStatus, getStatus, deactivateStatus } = require('../controllers/status/status')
const checkAuth = require('../middleware/checkAuth');


router.post('/', checkAuth, wrapper(addStatus))

router.get('/', checkAuth, wrapper(getStatus));

router.delete('/', checkAuth, wrapper(deactivateStatus))
module.exports = router;