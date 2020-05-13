var express = require('express');
var router = express.Router();

const { wrapper } = require('../utils/errorWrap');

const { addStage, getStage,updateStage, deactivateStage } = require('../controllers/stage/stage');
const checkAuth = require('../middleware/checkAuth');


router.post('/', checkAuth, wrapper(addStage));

router.get('/', checkAuth, wrapper(getStage));

router.put('/:id',checkAuth, wrapper(updateStage))

router.delete('/', checkAuth, wrapper(deactivateStage))
module.exports = router;