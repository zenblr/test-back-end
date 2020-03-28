const express = require('express');
const Banner = require('../controllers/banner/banner');
const route = express.Router();
const errorwrapper = require('../utils/errorWrap');
route.post('/addbanner', errorwrapper.wrapper(Banner.AddUpdateBanner));
route.get('/readbanner', errorwrapper.wrapper(Banner.ReadBanner));
route.delete('/deletebanner/:id', errorwrapper.wrapper(Banner.DeleteBanner));

module.exports = route;