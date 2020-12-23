const models = require('../../models');
const Sequelize = models.Sequelize;
const Op = Sequelize.Op;
const check = require('../../lib/checkLib');
let {getNameByPANCard, verifyName, verifyPANCard} = require('../../service/karzaService');
let {ocrService} = require('../../service/ocrService');
const moment = require('moment');

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

exports.kycOcr = async (req, res, next) => {
    let { fileUrl, idProofTypeId, customerId } = req.body;
    let ocrData = await ocrService(fileUrl, idProofTypeId, customerId)
    if(!ocrData.error){
        return res.status(200).json({message: 'Success',data: ocrData.data })
    }else{
        return res.status(400).json({message: ocrData.error})
    }
}