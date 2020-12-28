const models = require('../../models');
const sequelize = models.sequelize;
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
    let ocrData = [];
    let error = null;
    for (const fileUrl of fileUrls){
        let info = await ocrService(fileUrl, idProofType, customerId)
        if(info.error){
            return res.status(400).json({message: 'KYC failed' })
        }
        ocrData.push(info)
    }
    // let ocrData = [
    //     {
    //       "data": {
    //         "extractedData": {
    //           "userDetailBody": {
    //             "name": "Ram Sagar Kewala Prasad Gupta",
    //             "idNumber": "783570468537",
    //             "dob": "24/03/1988",
    //             "aahaarNameScore": 0.98,
    //             "aahaarDOBScore": 0.98,
    //             "aadharImageUrl": "https://download.karza.in/kyc-ocr/TFZmNnliaC9VTGI1S2Z6dnlLM2Y0TWppWk9BTlI1NVFzRllMdXZZTGNkZVNDOTcxeFRsR3ZVRmI0SWtRZmYwYjNYMEU1a01Kb01mZHJKcVh0ZWdVUHJSWFF3d3l2dzErcnk2czY5cWRQSmZocWJuUEIwUGlRRGlIUGtPNDNDZjNxL3RXcWVLTDZUdHJ3OVJVODBLU3VrZDM5andUakpJaFFPOHFmU0FLSStZPQ=="
    //           },
    //           "confidenceValueResult": {
    //             "isAadharConfPass": true,
    //             "isNameConfPass": true,
    //             "isDobConfPass": true
    //           }
    //         },
    //         "idProofType": "aadhaar card"
    //       }
    //     },
    //     {
    //       "data": {
    //         "extractedData": {
    //           "userDetailBody": {
    //             "address": "S/O Kewala Prasad Gupta, room no. 12 GSM, 185 / 12/ 24, sane guruji nagar, j. r. boricha marg, opp. kasturba hospital, satrasta, jacob cirole, Mumbai, Maharashtra - 400011 ",
    //             "pincode": "400011",
    //             "state": "Maharashtra",
    //             "city": "Mumbai",
    //             "aadharImageUrl2": "https://download.karza.in/kyc-ocr/ejh1WTlyYU52eDNaeE1lNVMxNXVZTW0wcGN2cmt2VDdqRTdleFNtdWF4aFBrR3VqOWtGYi9mNkVQSktRRFJONldocXBMRlJOY1hTeGNkZmhPTTNGY2xnekVnYUNDNERjM2RYemg2T2d2SnV0b2lXMjNST2RRNHhBTU5YSS9Wemo5WFhSb2lQNmloc3RNbnBBQjFkV1E3WjBZendEY3orMEtkNXBsK01rL0tRPQ=="
    //           },
    //           "confidenceValueResult": {
    //             "isAadharConfPass": true,
    //             "isNameConfPass": false,
    //             "isDobConfPass": true
    //           }
    //         },
    //         "idProofType": "aadhaar card"
    //       }
    //     }
    //   ]
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
            let isDobConfPass = false;
            let data = {};
            for(i = 0; i < ocrData.length; i++){
            if(ocrData.length == 2){
                if(ocrData[0].data.extractedData.confidenceValueResult.isAadharConfPass || ocrData[1].data.extractedData.confidenceValueResult.isAadharConfPass){
                    isAadharConfPass = true
                }
                if(ocrData[0].data.extractedData.confidenceValueResult.isNameConfPass || ocrData[1].data.extractedData.confidenceValueResult.isNameConfPass){
                    isNameConfPass = true
                }
                if(ocrData[0].data.extractedData.confidenceValueResult.isNameConfPass || ocrData[1].data.extractedData.confidenceValueResult.isNameConfPass){
                    isDobConfPass = true
                }
            }
            if(ocrData.length == 2){
                data = await mergeUserDetailBody(ocrData[0].data.extractedData.userDetailBody,ocrData[1].data.extractedData.userDetailBody)
            }else{
                data = ocrData[0].data.extractedData.userDetailBody;
            }
            }
            let isAahaarVerified = false;
            if(isAadharConfPass && isNameConfPass && isDobConfPass){
                isAahaarVerified = true;
            }
            await sequelize.transaction(async t => {
            let checkCustomerEkyc = await models.customerEKycDetails.findOne({where:{
                customerId
            },transaction: t });
            if(checkCustomerEkyc){
                await models.customerEKycDetails.update({
                    isAppliedForAahaarVification:true,isAahaarVerified,aahaarNameScore:data.aahaarNameScore,aahaarName: data.name, aahaarDOBScore: data.aahaarDOBScore,aahaarDOB:data.dob,aahaarNumber:data.idNumber,
                    aadhaarAddress:data.address,aadhaarPinCode:data.pincode, aadhaarState: data.state,aadhaarCity:data.city
                },{where:{customerId},transaction: t })
            }else{
                await models.customerEKycDetails.create({
                    customerId,isAppliedForAahaarVification:true,isAahaarVerified,aahaarNameScore:data.aahaarNameScore,aahaarName: data.name, aahaarDOBScore: data.aahaarDOBScore,aahaarDOB:data.dob,aahaarNumber:data.idNumber,
                    aadhaarAddress:data.address,aadhaarPinCode:data.pincode, aadhaarState: data.state,aadhaarCity:data.city
                },{transaction: t })
            }
            await models.customer.update({aadhaarMaskedImage1 : data.aadharImageUrl, aadhaarMaskedImage2: data.aadharImageUrl2},{where:{id:customerId},transaction: t });
        })
            return res.status(200).json({message: 'Success', isAadharConfPass, isNameConfPass, data, isDobConfPass, isAahaarVerified })
        }
        return res.status(400).json({message: 'Please try again' })
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
    let { fileUrl, customerId } = req.body;
    let idProofType = "pan card";
    let error = null;
    let ocrData = await ocrService(fileUrl, idProofType, customerId)
    if(ocrData.error){
         return res.status(400).json({message: 'KYC failed' })
    }
    if(ocrData.error){
        return res.status(400).json({message: error})
    }else{
        //aadahar card data
        if(ocrData.data.idProofType.toLowerCase().includes('pan card')){
            let isPanConfPass = ocrData.data.extractedData.confidenceValueResult.isPanConfPass;
            let isNameConfPass = ocrData.data.extractedData.confidenceValueResult.isNameConfPass;;
            let isDobConfPass = ocrData.data.extractedData.confidenceValueResult.isDobConfPass;;
            let data = ocrData.data.extractedData.userDetailBody;
            let isPanVerified = false;
            //check pan starus
            let panVerification = await verifyPANCard(data.idNumber, data.name, data.dob)
            if(panVerification.error == false){
                if(panVerification.data.status == "Active"){
                    isPanVerified = true
                }
            }
            await sequelize.transaction(async t => {
            let checkCustomerEkyc = await models.customerEKycDetails.findOne({where:{
                customerId
            },transaction: t });
            if(checkCustomerEkyc){
                await models.customerEKycDetails.update({
                    isAppliedForPanVerification:true,isPanVerified,panNameScore:data.panNameScore,panName: data.name, panDOBScore: data.panDOBScore,panDOB:data.dob,panNumber:data.idNumber,fatherName:data.fatherName
                },{where:{customerId},transaction: t })
            }else{
                await models.customerEKycDetails.create({
                    customerId,isAppliedForPanVerification:true,isPanVerified,panNameScore:data.panNameScore,panName: data.name, panDOBScore: data.panDOBScore,panDOB:data.dob,panNumber:data.idNumber, fatherName:data.fatherName
                },{transaction: t })
            }
        })
            return res.status(200).json({message: 'Success', isPanConfPass, isNameConfPass, data, isDobConfPass, isPanVerified })
        }
        return res.status(400).json({message: 'Please try again' })
    }
}

exports.getCustomerEkycData = async (req, res, next) => {
    let { customerId } = req.query;
    let customerDta = await models.customerEKycDetails.findOne({where:{customerId}});
    if(customerDta){
        return res.status(200).json({message: 'Success', data : customerDta })
    }else{
        return res.status(404).json({message: 'No data found' })
    }

}


