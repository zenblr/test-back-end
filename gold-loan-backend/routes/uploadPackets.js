var express = require('express');
var router = express.Router();
const checkAuth = require('../middleware/checkAuth')
const { uploadPacket } = require('../controllers/packet/uploadPackets');
const { wrapper } = require('../utils/errorWrap');
const multer = require('multer');
const checkRolePermission = require('../middleware/checkRolesPermissions');

const storage = multer.diskStorage({
    destination: 'public/uploads/schemes',
    filename: (req, file, cb) => {
        const extArray = file.originalname.split('.');
        console.log(extArray)
        const extension = extArray[extArray.length - 1];
        console.log(extension)
        cb(null, `${Date.now()}.${extension}`)
        // cb(null, file.fieldname + "-" + Date.now() + "-" + file.originalname)
        
    }
});

const upload = multer({
    storage: storage
});
router.post('/', checkAuth, checkRolePermission, upload.single('packetcsv'), wrapper(uploadPacket));

module.exports = router;