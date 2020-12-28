const models = require('../../models');
const Sequelize = models.Sequelize;
const Op = Sequelize.Op;
const check = require('../../lib/checkLib');
let {getNameByPANCard, verifyName, verifyPANCard} = require('../../service/karzaService');
let {ocrService, mergeUserDetailBody} = require('../../service/ocrService');
const moment = require('moment');
const _ = require('lodash');

exports.panCardNameByPan = async (req, res, next) => {
    let { panCardNumber } = req.body;
    let panData = await getNameByPANCard(panCardNumber)
    if(panData.error == false){
        return res.status(200).json({message: 'Success',data:panData.data })
    }else{
        if(nameData.status == 504){
            return res.status(400).json({message: 'Please try again'})
        }
        return res.status(400).json({message: 'Invalid Pan Card number'})
    }
}

exports.checkNameSimilarity = async (req, res, next) => {
    let { name1 , name2 } = req.body;
    let name = {name1,name2}
    let nameData = await verifyName(name)
    if(nameData.error == false){
        if(nameData.nameConfidence <= nameData.score){
            return res.status(200).json({message: 'Success',data:nameData.score })
        }else{
            return res.status(400).json({message: 'Name does not match',data:nameData.score})
        }
    }else{
        if(nameData.status == 504){
            return res.status(400).json({message: 'Please try again'})
        }
        return res.status(400).json({message: 'Name does not match'})
    }
}

exports.verifyPanCardData = async (req, res, next) => {
    let { panCardNumber, fullName, dateOfBirth } = req.body;
    let date = moment(dateOfBirth).format('DD/MM/YYYY');
    let panData = await verifyPANCard(panCardNumber, fullName, date)
    if(panData.error == false){
        return res.status(200).json({message: 'Success',data:panData.data })
    }else{
        if(nameData.status == 504){
            return res.status(400).json({message: 'Please try again'})
        }
        return res.status(400).json({message: 'Invalid ID Number or combination of inputs'})
    }
}

