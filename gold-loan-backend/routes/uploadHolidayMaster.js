var express = require('express');
var router = express.Router();
const checkAuth = require('../middleware/checkAuth')
const { uploadHolidayMaster } = require('../controllers/holidayMaster/uploadHolidayMaster');
const { wrapper } = require('../utils/errorWrap');
const multer = require('multer');
const checkRolePermission = require('../middleware/checkRolesPermissions');

const storage = multer.diskStorage({
    destination: 'public/uploads/holidaylist',
    filename: (req, file, cb) => {
        const extArray = file.originalname.split('.');
        const extension = extArray[extArray.length - 1];
        cb(null, `${Date.now()}.${extension}`)
    }
});

const upload = multer({
    storage: storage
});
router.post('/', checkAuth,checkRolePermission,  upload.single('holidaylist'), wrapper(uploadHolidayMaster));

module.exports = router;
