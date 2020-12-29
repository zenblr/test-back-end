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

exports.kycOcrAddressVoterId = async (req, res, next) => {
    let { fileUrls, customerId } = req.body;
    let idProofType = "voter id";
    let ocrData = [];
    let error = null;
    for (const fileUrl of fileUrls){
        let info = await ocrService(fileUrl, idProofType, customerId)
        if(info.error){
            return res.status(400).json({message: 'KYC failed' })
        }
        ocrData.push(info)
    }
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
                    aadhaarAddress:data.address,aadhaarPinCode:data.pincode, aadhaarState: data.state,aadhaarCity:data.city,gender:data.gender
                },{where:{customerId},transaction: t })
            }else{
                await models.customerEKycDetails.create({
                    customerId,isAppliedForAahaarVification:true,isAahaarVerified,aahaarNameScore:data.aahaarNameScore,aahaarName: data.name, aahaarDOBScore: data.aahaarDOBScore,aahaarDOB:data.dob,aahaarNumber:data.idNumber,
                    aadhaarAddress:data.address,aadhaarPinCode:data.pincode, aadhaarState: data.state,aadhaarCity:data.city,gender:data.gender
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
                    aadhaarAddress:data.address,aadhaarPinCode:data.pincode, aadhaarState: data.state,aadhaarCity:data.city,gender:data.gender
                },{where:{customerId},transaction: t })
            }else{
                await models.customerEKycDetails.create({
                    customerId,isAppliedForAahaarVification:true,isAahaarVerified,aahaarNameScore:data.aahaarNameScore,aahaarName: data.name, aahaarDOBScore: data.aahaarDOBScore,aahaarDOB:data.dob,aahaarNumber:data.idNumber,
                    aadhaarAddress:data.address,aadhaarPinCode:data.pincode, aadhaarState: data.state,aadhaarCity:data.city,gender:data.gender
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


