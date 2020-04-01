var express = require('express');
var router = express.Router();

const { wrapper } = require('../utils/errorWrap');

const { addStage, getStage, deactivateStage } = require('../controllers/stage/stage');
const checkAuth = require('../middleware/checkAuth');


router.post('/', checkAuth, addStage);

router.get('/', checkAuth, getStage);

router.delete('/', checkAuth, deactivateStage)
module.exports = router;