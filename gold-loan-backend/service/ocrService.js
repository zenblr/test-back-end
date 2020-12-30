const models = require('../models');
const fs = require('fs').promises;
const request = require('request');
const fse = require('fs');
const karzaService = require('./karzaService');
const env = process.env.KARZA_ENV || 'TEST';

// let ocrService = async (fileId, idProofTypeId, customerName, idProofNumber) => {
//     let apiPath;
//     let requestBody;
//     try {

//         const karzaDetail = await models.karzaDetails.findOne({ //Fetching Karza API detail
//             where: {
//                 isActive: true, env: env
//             }
//         });
//         apiPath = karzaDetail.ocrUrl;

//         const idProofType = await models.identityType.findOne({ //Fetching Type of Id proof
//             where: {
//                 id: idProofTypeId,
//                 isActive: true
//             }
//         });

//         const pdfData = await createPdf(fileId, idProofType.name);

//         // Creating Request body for Karza Ocr
//         let data = {
//             "fileB64": pdfData.contents,
//             "maskAadhaar": idProofType.name.toLowerCase().includes('aadhaar') ? true : false,
//             "hideAadhaar": idProofType.name.toLowerCase().includes('aadhaar') ? true : false,
//             "conf": true
//         }

//         // If the Id Proof is DL adding one more key in Request body
//         if (idProofType.name.toLowerCase().includes('driving')) {
//             data['docType'] = "dl"
//         }

//         requestBody = data;
//         const apiType = 'Karza OCR';

//         let options = {
//             method: 'POST',
//             url: karzaDetail.ocrUrl,
//             headers: {
//                 'x-karza-key': karzaDetail.key,
//                 'Content-Type': 'application/json'
//             },
//             body: JSON.stringify(data)
//         }

//         return new Promise((resolve, reject) => {
//             request(options, async function (error, response, body) {
//                 if (error) {
//                     await insertInExternalApiLogger(apiType, null, null, karzaDetail.ocrUrl, JSON.stringify(data), JSON.stringify(error), 'Error');
//                     return resolve({ error: 'Something Went Wrong' });
//                 }
//                 const respBody = JSON.parse(body);
//                 if (respBody.statusCode === 101) {
//                     await insertInExternalApiLogger(apiType, null, null, karzaDetail.ocrUrl, JSON.stringify(data), body, 'Success');
//                     const ocrResp = await getOcrResponse(respBody.result, idProofType.name, karzaDetail.confidenceVal1, idProofNumber);
//                     if (ocrResp.error) {
//                         return resolve({ error: ocrResp.error });
//                     }
//                     // Karza Name match
//                     const karzaNameMatchResp = await karzaNameMatch(customerName, ocrResp.name);
//                     if (karzaNameMatchResp.error) {
//                         return resolve({ error: karzaNameMatchResp.error });
//                     }
//                     if (karzaNameMatchResp.score < 70) {
//                         return resolve({ error: 'Customer Name and Name on Documents doesn\'t match' });
//                     }

//                     const validationResp = await documentValidation(ocrResp, idProofType.name, karzaDetail, idProofNumber);
//                     if (!validationResp.error) {
//                         return resolve({ data: ocrResp, fileData: pdfData.fileUpload });
//                     } else {
//                         return resolve({ error: validationResp.error });
//                     }

//                 } else {
//                     await insertInExternalApiLogger(apiType, null, null, karzaDetail.ocrUrl, JSON.stringify(data), body, 'Error');
//                     return resolve({ error: 'Ocr Failed' });
//                 }
//             })
//         })
//     } catch (err) {
//         await insertInExternalApiLogger('Karza OCR', null, null, apiPath, JSON.stringify(requestBody), JSON.stringify(err), 'Error');
//         return { error: 'Something Went Wrong' }
//     }
// }

// Function to Insert into External API Logger

