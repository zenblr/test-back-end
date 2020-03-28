var express = require('express');
var router = express.Router();

const { postState, getState } = require('../../controllers/admin/state/state')


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

router.post('/', upload.single('csv'), postState);

router.get('/', getState);





module.exports = router;