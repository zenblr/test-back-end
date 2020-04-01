const FileUpload = require('../controllers/fileUpload/fileUpload'); // importing Categroy controller.

const errorWrap = require('../utils/errorWrap'); // importing check authentication.

const express = require('express');
const checkAuth = require('../middleware/checkAuth');

const route = express.Router();

route.post('/', checkAuth, errorWrap.wrapper(FileUpload.uploadFile)); // api for File Upload.

route.get('/', checkAuth, errorWrap.wrapper(FileUpload.getFile)); // api to get Files.

module.exports = route;