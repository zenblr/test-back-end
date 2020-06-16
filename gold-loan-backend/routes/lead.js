var express = require('express');
var router = express.Router();

const { wrapper } = require('../utils/errorWrap');

const { addLead, getLead,  updateLead ,deactivateLead } = require('../controllers/lead/lead');
const checkAuth = require('../middleware/checkAuth');


router.post('/', checkAuth, wrapper(addLead))

router.get('/', checkAuth, wrapper(getLead));

router.put('/:id', checkAuth, wrapper(updateLead))

router.delete('/', checkAuth, wrapper(deactivateLead))
module.exports = router;