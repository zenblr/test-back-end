const { addFeedBack,deactiveFeedBack,updateFeedBack,readFeedBack,readFeedBackById } = require('../controllers/query_feedBack/feedBack');
const validationError =require('../middleware/validationError');
const { wrapper } = require('../utils/errorWrap');
const customerCheckAuth = require('../middleware/customerCheckAuth');
const checkAuth=require('../middleware/checkAuth');

const express = require('express');
const route=express.Router();

route.post('/',customerCheckAuth,wrapper(addFeedBack));
route.get('/',customerCheckAuth,wrapper(readFeedBack));
route.delete('/',checkAuth,wrapper(deactiveFeedBack))
route.get('/:id',checkAuth,wrapper(readFeedBackById));
route.put('/:id',customerCheckAuth,wrapper(updateFeedBack));

module.exports=route;   