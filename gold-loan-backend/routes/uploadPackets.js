var express = require('express');

var router = express.Router();

const checkAuth = require('../middleware/checkAuth')

const multer = require('multer');

const {uploadPacket} = require('../controllers/packet/uploadPackets') // importing controller to Upload Packet List 

const { wrapper } = require('../utils/errorWrap');

const storage = multer.diskStorage({
    destination: 'public/uploads/uploadPacket',
    filename: (req, file, cb) => {
        const extArray = file.originalname.split('.');
        const extension = extArray[extArray.length - 1];
        cb(null, `${Date.now()}.${extension}`)
    }
});

const upload = multer({
    storage: storage
});


router.post('/', checkAuth, upload.single('packetcsv'),wrapper(uploadPacket));

module.exports = router;