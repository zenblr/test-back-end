var express = require('express');
var router = express.Router();

const { postCity, getCity } = require('../../controllers/admin/city/city')


const multer = require('multer');
const storage = multer.diskStorage({
    destination: 'public/uploads/csv',
    filename: (req, file, cb) => {
        const extArray = file.originalname.split('.');
        const extension = extArray[extArray.length - 1];
        cb(null, `${Date.now()}.${extension}`)
    }
})
const upload = multer({
    storage: storage
});

router.post('/', upload.single('csv'), postCity)

router.get('/:stateId', getCity);



module.exports = router;