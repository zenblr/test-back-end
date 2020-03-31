var express = require('express');
var router = express.Router();

const { wrapper } = require('../utils/errorWrap');

const { addRating, getRating, deactivateRating } = require('../controllers/rating/rating')

router.post('/', addRating)

router.get('/', getRating);

router.delete('/', deactivateRating)
module.exports = router;