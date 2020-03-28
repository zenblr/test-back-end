const FileUpload = require('../controllers/fileUpload/fileUpload'); // importing Categroy controller.

const errorWrap = require('../utils/errorWrap'); // importing check authentication.

const express = require('express');

const route = express.Router();

route.post('/', errorWrap.wrapper(FileUpload.uploadFile)); // api for File Upload.

route.get('/', errorWrap.wrapper(FileUpload.getFile)); // api to get Files.

module.exports = route;