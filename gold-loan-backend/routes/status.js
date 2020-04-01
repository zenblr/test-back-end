var express = require('express');
var router = express.Router();

const { wrapper } = require('../utils/errorWrap');

const { addStatus, getStatus, deactivateStatus } = require('../controllers/status/status')
const checkAuth = require('../middleware/checkAuth');


router.post('/', checkAuth, addStatus)

router.get('/', checkAuth, getStatus);

router.delete('/', checkAuth, deactivateStatus)
module.exports = router;