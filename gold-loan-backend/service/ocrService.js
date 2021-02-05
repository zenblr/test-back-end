const models = require('../models');
const fs = require('fs').promises;
const request = require('request');
PDFDocument = require('pdfkit');
const fse = require('fs');
const karzaService = require('./karzaService');
const env = process.env.KARZA_ENV || 'TEST';

let ocrService = async (fileId, idProofTypeId, customerName, idProofNumber) => {
    let apiPath;
    let requestBody;
    try {

        const karzaDetail = await models.karzaDetails.findOne({ //Fetching Karza API detail
            where: {
                isActive: true, env: env
            }
        });
        apiPath = karzaDetail.ocrUrl;

        const idProofType = await models.identityType.findOne({ //Fetching Type of Id proof
            where: {
                id: idProofTypeId,
                isActive: true
            }
        });

        const pdfData = await createPdf(fileId, idProofType.name);

        // Creating Request body for Karza Ocr
        let data = {
            "fileB64": pdfData.contents,
            "maskAadhaar": idProofType.name.toLowerCase().includes('aadhaar') ? true : false,
            "hideAadhaar": idProofType.name.toLowerCase().includes('aadhaar') ? true : false,
            "conf": true
        }

        // If the Id Proof is DL adding one more key in Request body
        if (idProofType.name.toLowerCase().includes('driving')) {
            data['docType'] = "dl"
        }

        requestBody = data;
        const apiType = 'Karza OCR';

        let options = {
            method: 'POST',
            url: karzaDetail.ocrUrl,
            headers: {
                'x-karza-key': karzaDetail.key,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        }

        return new Promise((resolve, reject) => {
            request(options, async function (error, response, body) {
                if (error) {
                    await insertInExternalApiLogger(apiType, null, null, karzaDetail.ocrUrl, JSON.stringify(data), JSON.stringify(error), 'Error');
                    return resolve({ error: 'Something Went Wrong' });
                }
                const respBody = JSON.parse(body);
                if (respBody.statusCode === 101) {
                    await insertInExternalApiLogger(apiType, null, null, karzaDetail.ocrUrl, JSON.stringify(data), body, 'Success');
                    const ocrResp = await getOcrResponse(respBody.result, idProofType.name, karzaDetail.confidenceVal1, idProofNumber);
                    if (ocrResp.error) {
                        return resolve({ error: ocrResp.error });
                    }
                    // Karza Name match
                    const karzaNameMatchResp = await karzaNameMatch(customerName, ocrResp.name);
                    if (karzaNameMatchResp.error) {
                        return resolve({ error: karzaNameMatchResp.error });
                    }
                    if (karzaNameMatchResp.score < 70) {
                        return resolve({ error: 'Customer Name and Name on Documents doesn\'t match' });
                    }

                    const validationResp = await documentValidation(ocrResp, idProofType.name, karzaDetail, idProofNumber);
                    if (!validationResp.error) {
                        return resolve({ data: ocrResp, fileData: pdfData.fileUpload });
                    } else {
                        return resolve({ error: validationResp.error });
                    }

                } else {
                    await insertInExternalApiLogger(apiType, null, null, karzaDetail.ocrUrl, JSON.stringify(data), body, 'Error');
                    return resolve({ error: 'Ocr Failed' });
                }
            })
        })
    } catch (err) {
        await insertInExternalApiLogger('Karza OCR', null, null, apiPath, JSON.stringify(requestBody), JSON.stringify(err), 'Error');
        return { error: 'Something Went Wrong' }
    }
}

// Function to Insert into External API Logger
let insertInExternalApiLogger = async (apiType, userId, customerId, api, request, response, status) => {
    models.externalApiLogger.create({
        apiType, userId, customerId, api, request, response, status
    });
    return;
}

let getOcrResponse = async (responseBody, idProofType, confidenceValue, idProofNumber) => {
    const proofType = idProofType.toLowerCase();
    let userDetailBody = {
        name: null,
        idNumber: null,
        dob: null,
        address: null,
        pincode: null,
        state: null,
        city: null,
        maskedAadhaarImage: null,
        fileNum: null
    };

    if (proofType.includes('aadhaar')) {
        const extractedData = await getAadhaarResp(responseBody, confidenceValue, userDetailBody);
        return extractedData;
    } else if (proofType.includes('passport')) {
        const extractedData = await getPassportResp(responseBody, confidenceValue, userDetailBody);
        return extractedData;
    } else if (proofType.includes('driving')) {
        const extractedData = await getDrivingLicenseResp(responseBody, userDetailBody, idProofNumber);
        return extractedData;
    } else {
        const extractedData = await getElectiondIdCardResp(responseBody, confidenceValue, userDetailBody);
        return extractedData;
    }
}

let getAadhaarResp = async (respBody, confidenceValue, userDetailBody) => {
    let isAadharConfPass = false;
    let isNameConfPass = false;
    let aadharImageUrl;
    for (let index = 0; index < respBody.length; index++) {
        const respObject = respBody[index]
        if (respObject.details.aadhaar && Number(respObject.details.aadhaar.conf) >= confidenceValue) {
            isAadharConfPass = true;
        }
        if (respObject.details.name && Number(respObject.details.name.conf) >= confidenceValue) {
            isNameConfPass = true;
        }
        if (respObject.type.toLowerCase().includes('aadhaar front top')) {
            userDetailBody.idNumber = returnValueFunction(respObject.details.aadhaar);
            userDetailBody.address = returnValueFunction(respObject.details.address);
            userDetailBody.pincode = returnValueFunction(respObject.details.pin);
            userDetailBody.state = respObject.details.addressSplit.state;
            userDetailBody.city = respObject.details.addressSplit.district;
            aadharImageUrl = respObject.details.imageUrl.value
        } else if (respObject.type.toLowerCase().includes('aadhaar front bottom')) {
            userDetailBody.name = returnValueFunction(respObject.details.name);
            userDetailBody.idNumber = returnValueFunction(respObject.details.aadhaar);
            userDetailBody.dob = returnValueFunction(respObject.details.dob);
            if (!aadharImageUrl) {
                aadharImageUrl = respObject.details.imageUrl.value;
            }
        } else {
            userDetailBody.address = returnValueFunction(respObject.details.address);
            userDetailBody.pincode = returnValueFunction(respObject.details.pin);
            userDetailBody.state = respObject.details.addressSplit ? respObject.details.addressSplit.state : null;
            userDetailBody.city = respObject.details.addressSplit ? respObject.details.addressSplit.district : null;
        }
    }

    if (aadharImageUrl) {
        const maskedAadharImageData = await storeMaskAadhaarImage(aadharImageUrl);
        userDetailBody.maskedAadhaarImage = maskedAadharImageData;
    } else {
        return { error: 'Please Upload Aadhaar Card Image' };
    }

    if (isAadharConfPass && isNameConfPass) {
        return userDetailBody;
    } else {
        return { error: 'Low Confidence' }
    }
}

let getPassportResp = async (respBody, confidenceValue, userDetailBody) => {
    let isPassportConfPass = false;
    let isNameConfPass = false;
    for (let index = 0; index < respBody.length; index++) {
        const respObject = respBody[index]
        if (respObject.details.passportNum && Number(respObject.details.passportNum.conf) >= confidenceValue) {
            isPassportConfPass = true;
        }
        if (respObject.details.givenName && Number(respObject.details.givenName.conf) >= confidenceValue) {
            isNameConfPass = true;
        }

        if (respObject.type.toLowerCase().includes('passport front')) {
            userDetailBody.name = returnValueFunction(respObject.details.givenName) + ' ' + returnValueFunction(respObject.details.surname);
            userDetailBody.idNumber = returnValueFunction(respObject.details.passportNum);
            userDetailBody.dob = returnValueFunction(respObject.details.dob);
        } else {
            userDetailBody.address = returnValueFunction(respObject.details.address);
            userDetailBody.pincode = returnValueFunction(respObject.details.pin);
            userDetailBody.state = respObject.details.addressSplit ? respObject.details.addressSplit.state : null;
            userDetailBody.city = respObject.details.addressSplit ? respObject.details.addressSplit.district : null;
            userDetailBody.fileNum = returnValueFunction(respObject.details.fileNum);
        }
    }

    if (isPassportConfPass && isNameConfPass) {
        return userDetailBody;
    } else {
        return { error: 'Low Confidence' }
    }
}

let getDrivingLicenseResp = async (respBody, userDetailBody, idProofNumber) => {
    let isDLConfPass = false;
    for (let index = 0; index < respBody.length; index++) {
        const respObject = respBody[index]
        if (respObject.details.dlNo && returnValueFunction(respObject.details.dlNo) == idProofNumber) {
            isDLConfPass = true;
        }

        if (respObject.type.toLowerCase().includes('dl front')) {
            userDetailBody.name = returnValueFunction(respObject.details.name);
            userDetailBody.idNumber = returnValueFunction(respObject.details.dlNo);
            userDetailBody.dob = returnValueFunction(respObject.details.dob);
        }
    }
    if (isDLConfPass) {
        return userDetailBody;
    } else {
        return { error: 'Sorry for inconvenience. Driver’s License cannot be processed. Please upload different document as ID proof' }
    }
}

let getElectiondIdCardResp = async (respBody, confidenceValue, userDetailBody) => {
    let isVoterIdConfPass = false;
    let isNameConfPass = false;
    for (let index = 0; index < respBody.length; index++) {
        const respObject = respBody[index]
        if (respObject.details.voterid && Number(respObject.details.voterid.conf) >= confidenceValue) {
            isVoterIdConfPass = true;
        }
        if (respObject.details.name && Number(respObject.details.name.conf) >= confidenceValue) {
            isNameConfPass = true;
        }

        if (respObject.type.toLowerCase().includes('voterid front')) {
            userDetailBody.name = returnValueFunction(respObject.details.name);
            userDetailBody.idNumber = returnValueFunction(respObject.details.voterid);
            userDetailBody.dob = returnValueFunction(respObject.details.dob);
        } else {
            userDetailBody.idNumber = returnValueFunction(respObject.details.voterid);
            userDetailBody.dob = returnValueFunction(respObject.details.dob);
            userDetailBody.address = returnValueFunction(respObject.details.address);
            userDetailBody.pincode = returnValueFunction(respObject.details.pin);
            userDetailBody.state = respObject.details.addressSplit ? respObject.details.addressSplit.state : null;
            userDetailBody.city = respObject.details.addressSplit ? respObject.details.addressSplit.district : null;
        }
    }
    if (isVoterIdConfPass && isNameConfPass) {
        return userDetailBody;
    } else {
        return { error: 'Low Confidence' }
    }
}

let returnValueFunction = (val) => {
    return val ? val.value : null;
}

let createPdf = async (fileId, idProofType) => {
    let doc = new PDFDocument;
    await doc.pipe(fse.createWriteStream('./public/output.pdf'));
    for (let index = 0; index < fileId.length; index++) {
        const filename = await models.fileUpload.findOne({ // getting stored file
            where: {
                id: fileId[index]
            }
        });

        if (index == 0) {
            //Add an image, constrain it to a given size, and center it vertically and horizontally 
            await doc.image(`./public/uploads/images/${filename.filename}`, {
                fit: [500, 400],
                align: 'center',
                valign: 'center'
            });
        } else {
            await doc.addPage()
                .image(`./public/uploads/images/${filename.filename}`, {
                    fit: [500, 400],
                    align: 'center',
                    valign: 'center'
                });
        }

        if (index == fileId.length - 1) {
            await doc.end();
        }
    }

    // Converting file to base64
    const contents = await fs.readFile('./public/output.pdf', { encoding: 'base64' });
    if (!idProofType.toLowerCase().includes('aadhaar')) {
        let fileName = Date.now();
        await fs.writeFile(`./public/uploads/images/${fileName}.pdf`, contents, 'base64');
        const fileUploadData = await storeFinalPdf(`${fileName}.pdf`);
        return {
            contents: contents,
            fileUpload: fileUploadData
        }
    } else {
        return {
            contents: contents,
            fileUpload: null
        }
    }
}

let storeMaskAadhaarImage = async (fileDownloadUrl) => {
    let fileName = Date.now();
    return new Promise((resolve, reject) => {
        request(fileDownloadUrl).pipe(fse.createWriteStream(`./public/uploads/images/${fileName}.jpeg`)).on('close', async () => {
            const imageData = await storeFinalPdf(`${fileName}.jpeg`);
            return resolve(imageData);
        });
    })
}

let storeFinalPdf = async (file) => {
    const fileUpload = await models.fileUpload.create({
        filename: file,
        userId: 1
    });
    return fileUpload;
}

let karzaNameMatch = async (customerName, nameOnDocument) => {
    let name = {
        customerName: customerName,
        accountName: nameOnDocument
    }
    const karzaNameMatchResp = await karzaService.verifyName(name);
    if (karzaNameMatchResp.error) {
        return { error: 'Customer Name and Name on Documents doesn\'t match' }
    }
    return { error: false, score: karzaNameMatchResp.data };
}

let documentValidation = async (ocrResp, idProofType, karzaDetail, idProofNumber) => {
    const proofType = idProofType.toLowerCase();
    if (proofType.includes('passport')) {
        const validatedData = await passportValidation(ocrResp, karzaDetail, idProofNumber);
        return validatedData;
    } else if (proofType.includes('driving')) {
        const validatedData = await dlValidation(ocrResp, karzaDetail, idProofNumber);
        return validatedData;
    } else {
        return { error: false };
    }
}

let passportValidation = async (ocrResp, karzaDetail, idProofNumber) => {
    let data = {
        "consent": karzaDetail.consent,
        "fileNo": ocrResp.fileNum,
        "dob": ocrResp.dob,
        "passportNo": idProofNumber
    }

    const validationResp = await karzaValidationApiCallFunction(data, karzaDetail.passportVerificationUrl, karzaDetail.key, 'Karza Passport Validation');
    if (validationResp.error) {
        return { error: validationResp.error };
    }
    if (validationResp.response.result.passportNumber.passportNumberMatch) {
        return { error: false };
    } else {
        return { error: 'Passport Validation Error' };
    }
}

let dlValidation = async (ocrResp, karzaDetail) => {
    let data = {
        "consent": karzaDetail.consent,
        "dlNo": idProofNumber,
        "dob": ocrResp.dob
    }

    const validationResp = await karzaValidationApiCallFunction(data, karzaDetail.dlAuthenticationUrl, karzaDetail.key, 'Karza DL Validation');
    if (validationResp.error) {
        return { error: validationResp.error };
    }
    const validityDate = validationResp.response.result.validity.nonTransport.length > 0 ? validationResp.response.result.validity.nonTransport : validationResp.response.result.validity.transport;
    const expiryDate = validityDate.substr(validityDate.length - 10);
    const formattedDate = expiryDate.split("-");
    let expiryDateInDateFormat = new Date(formattedDate[1] - formattedDate[0] - formattedDate[2]);
    if (expiryDateInDateFormat > new Date()) {
        return { error: false };
    } else {
        return { error: 'Passport Validation Error' };
    }
}

let karzaValidationApiCallFunction = async (data, apiUrl, key, apiType) => {
    try {
        let options = {
            method: 'POST',
            url: apiUrl,
            headers: {
                'x-karza-key': key,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        }

        return new Promise((resolve, reject) => {
            request(options, async function (error, response, body) {
                if (error) {
                    await insertInExternalApiLogger(apiType, null, null, apiUrl, JSON.stringify(data), JSON.stringify(error), 'Error');
                    return resolve({ error: 'Something Went Wrong' });
                }
                const respBody = JSON.parse(body);
                if (respBody.statusCode === 101) {
                    await insertInExternalApiLogger(apiType, null, null, apiUrl, JSON.stringify(data), body, 'Success');
                    return resolve({ response: respBody });
                } else {
                    await insertInExternalApiLogger(apiType, null, null, apiUrl, JSON.stringify(data), JSON.stringify(respBody), 'Error');
                    return resolve({ error: 'Validation Failed' });
                }
            });
        });
    } catch (err) {
        await insertInExternalApiLogger(apiType, null, null, apiUrl, JSON.stringify(data), JSON.stringify(err), 'Error');
        return { error: 'Something Went Wrong' };
    }
}

module.exports = {
    ocrService: ocrService,
    insertInExternalApiLogger: insertInExternalApiLogger,
    getOcrResponse: getOcrResponse,
    getAadhaarResp: getAadhaarResp,
    getPassportResp: getPassportResp,
    getDrivingLicenseResp: getDrivingLicenseResp,
    getElectiondIdCardResp: getElectiondIdCardResp,
    returnValueFunction: returnValueFunction,
    createPdf: createPdf,
    storeFinalPdf: storeFinalPdf,
    storeMaskAadhaarImage: storeMaskAadhaarImage,
    karzaNameMatch: karzaNameMatch,
    documentValidation: documentValidation,
    passportValidation: passportValidation,
    dlValidation: dlValidation,
    karzaValidationApiCallFunction: karzaValidationApiCallFunction
}