exports.kycOcrAddress = async (req, res, next) => {
    let { fileUrls, addressProofTypeId, customerId } = req.body;
    // let ocrData = [];
    let idProofType = null
    const idProofTypeData = await models.addressProofType.findOne({ 
        where: {
            id: addressProofTypeId,
            isActive: true
        }
    });
    if(idProofTypeData){
        idProofType = idProofTypeData.name
    }else{
        return ({ error: "Invalid address proof type" });
    }
    let error = null;
    if(idProofType.toLowerCase().includes('voter id') || idProofType.toLowerCase().includes('driving license') ){
        // for (const fileUrl of fileUrls){
    //     let info = await ocrService(fileUrl, idProofType, customerId)
    //     ocrData.push(info)
    // }
    let ocrData =  [
        {
          "data": {
            "extractedData": {
              "userDetailBody": {
                "name": "Ram Sagar Kewala Prasad Gupta",
                "idNumber": "783570468537",
                "dob": "24/03/1988",
                "address": null,
                "pincode": null,
                "state": null,
                "city": null,
                "maskedAadhaarImage": null,
                "fileNum": null,
                "aadharImageUrl": "https://download.karza.in/kyc-ocr/YmNYTTd3VlFTNXBmanNUOTF1L3BjZHJkVVAwTjhtOWJPYStHY2c3dlJVMS9jVDRjb1B3alJBemhDSmpwOVlFdGptcFhaR2lpeWlEVHZSL1NNakZDYldzQ2pUNlJpQUhCZUdBMlZOSlFEOEphYnBLWnpFQ1d4WXFyTlRvMXZsR0pjWmhOK3pRdkdCa3pkaXlkUWdlM1ZnKy85L3RFZlNIT1l0d0VXUEdwV1cwPQ=="
              },
              "confidenceValueResult": {
                "isAadharConfPass": true,
                "isNameConfPass": true
              }
            },
            "idProofType": "Aadhaar Card"
          }
        },
        {
          "data": {
            "extractedData": {
              "userDetailBody": {
                "name": null,
                "idNumber": null,
                "dob": null,
                "address": "S/O Kewala Prasad Gupta, room no. 12 GSM, 185 / 12/ 24, sane guruji nagar, j. r. boricha marg, opp. kasturba hospital, satrasta, jacob cirole, Mumbai, Maharashtra - 400011 ",
                "pincode": "400011",
                "state": "Maharashtra",
                "city": "Mumbai",
                "maskedAadhaarImage2": null,
                "fileNum": null
              },
              "confidenceValueResult": {
                "isAadharConfPass": true,
                "isNameConfPass": false
              }
            },
            "idProofType": "Aadhaar Card"
          }
        }
      ]
    //check for error
    for( const ocr of ocrData){
        if(ocr.error){
            error = ocr.error
            break
        }
    }
    if(error){
        return res.status(400).json({message: error})
    }else{
        //aadahar card data
        if(ocrData[0].data.idProofType.toLowerCase().includes('aadhaar card')){
            let isAadharConfPass = false;
            let isNameConfPass = false;
            let data = {};
            for(i = 0; i < ocrData.length; i++){
            if(ocrData.length = 2){
                if(ocrData[0].data.extractedData.confidenceValueResult.isAadharConfPass || ocrData[0].data.extractedData.confidenceValueResult.isAadharConfPass){
                    isAadharConfPass = true
                }
                if(ocrData[0].data.extractedData.confidenceValueResult.isNameConfPass || ocrData[0].data.extractedData.confidenceValueResult.isNameConfPass){
                    isNameConfPass = true
                }
                ///////////
                var test = ocrData[0].data.extractedData.userDetailBody
                var test1 = ocrData[1].data.extractedData.userDetailBody
                let clean = (obj) => {
                    for (var propName in obj) {
                        if (obj[propName] === null || obj[propName] === undefined) {
                            delete obj[propName];
                        }
                    }
                    return obj
                }
            
                let newTest1 = await clean(test)
                let newTest2 = await clean(test1)
            
                
                data = {
                    ...newTest1,
                    ...newTest2
                }
                ////
                // console.log(...newTest1, ...newTest2)
                // data = Object.assign(ocrData[0].data.extractedData.userDetailBody, ocrData[1].data.extractedData.userDetailBody);
                // data.uar1 = ocrData[0].data.extractedData.userDetailBody;
                // data.url2 = ocrData[1].data.extractedData.userDetailBody;
                // data = _.merge(ocrData[0].data.extractedData.userDetailBody,ocrData[1].data.extractedData.userDetailBody)
                // data = {
                //     ...ocrData[0].data.extractedData.userDetailBody,
                //     ...ocrData[1].data.extractedData.userDetailBody
                // }
                console.log(data)
            }else{
                data = ocrData[0].data.extractedData.userDetailBody;
            }
            }
            return res.status(200).json({message: 'Success', data, isAadharConfPass, isNameConfPass })
        }
        return res.status(200).json({message: 'Success',data: ocrData })
    }
    // if(!ocrData.error){
    //     //id proof type check
    //     if(ocrData.extractedData.idProofType.toLowerCase().includes('aadhaar card')){
    //         if(ocrData.extractedData.isAadharConfPass || ocrData.extractedData.isAadharConfPass){

    //         }
    //     }
    //     return res.status(200).json({message: 'Success',data: ocrData.data })
    // }else{
    //     return res.status(400).json({message: ocrData.error})
    // }
    }
}


