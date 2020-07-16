var express = require('express');
var router = express.Router();

const { wrapper } = require('../utils/errorWrap');

const { addRatingReason, getRatingReason, updateRatingReason, deactivateRatingReason } = require('../controllers/ratingReason/ratingReason');
const checkAuth = require('../middleware/checkAuth');
const checkRolePermission = require('../middleware/checkRolesPermissions');


router.post('/', checkAuth, checkRolePermission, wrapper(addRatingReason))

router.get('/', checkAuth, wrapper(getRatingReason));

router.put('/:id', checkAuth, checkRolePermission, wrapper(updateRatingReason))

router.delete('/', checkAuth, checkRolePermission, wrapper(deactivateRatingReason))
module.exports = router;