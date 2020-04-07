var express = require('express');
var router = express.Router();
const checkAuth=require('../middleware/checkAuth')
const {uploadScheme}=require('../controllers/schemes/upload_schemes');
const {wrapper}=require('../utils/errorWrap');
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
router.post('/',checkAuth,upload.single('csv'), wrapper(uploadScheme));

module.exports=router;
