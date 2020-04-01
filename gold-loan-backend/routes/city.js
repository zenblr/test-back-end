var express = require('express');
var router = express.Router();

const { postCity, getCity } = require('../controllers/city/city')

const checkAuth = require('../middleware/checkAuth');


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

router.post('/', checkAuth, upload.single('csv'), postCity)

router.get('/:stateId', checkAuth, getCity);



module.exports = router;