var express = require('express');
var router = express.Router();

const { postState, getState } = require('../controllers/state/state')
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

router.post('/', checkAuth, upload.single('csv'), wrapper(postState));

router.get('/', checkAuth, wrapper(getState));





module.exports = router;