var express = require('express');
var router = express.Router();

const { postCity, getCity,newCity } = require('../controllers/city/city')

const checkAuth = require('../middleware/checkAuth');
const { wrapper } = require('../utils/errorWrap');


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

router.post('/', checkAuth, upload.single('csv'), wrapper(postCity))

router.get('/', wrapper(getCity));

router.post('/new-city', checkAuth, wrapper(newCity))


module.exports = router;