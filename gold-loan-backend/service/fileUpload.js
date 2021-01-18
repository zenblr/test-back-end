const multer = require('multer');

const models = require('../models'); // importing models.
const multerS3 = require('multer-s3');
const fs = require('fs');
let AWS = require('aws-sdk');


let pathToBase64 = async (path) => {
    try {
        let buff = path

        if (process.env.NODE_ENV == "production" || process.env.NODE_ENV == "uat") {
            // buff = fs.readFileSync(`${path}`)
            const getAwsResp = await models.axios({
                method: 'GET',
                url: buff,
                responseType: 'arraybuffer'
            });
            let base64Image = Buffer.from(getAwsResp.data, 'binary').toString('base64');
            let data = `data:image/jpeg;base64,${base64Image}`
            return { success: true, status: 200, data: data }
        } else {
            buff = fs.readFileSync(`public/${path}`);

            let base64data = buff.toString('base64');

            let data = `data:image/jpeg;base64,${base64data}`

            return { success: true, status: 200, data: data }
        }

    } catch (err) {
        return { success: false, status: 400, message: err.message }
    }

}

module.exports = {
    pathToBase64: pathToBase64
}