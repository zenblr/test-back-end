var express = require('express');
var router = express.Router();

const { wrapper } = require('../utils/errorWrap');

const { addStatus, getStatus, deactivateStatus } = require('../controllers/status/status')

router.post('/', addStatus)

router.get('/', getStatus);

router.delete('/', deactivateStatus)
module.exports = router;