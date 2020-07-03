const multer = require('multer');

const models = require('../../models'); // importing models.
const multerS3 = require('multer-s3');
const fs = require('fs');
let AWS = require('aws-sdk');

// File Upload.
exports.uploadFile =
    async (req, res, next) => {
        const fileFor = req.query.reason;
        const loanId = req.query.loanId;
        const customerId = req.query.customerId;
        const partnerId = req.query.partnerId;
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
        if (process.env.FILE_TO_AWS == 'true') {
            AWS.config.update({
                secretAccessKey: `${process.env.Secretkey}`,
                accessKeyId: `${process.env.Accessid}`,
                region: process.env.Region,
            });
            const s3 = new AWS.S3({ accessKeyId: `${process.env.Accessid}`, secretAccessKey: `${process.env.Secretkey}` });
            const upload = multer({
                storage: multerS3({ s3,
                    acl: 'public-read',
                    bucket: process.env.Bucket,
                    contentType: multerS3.AUTO_CONTENT_TYPE,
                    key(req, file, cb) {
                        const extArray = file.originalname.split('.');
                        const extension = extArray[extArray.length - 1];
                        cb(null,`${destination}${Date.now()}.${extension}`);
                    },
                }),
            });
            const uploadFilesToS3 = upload.array('avatar');
            await uploadFilesToS3(req, res, async(err) => {
                if (err) {
                    return res.status(422).json(err);
                    }
                let data = Object.assign(req.files[0], { URL: req.files[0].location });
                data.url = data.key;
                let result = await models.fileUpload.create({filename:data.key,mimetype:data.mimetype,encoding:data.encoding,originalname:data.originalname,url:data.url,path:data.url,userId:req.userData.id});
                    if (!result) {
                        return res.status(422).json({message: 'Error while uploading file!'});
                    } else {
                        return res.status(200).json(result);
                    }
            });
        }else{
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
        }
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
            imgUrl: `${process.env.BASE_URL}/uploads/images/${fileName}.jpeg`, uploadFile
        })
    }
}
