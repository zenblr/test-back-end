const multer = require('multer');

const models = require('../../models'); // importing models.
const multerS3 = require('multer-s3');
const { BASEURL } = require('../../config/baseUrl');
const fs = require('fs');
let AWS = require('aws-sdk');

// File Upload.
exports.uploadFile =
    async (req, res, next) => {
        const fileFor = req.query.reason;
        const loanId = req.query.loanId;
        const customerId = req.query.customerId;
        const partnerId = req.query.partnerId

        let destination;
        if (fileFor == "user") {
            destination = `public/uploads/user/`
        } else if (fileFor == "loan") {
            destination = `public/uploads/loan/${loanId}/`;
        } else if (fileFor == "customer") {
            destination = `public/uploads/customer/${customerId}/`;
        } else if (fileFor == "lead") {
            destination = `public/uploads/lead/`;
        } else if (fileFor == "banner") {
            destination = 'public/uploads/banner/';
        } else if (fileFor == "offer") {
            destination = 'public/uploads/offer/';
        } else if (fileFor == "lenderBanner") {
            destination = 'public/uploads/lenderBanner/';
        } else if (fileFor == "scheme") {
            destination = `public/uploads/scheme/${partnerId}/`;
        } else if (fileFor == "holiday") {
            destination = `public/uploads/holiday/`
        } else {
            return res.status(422).json({ message: 'reason not found' });
        }
        const storage = multer.diskStorage({
            filename: (req, file, cb) => {
                const extArray = file.originalname.split('.');
                const extension = extArray[extArray.length - 1];
                cb(null, `${Date.now()}.${extension}`);
            },
            destination: destination,
        });
        const uploads = multer({ storage }).single('avatar');
        uploads(req, res, async (err) => {
            if (err) {
                res.status(500);
            }
            let pathToadd = destination.replace('public/', '');
            req.file.path = pathToadd + req.file.filename;
            req.file.url = req.file.destination + req.file.filename;

            req.file['userId'] = req.userData.id
            let uploadFile = await models.fileUpload.create(req.file);
            if (!uploadFile) {
                res.status(400).json({ message: 'Error while uploading file!' })
            } else {
                res.status(200).json({
                    uploadFile
                });
            }
        });
    };

//Read File.
exports.getFile = async (req, res, next) => {

    let fileData = await models.fileUpload.findAll();
    if (!fileData) {
        return res.status(404).json({ message: 'data not found' });
    }
    return res.status(200).json({ fileData });
}

exports.base64Convertor = async (req, res, next) => {
    let fileName = Date.now();
    let userId = req.userData.id
    let destination = 'public/uploads/images/';
    if (process.env.FILE_TO_AWS == 'true') {
        AWS.config.update({
            secretAccessKey: `${process.env.Secretkey}`,
            accessKeyId: `${process.env.Accessid}`,
            region: process.env.Region,
        });
        let s3 = new AWS.S3({ params: { Bucket: process.env.Bucket } });
        let buf = Buffer.from(req.body.avatar.replace(/^data:image\/\w+;base64,/, ""), 'base64')
        var data = {
            Key: `${destination}${fileName}.jpeg`,
            Body: buf,
            ACL: 'public-read',
            ContentEncoding: 'base64',
            ContentType: 'image/jpeg'
        };
        const awsData = await s3.upload(data).promise();
        console.log(awsData)
        let uploadFile = await models.fileUpload.create({ filename: `${fileName}.jpeg`, url: awsData.Location, path: awsData.Key, userId: userId });
        return res.status(200).json({
            imgUrl: awsData.Location, uploadFile
        })
    } else {
        let baseImage = req.body.avatar.split(',')
        let mimetype = baseImage[0].split(';')[0].split(':')[1]
        let encoding = '7Bit';
        let userId = req.userData.id
        let url = destination + `${fileName}.jpeg`;

        let pathToadd = destination.replace('public/', '');
        let path = pathToadd + `${fileName}.jpeg`;

        let bitmap = await new Buffer.from(baseImage[1], 'base64')
        fs.writeFileSync(`public/uploads/images/${fileName}.jpeg`, bitmap)

        let uploadFile = await models.fileUpload.create({ filename: `${fileName}.jpeg`, url: url, mimetype: mimetype, encoding: encoding, path: path, userId: userId });

        return res.status(200).json({
            imgUrl: `${BASEURL}/uploads/images/${fileName}.jpeg`, uploadFile
        })
    }
}
