var express = require('express');

var router = express.Router();

const checkAuth = require('../../middleware/checkAuth')

const multer = require('multer');

const {scrapUploadPacket} = require('../../controllers/scrap/scrapPacket/uploadScrapPackets') // importing controller to Upload Packet List 

const { wrapper } = require('../../utils/errorWrap');

const storage = multer.diskStorage({
    destination: 'public/uploads/uploadScrapPacket',
    filename: (req, file, cb) => {
        const extArray = file.originalname.split('.');
        const extension = extArray[extArray.length - 1];
        cb(null, `${Date.now()}.${extension}`)
    }
});

const upload = multer({
    storage: storage
});

router.post('/', checkAuth, upload.single('packetcsv'),wrapper(scrapUploadPacket));

module.exports = router;