var express = require('express');
var router = express.Router();

const { wrapper } = require('../utils/errorWrap');

const { addStage, getStage, deactivateStage } = require('../controllers/stage/stage')

router.post('/', addStage);

router.get('/', getStage);

router.delete('/', deactivateStage)
module.exports = router;