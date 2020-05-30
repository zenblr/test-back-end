const { uploadFile, getFile, base64Convertor } = require('../controllers/fileUpload/fileUpload'); // importing Categroy controller.

const { wrapper } = require('../utils/errorWrap'); // importing check authentication.

const express = require('express');
const checkAuth = require('../middleware/checkAuth');

const route = express.Router();

route.post('/', checkAuth, wrapper(uploadFile)); // api for File Upload.

route.get('/', checkAuth, wrapper(getFile)); // api to get Files.

route.post('/base', checkAuth, wrapper(base64Convertor)); // api for File Upload.


module.exports = route;