exports.kycOcrForAadhaar = async (req, res, next) => {
    let { fileUrls, customerId } = req.body;
    let idProofType = "aadhaar card";
    // let ocrData = [];
    // let error = null;
    // for (const fileUrl of fileUrls){
    //     let info = await ocrService(fileUrl, idProofType, customerId)
    //     ocrData.push(info)
    // }
    let ocrData = [
        {
          "data": {
            "extractedData": {
              "userDetailBody": {
                "name": "Ram Sagar Kewala Prasad Gupta",
                "idNumber": "783570468537",
                "dob": "24/03/1988",
                "aahaarNameScore": 0.98,
                "aahaarDOBScore": 0.98,
                "aadharImageUrl2": "https://download.karza.in/kyc-ocr/cGVhZVVKRU00eGRuS2pQczV6ZnU4M283S3o4MTVHa1I2SlBtMC9Fd0MxQlV3WEFBKy82OSs1d2hnSjlDUDI3U29JMUJuVG1uRWROaCtrTjdwOWsyeGlWWStHd0lqb3lLNU43d2pjWEJETzJxcGtRaEMrOUYvV2wwTlhJTC9TdjlFOUVLU29janhyb00zdk9sdkVsOEEvbEMwS2lIdU5FYmk5em1ycTFSS2pVPQ=="
              },
              "confidenceValueResult": {
                "isAadharConfPass": true,
                "isNameConfPass": true
              }
            },
            "idProofType": "aadhaar card"
          }
        },
        {
          "data": {
            "extractedData": {
              "userDetailBody": {
                "address": "S/O Kewala Prasad Gupta, room no. 12 GSM, 185 / 12/ 24, sane guruji nagar, j. r. boricha marg, opp. kasturba hospital, satrasta, jacob cirole, Mumbai, Maharashtra - 400011 ",
                "pincode": "400011",
                "state": "Maharashtra",
                "city": "Mumbai"
              },
              "confidenceValueResult": {
                "isAadharConfPass": true,
                "isNameConfPass": false
              }
            },
            "idProofType": "aadhaar card"
          }
        }
      ]
    //check for error
    for( const ocr of ocrData){
        if(ocr.error){
            error = ocr.error
            break
        }
    }
    if(ocrData.error){
        return res.status(400).json({message: error})
    }else{
        //aadahar card data
        if(ocrData[0].data.idProofType.toLowerCase().includes('aadhaar card')){
            let isAadharConfPass = false;
            let isNameConfPass = false;
            let data = {};
            for(i = 0; i < ocrData.length; i++){
            if(ocrData.length == 2){
                if(ocrData[0].data.extractedData.confidenceValueResult.isAadharConfPass || ocrData[1].data.extractedData.confidenceValueResult.isAadharConfPass){
                    isAadharConfPass = true
                }
                if(ocrData[0].data.extractedData.confidenceValueResult.isNameConfPass || ocrData[1].data.extractedData.confidenceValueResult.isNameConfPass){
                    isNameConfPass = true
                }
            }
            if(ocrData.length == 2){
                data = await mergeUserDetailBody(ocrData[0].data.extractedData.userDetailBody,ocrData[1].data.extractedData.userDetailBody)
            }else{
                data = ocrData[0].data.extractedData.userDetailBody;
            }
            }
            return res.status(200).json({message: 'Success', isAadharConfPass, isNameConfPass,data })
        }
        return res.status(200).json({message: 'Success',data: ocrData })
    }
    // if(!ocrData.error){
    //     //id proof type check
    //     if(ocrData.extractedData.idProofType.toLowerCase().includes('aadhaar card')){
    //         if(ocrData.extractedData.isAadharConfPass || ocrData.extractedData.isAadharConfPass){

    //         }
    //     }
    //     return res.status(200).json({message: 'Success',data: ocrData.data })
    // }else{
    //     return res.status(400).json({message: ocrData.error})
    // }
}

