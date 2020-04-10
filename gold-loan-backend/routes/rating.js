var express = require('express');
var router = express.Router();

const { wrapper } = require('../utils/errorWrap');

const { addRating, getRating, updateRating, deactivateRating } = require('../controllers/rating/rating');
const checkAuth = require('../middleware/checkAuth');


router.post('/', checkAuth, wrapper(addRating))

router.get('/', checkAuth, wrapper(getRating));

router.put('/:id', checkAuth, wrapper(updateRating))

router.delete('/', checkAuth, wrapper(deactivateRating))
module.exports = router;