let ocrService = async (fileUrl, idProofType, customerId) => {
    let apiPath;
    let requestBody;
    try {
        const karzaDetail = await models.karzaDetails.findOne({ //Fetching Karza API detail
            where: {
                isActive: true, env: env
            }
        });
        apiPath = karzaDetail.kycOcrUrl;

        // Creating Request body for Karza Ocr
        let data = {
            "url": fileUrl,
            "maskAadhaar": idProofType.toLowerCase().includes('aadhaar card') ? true : false,
            "conf": true
        }

        // If the Id Proof is DL adding one more key in Request body
        if (idProofType.toLowerCase().includes('driving license')) {
            data['docType'] = "dl"
        }

        requestBody = data;
        const apiType = 'Karza OCR';

        let options = {
            method: 'POST',
            url: karzaDetail.kycOcrUrl,
            headers: {
                'x-karza-key': karzaDetail.key,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        }

        return new Promise((resolve, reject) => {
            request(options, async function (error, response, body) {
                if (error) {
                    await insertInExternalApiLogger(apiType, null, null, karzaDetail.kycOcrUrl, JSON.stringify(data), JSON.stringify(error), 'Error');
                    return resolve({ error: 'Something Went Wrong' });
                }
                const respBody = JSON.parse(body);
                if (respBody.statusCode === 101) {
                    await insertInExternalApiLogger(apiType, null, null, karzaDetail.kycOcrUrl, JSON.stringify(data), body, 'Success');
                    const ocrResp = await getOcrResponse(respBody.result, idProofType, karzaDetail.confidenceVal1);
                    if (ocrResp.error) {
                        return resolve({ error: ocrResp.error });
                    }
                    const validationResp = await documentValidation(ocrResp, idProofType, karzaDetail);
                    if (!validationResp.error) {
                        return resolve({ data: ocrResp });
                    } else {
                        return resolve({ error: validationResp.error });
                    }

                } else {
                    await insertInExternalApiLogger(apiType, null, null, karzaDetail.kycOcrUrl, JSON.stringify(data), body, 'Error');
                    return resolve({ error: 'Ocr Failed' });
                }
            })
        })
    } catch (err) {
        await insertInExternalApiLogger('Karza OCR', null, null, apiPath, JSON.stringify(requestBody), JSON.stringify(err), 'Error');
        return { error: 'Something Went Wrong' }
    }
}

let insertInExternalApiLogger = async (apiType, userId, customerId, api, request, response, status) => {
    models.externalApiLogger.create({
        apiType, userId, customerId, api, request, response, status
    });
    return;
}

let getOcrResponse = async (responseBody, idProofType, confidenceValue) => {
    const proofType = idProofType.toLowerCase();
    let userDetailBody = {
    };

    if (proofType.includes('aadhaar card')) {
        const extractedData = await getAadhaarResp(responseBody, confidenceValue, userDetailBody);
        return {extractedData,idProofType};
    }  else if (proofType.includes('driving license')) {
        const extractedData = await getDrivingLicenseResp(responseBody, userDetailBody);
        return {extractedData,idProofType};
    } else if(proofType.includes('voter id')){
        const extractedData = await getElectiondIdCardResp(responseBody, confidenceValue, userDetailBody);
        return {extractedData,idProofType};
    } else if(proofType.includes('pan card')) {
        const extractedData = await getPanCardResp(responseBody, confidenceValue, userDetailBody);
        return {extractedData,idProofType};
    }
}

let getAadhaarResp = async (respBody, confidenceValue, userDetailBody) => {
    let isAadharConfPass = false;
    let isNameConfPass = false;
    let isDobConfPass = false;
    let aadharImageUrl;
    for (let index = 0; index < respBody.length; index++) {
        const respObject = respBody[index]
        if (respObject.details.aadhaar && Number(respObject.details.aadhaar.conf) >= confidenceValue) {
            isAadharConfPass = true;
        }
        if (respObject.details.name && Number(respObject.details.name.conf) >= confidenceValue) {
            isNameConfPass = true;
        }
        if(respObject.details.dob && Number(respObject.details.dob.conf) >= confidenceValue) {
            isDobConfPass = true;
        }
        if (respObject.type.toLowerCase().includes('aadhaar front top')) {
            userDetailBody.idNumber = returnValueFunction(respObject.details.aadhaar);
            userDetailBody.address = returnValueFunction(respObject.details.address);
            userDetailBody.pincode = returnValueFunction(respObject.details.pin);
            userDetailBody.state = respObject.details.addressSplit.state;
            userDetailBody.city = respObject.details.addressSplit.district;
            userDetailBody.aadharImageUrl = respObject.details.imageUrl.value
            aadharImageUrl = respObject.details.imageUrl.value
        } else if (respObject.type.toLowerCase().includes('aadhaar front bottom')) {
            userDetailBody.name = returnValueFunction(respObject.details.name);
            userDetailBody.gender = returnValueFunction(respObject.details.gender);
            userDetailBody.idNumber = returnValueFunction(respObject.details.aadhaar);
            userDetailBody.dob = returnValueFunction(respObject.details.dob);
            userDetailBody.aahaarNameScore = returnConfFunction(respObject.details.name);
            userDetailBody.aahaarDOBScore = returnConfFunction(respObject.details.name);
            if (!aadharImageUrl) {
                userDetailBody.aadharImageUrl = respObject.details.imageUrl.value;
            }
        } else {
            userDetailBody.address = returnValueFunction(respObject.details.address);
            userDetailBody.pincode = returnValueFunction(respObject.details.pin);
            userDetailBody.state = respObject.details.addressSplit ? respObject.details.addressSplit.state : null;
            userDetailBody.city = respObject.details.addressSplit ? respObject.details.addressSplit.district : null;
            userDetailBody.aadharImageUrl2 = respObject.details.imageUrl.value;
        }
    }

    // if (aadharImageUrl) {
    //     const maskedAadharImageData = await storeMaskAadhaarImage(aadharImageUrl);
    //     userDetailBody.maskedAadhaarImage = maskedAadharImageData;
    // } else {
    //     return { error: 'Please Upload Aadhaar Card Image' };
    // }
    let confidenceValueResult = {isAadharConfPass,isNameConfPass, isDobConfPass}
    return {userDetailBody ,confidenceValueResult}
}

let getPanCardResp = async (respBody, confidenceValue, userDetailBody) => {
    let isPanConfPass = false;
    let isNameConfPass = false;
    let isDobConfPass = false;
    for (let index = 0; index < respBody.length; index++) {
        const respObject = respBody[index]
        if (respObject.details.panNo && Number(respObject.details.panNo.conf) >= confidenceValue) {
            isPanConfPass = true;
        }
        if (respObject.details.name && Number(respObject.details.name.conf) >= confidenceValue) {
            isNameConfPass = true;
        }
        if(respObject.details.date && Number(respObject.details.date.conf) >= confidenceValue) {
            isDobConfPass = true;
        }
        if (respObject.type.toLowerCase().includes('pan')) {
            userDetailBody.dob = returnValueFunction(respObject.details.date);
            userDetailBody.idNumber = returnValueFunction(respObject.details.panNo);
            userDetailBody.fatherName = returnValueFunction(respObject.details.father);
            userDetailBody.name = returnValueFunction(respObject.details.name);
            userDetailBody.panNameScore =  returnConfFunction(respObject.details.name);
            userDetailBody.panDOBScore = returnConfFunction(respObject.details.date);
        }
    }

    // if (aadharImageUrl) {
    //     const maskedAadharImageData = await storeMaskAadhaarImage(aadharImageUrl);
    //     userDetailBody.maskedAadhaarImage = maskedAadharImageData;
    // } else {
    //     return { error: 'Please Upload Aadhaar Card Image' };
    // }
    let confidenceValueResult = {isPanConfPass,isNameConfPass, isDobConfPass}
    return {userDetailBody ,confidenceValueResult}
}

let mergeUserDetailBody = async (body1, body2) => {
    let clean = (obj) => {
        for (var propName in obj) {
            if (obj[propName] === null || obj[propName] === undefined) {
                delete obj[propName];
            }
        }
        return obj
    }
    let data1 = await clean(body1);
    let data2 = await clean(body2);
    let data = {
        ...data1,
        ...data2
    }
    return data;
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
    let confidenceValueResult = {isPassportConfPass,isNameConfPass}
    return { userDetailBody, confidenceValueResult};
    // if (isPassportConfPass && isNameConfPass) {
    //     return userDetailBody;
    // } else {
    //     return { error: 'Low Confidence' }
    // }
}

let getDrivingLicenseResp = async (respBody, userDetailBody) => {
    let isDLConfPass = false;
    for (let index = 0; index < respBody.length; index++) {
        const respObject = respBody[index]
        isDLConfPass = true
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
    for (let index = 0; index < respBody.length; index++) {
        const respObject = respBody[index]
        if (respObject.details.voterid && Number(respObject.details.voterid.conf) >= confidenceValue) {
            isVoterIdConfPass = true;
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
    let confidenceValueResult = {isVoterIdConfPass}
    return {userDetailBody,confidenceValueResult};
}

let returnValueFunction = (val) => {
    return val ? val.value : null;
}

let returnConfFunction = (confInfo) => {
    return confInfo ? confInfo.conf : null;
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
        // const validatedData = await passportValidation(ocrResp, karzaDetail, idProofNumber);
        // return validatedData;
        return { error: false };
    } else if (proofType.includes('driving license')) {
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
        "passportNo": ocrResp.idNumber
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

let karzaValidationApiCallFunction = async (urls) => {
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
    storeFinalPdf: storeFinalPdf,
    storeMaskAadhaarImage: storeMaskAadhaarImage,
    karzaNameMatch: karzaNameMatch,
    documentValidation: documentValidation,
    passportValidation: passportValidation,
    dlValidation: dlValidation,
    karzaValidationApiCallFunction: karzaValidationApiCallFunction,
    mergeUserDetailBody:mergeUserDetailBody,
    getPanCardResp:getPanCardResp
}
