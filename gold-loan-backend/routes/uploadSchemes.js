var express = require('express');
var router = express.Router();
const checkAuth = require('../middleware/checkAuth')
const { uploadScheme } = require('../controllers/scheme/uploadSchemes');
const { wrapper } = require('../utils/errorWrap');
const multer = require('multer');
const storage = multer.diskStorage({
    destination: 'public/uploads/schemes',
    filename: (req, file, cb) => {
        const extArray = file.originalname.split('.');
        const extension = extArray[extArray.length - 1];
        cb(null, `${Date.now()}.${extension}`)
    }
});

const upload = multer({
    storage: storage
});
router.post('/', checkAuth, upload.single('schemecsv'), wrapper(uploadScheme));

module.exports = router;