exports.kycOcrFoPanCard = async (req, res, next) => {
    let { fileUrls, customerId } = req.body;
    let idProofType = "pan card";
    // let ocrData = [];
    let error = null;
    // for (const fileUrl of fileUrls){
    //     let info = await ocrService(fileUrl, idProofType, customerId)
    //     ocrData.push(info)
    // }
    let ocrData =  [
        {
          "data": {
            "extractedData": {
              "userDetailBody": {
                "name": "Ram Sagar Kewala Prasad Gupta",
                "idNumber": "783570468537",
                "dob": "24/03/1988",
                "address": null,
                "pincode": null,
                "state": null,
                "city": null,
                "maskedAadhaarImage": null,
                "fileNum": null,
                "aadharImageUrl": "https://download.karza.in/kyc-ocr/YmNYTTd3VlFTNXBmanNUOTF1L3BjZHJkVVAwTjhtOWJPYStHY2c3dlJVMS9jVDRjb1B3alJBemhDSmpwOVlFdGptcFhaR2lpeWlEVHZSL1NNakZDYldzQ2pUNlJpQUhCZUdBMlZOSlFEOEphYnBLWnpFQ1d4WXFyTlRvMXZsR0pjWmhOK3pRdkdCa3pkaXlkUWdlM1ZnKy85L3RFZlNIT1l0d0VXUEdwV1cwPQ=="
              },
              "confidenceValueResult": {
                "isAadharConfPass": true,
                "isNameConfPass": true
              }
            },
            "idProofType": "Aadhaar Card"
          }
        },
        {
          "data": {
            "extractedData": {
              "userDetailBody": {
                "name": null,
                "idNumber": null,
                "dob": null,
                "address": "S/O Kewala Prasad Gupta, room no. 12 GSM, 185 / 12/ 24, sane guruji nagar, j. r. boricha marg, opp. kasturba hospital, satrasta, jacob cirole, Mumbai, Maharashtra - 400011 ",
                "pincode": "400011",
                "state": "Maharashtra",
                "city": "Mumbai",
                "maskedAadhaarImage2": null,
                "fileNum": null
              },
              "confidenceValueResult": {
                "isAadharConfPass": true,
                "isNameConfPass": false
              }
            },
            "idProofType": "Aadhaar Card"
          }
        }
      ]
    //check for error
    for( const ocr of ocrData){
        if(ocr.error){
            error = ocr.error
            break
        }
    }
    if(error){
        return res.status(400).json({message: error})
    }else{
        //aadahar card data
        if(ocrData[0].data.idProofType.toLowerCase().includes('pan card')){
            let isAadharConfPass = false;
            let isNameConfPass = false;
            let data = {};
            for(i = 0; i < ocrData.length; i++){
            if(ocrData.length = 2){
                if(ocrData[0].data.extractedData.confidenceValueResult.isAadharConfPass || ocrData[0].data.extractedData.confidenceValueResult.isAadharConfPass){
                    isAadharConfPass = true
                }
                if(ocrData[0].data.extractedData.confidenceValueResult.isNameConfPass || ocrData[0].data.extractedData.confidenceValueResult.isNameConfPass){
                    isNameConfPass = true
                }
                ///////////
                var test = ocrData[0].data.extractedData.userDetailBody
                var test1 = ocrData[1].data.extractedData.userDetailBody
                let clean = (obj) => {
                    for (var propName in obj) {
                        if (obj[propName] === null || obj[propName] === undefined) {
                            delete obj[propName];
                        }
                    }
                    return obj
                }
            
                let newTest1 = await clean(test)
                let newTest2 = await clean(test1)
            
                
                data = {
                    ...newTest1,
                    ...newTest2
                }
                // console.log(...newTest1, ...newTest2)
                // data = Object.assign(ocrData[0].data.extractedData.userDetailBody, ocrData[1].data.extractedData.userDetailBody);
                // data.uar1 = ocrData[0].data.extractedData.userDetailBody;
                // data.url2 = ocrData[1].data.extractedData.userDetailBody;
                // data = _.merge(ocrData[0].data.extractedData.userDetailBody,ocrData[1].data.extractedData.userDetailBody)
                // data = {
                //     ...ocrData[0].data.extractedData.userDetailBody,
                //     ...ocrData[1].data.extractedData.userDetailBody
                // }
                console.log(data)
            }else{
                data = ocrData[0].data.extractedData.userDetailBody;
            }
            }
            return res.status(200).json({message: 'Success', data, isAadharConfPass, isNameConfPass })
        }
        return res.status(200).json({message: 'Success',data: ocrData })
    }
    // if(!ocrData.error){
    //     //id proof type check
    //     if(ocrData.extractedData.idProofType.toLowerCase().includes('aadhaar card')){
    //         if(ocrData.extractedData.isAadharConfPass || ocrData.extractedData.isAadharConfPass){

    //         }
    //     }
    //     return res.status(200).json({message: 'Success',data: ocrData.data })
    // }else{
    //     return res.status(400).json({message: ocrData.error})
    // }
}


