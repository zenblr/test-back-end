var express = require('express');
var router = express.Router();

const { wrapper } = require('../utils/errorWrap');

const { addRatingReason, getRatingReason, updateRatingReason, deactivateRatingReason } = require('../controllers/ratingReason/ratingReason');
const checkAuth = require('../middleware/checkAuth');


router.post('/', checkAuth, wrapper(addRatingReason))

router.get('/', checkAuth, wrapper(getRatingReason));

router.put('/:id', checkAuth, wrapper(updateRatingReason))

router.delete('/', checkAuth, wrapper(deactivateRatingReason))
module.exports = router;