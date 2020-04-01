var express = require('express');
var router = express.Router();

const { wrapper } = require('../utils/errorWrap');

const { addRating, getRating, deactivateRating } = require('../controllers/rating/rating');
const checkAuth = require('../middleware/checkAuth');


router.post('/', checkAuth, addRating)

router.get('/', checkAuth, getRating);

router.delete('/', checkAuth, deactivateRating)
module.exports = router;