const express = require('express');
const Banner = require('../controllers/banner/banner');
const route = express.Router();
const errorwrapper = require('../utils/errorWrap');

const checkAuth = require('../middleware/checkAuth');

route.post('/addbanner', checkAuth, errorwrapper.wrapper(Banner.AddUpdateBanner));
route.get('/readbanner', checkAuth, errorwrapper.wrapper(Banner.ReadBanner));
route.delete('/deletebanner/:id', checkAuth, errorwrapper.wrapper(Banner.DeleteBanner));

module.exports = route;