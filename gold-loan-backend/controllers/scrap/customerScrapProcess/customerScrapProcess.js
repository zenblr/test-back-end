const models = require('../../../models');
const sequelize = models.sequelize;
const Sequelize = models.Sequelize;
const Op = Sequelize.Op;
const paginationFUNC = require('../../../utils/pagination'); // IMPORTING PAGINATION FUNCTION

const check = require("../../../lib/checkLib"); // IMPORTING CHECKLIB 
const moment = require('moment');

const { BASIC_DETAILS_SUBMIT, CUSTOMER_ACKNOWLEDGEMENT, ORNAMENTES_DETAILS, BANK_DETAILS, APPRAISER_RATING, BM_RATING, OPERATIONAL_TEAM_RATING, PACKET_IMAGES, SCRAP_DOCUMENTS, SCRAP_DISBURSEMENT } = require('../../../utils/customerScrapHistory')

//  FUNCTION FOR GET CUSTOMER DETAILS AFTER ENTER UNIQUE ID DONE
exports.customerDetails = async (req, res, next) => {

    let customerUniqueId = req.params.customerUniqueId;
    let reqId = req.userData.id;
    let getAppraiserId = await models.customerAssignAppraiser.findOne({ where: { customerUniqueId } })

    if (check.isEmpty(getAppraiserId)) {
        return res.status(400).json({ message: 'This customer Did not assign in to anyone' })
    }
    if (reqId != getAppraiserId.appraiserId) {
        return res.status(400).json({ message: `This customer is not assign to you` })
    }

    let customerData = await models.customer.findOne({
        where: { customerUniqueId, isActive: true, kycStatus: 'approved' },
        attributes: ['id', 'customerUniqueId', 'panCardNumber', 'mobileNumber', 'kycStatus', 'panType', 'panImage'],

    })

    let customerScrapStage = await models.customerScrap.findOne({
        where: { customerId: customerData.id, isScrapSubmitted: false },
        include: [{
            model: models.customer,
            as: 'customer'
        }]
    })

    if (!check.isEmpty(customerScrapStage)) {
        const firstName = customerScrapStage.customer.firstName
        const lastName = customerScrapStage.customer.lastName

        let customerCurrentStage = customerScrapStage.customerScrapCurrentStage
        // let scrapId = await models.customerScrap.findOne({ where: { masterLoanId: customerScrapStage.id } })
        if (customerCurrentStage == '2') {
            return res.status(200).json({ message: 'success', scrapId: customerScrapStage.id, loanCurrentStage: customerCurrentStage })
        } else if (customerCurrentStage == '3') {
            return res.status(200).json({ message: 'success', scrapId: customerScrapStage.id, loanCurrentStage: customerCurrentStage })
        } else if (customerCurrentStage == '4') {
            return res.status(200).json({ message: 'success', scrapId: customerScrapStage.id, loanCurrentStage: customerCurrentStage, finalScrapAmount: customerScrapStage.finalScrapAmount })
        } else if (customerCurrentStage == '5') {
            return res.status(200).json({ message: 'success', scrapId: customerScrapStage.id, loanCurrentStage: customerCurrentStage })
        } else if (customerCurrentStage == '6') {
            return res.status(200).json({ message: 'success', scrapId: customerScrapStage.id, loanCurrentStage: customerCurrentStage })
        } else if (customerCurrentStage == '7') {
            return res.status(200).json({ message: 'success', scrapId: customerScrapStage.id, loanCurrentStage: customerCurrentStage })
        }
    }

    if (!customerData) {
        res.status(404).json({ message: 'no customer details found' });
    } else {
        res.status(200).json({ message: 'customer details fetch successfully', customerData });
    }
}

exports.scrapBasicDeatils = async (req, res, next) => {
    let { customerId, customerUniqueId, kycStatus, startDate, scrapId } = req.body
    let createdBy = req.userData.id;
    let modifiedBy = req.userData.id;
    let stageId = await models.scrapStage.findOne({ where: { stageName: 'applying' } });

    if (scrapId != null) {
        let customerScrap = await models.customerScrap.findOne({ where: { id: scrapId } });

        if (!check.isEmpty(customerScrap)) {
            return res.status(200).json({ message: 'success', scrapId: scrapId.id, loanCurrentStage: '2' })
        }
    }

    let scrapData = await sequelize.transaction(async t => {

        let scrap = await models.customerScrap.create({ customerId: customerId, scrapStageId: stageId.id, customerScrapCurrentStage: "2", internalBranchId: req.userData.internalBranchId, createdBy, modifiedBy,}, { transaction: t });

        await models.customerScrapHistory.create({ scrapId: scrap.id, action: BASIC_DETAILS_SUBMIT, modifiedBy }, { transaction: t });

        await models.customerScrapPersonalDetail.create({ scrapId: scrap.id, customerUniqueId, startDate, kycStatus, createdBy, modifiedBy, }, { transaction: t })
        return scrap
    })
    return res.status(200).json({ message: 'success', scrapStage: stageId, scrapId: scrapData.id, loanCurrentStage: '2' })

}

//FUNCTION for submitting nominee details  DONE
exports.acknowledgementDetails = async (req, res, next) => {
        let { approxPurityReading, xrfMachineReadingImage, customerConfirmation, scrapId} = req.body
        let createdBy = req.userData.id;
        let modifiedBy = req.userData.id;
    
        let checkAcknowledgement = await models.customerAcknowledgement.findOne({ where: { scrapId } })
    
        if (check.isEmpty(checkAcknowledgement)) {
            let scrapData = await sequelize.transaction(async t => {
    
                let scrap = await models.customerScrap.update({ customerScrapCurrentStage: '3', modifiedBy }, { where: { id: scrapId }, transaction: t })
    
                await models.customerScrapHistory.create({ scrapId, action: CUSTOMER_ACKNOWLEDGEMENT, modifiedBy }, { transaction: t });
    
                await models.customerAcknowledgement.create({ scrapId, approxPurityReading, xrfMachineReadingImage, customerConfirmation, createdBy, modifiedBy }, { transaction: t })
                return scrap
            })
            return res.status(200).json({ message: 'success', scrapId, loanCurrentStage: '3' })
        } else {
            // let scrapSubmitted = await models.customerScrap.findOne({ where: { id: scrapId } })
            let scrapData = await sequelize.transaction(async t => {
    
                // if (loanSubmitted.isLoanSubmitted == false) {
                    var scrap = await models.customerScrap.update({ customerLoanCurrentStage: '3', modifiedBy }, { where: { id: scrapId }, transaction: t })
                // }
                await models.customerScrapHistory.create({ scrapId, action: CUSTOMER_ACKNOWLEDGEMENT, modifiedBy }, { transaction: t });
    
                await models.customerAcknowledgement.update({ scrapId, approxPurityReading, xrfMachineReadingImage, customerConfirmation, modifiedBy }, { where: { scrapId: scrapId }, transaction: t })
                return scrap
            })
            return res.status(200).json({ message: 'success', scrapId, loanCurrentStage: '3' })
    
        }

}

//FUNCTION for scrap bank details DONE
exports.scrapBankDetails = async (req, res, next) => {
        let { scrapId, paymentType, bankName, accountNumber, ifscCode, bankBranchName, accountHolderName, passbookProof } = req.body
        let createdBy = req.userData.id;
        let modifiedBy = req.userData.id;
      
        let checkBank = await models.customerScrapBankDetails.findOne({ where: { scrapId: scrapId } })
      
        if (check.isEmpty(checkBank)) {
          let scrapData = await sequelize.transaction(async t => {
      
            await models.customerScrapHistory.create({ scrapId, action: BANK_DETAILS, modifiedBy }, { transaction: t });
      
            let scrap = await models.customerScrapBankDetails.create({ scrapId, paymentType, bankName, accountNumber, ifscCode, bankBranchName, accountHolderName, passbookProof, createdBy, modifiedBy }, { transaction: t });
      
            return scrap
          })
          return res.status(200).json({ message: 'success', scrapId, scrapCurrentStage: '6' });
        } else {
      
          // let loanSubmitted = await models.customerLoanMaster.findOne({ where: { id: masterLoanId } })
      
          let scrapData = await sequelize.transaction(async t => {
            // if (loanSubmitted.isLoanSubmitted == false) {
            var a = await models.customerScrap.update({ customerScrapCurrentStage: '6', modifiedBy }, { where: { id: scrapId }, transaction: t })
            // }
            await models.customerScrapHistory.create({ scrapId, action: BANK_DETAILS, modifiedBy }, { transaction: t });
            console.log(a)
            let scrap = await models.customerScrapBankDetail.update({ paymentType, bankName, accountNumber, ifscCode, bankBranchName, accountHolderName, passbookProof, createdBy, modifiedBy }, { where: { scrapId: scrapId }, transaction: t });
      
            return scrap
          })
          return res.status(200).json({ message: 'success', scrapId, loanCurrentStage: '6' })
        }
  
  }

  //FUNCTION for submitting ornament details  DONE
exports.scrapOrnmanetDetails = async (req, res, next) => {
    let { scrapOrnaments, finalScrapAmount, scrapId } = req.body
    let allOrnmanets = []
    let createdBy = req.userData.id;
    let modifiedBy = req.userData.id;
    for (let i = 0; i < scrapOrnaments.length; i++) {
        scrapOrnaments[i]['createdBy'] = createdBy
        scrapOrnaments[i]['modifiedBy'] = modifiedBy
        scrapOrnaments[i]['scrapId'] = scrapId

        allOrnmanets.push(scrapOrnaments[i])
    }
    
    let checkOrnaments = await models.customerScrapOrnamentsDetail.findAll({ where: { scrapId: scrapId } });
    if (checkOrnaments.length == 0) {
        let scrapData = await sequelize.transaction(async t => {
            await models.customerScrap.update({ customerLoanCurrentStage: '4', modifiedBy, finalScrapAmount }, { where: { id: scrapId }, transaction: t })

            let createdOrnaments = await models.customerScrapOrnamentsDetail.bulkCreate(allOrnmanets, { transaction: t });

            await models.customerScrapHistory.create({ scrapId, action: ORNAMENTES_DETAILS, modifiedBy }, { transaction: t });

            return createdOrnaments
        })
        return res.status(200).json({ message: 'success', scrapId, loanCurrentStage: '4', finalScrapAmount, ornaments: scrapData })
    } else {

        // let loanSubmitted = await models.customerLoanMaster.findOne({ where: { id: masterLoanId } })
        let scrapData = await sequelize.transaction(async t => {
            // if (loanSubmitted.isLoanSubmitted == false) {
                await models.customerScrap.update({ customerLoanCurrentStage: '4', modifiedBy, finalScrapAmount }, { where: { id: scrapId }, transaction: t })
            // }

            await models.customerScrapHistory.create({ scrapId, action: ORNAMENTES_DETAILS, modifiedBy }, { transaction: t });

            await models.customerScrapOrnamentsDetail.destroy({ where: { scrapId: scrapId }, transaction: t });
            let createdOrnaments = await models.customerScrapOrnamentsDetail.bulkCreate(allOrnmanets, { transaction: t });

            // let createdOrnaments = []
            // for (let purityTestData of allOrnmanets) {
            //     delete purityTestData.id;
            //     var ornaments = await models.customerScrapOrnamentsDetail.create(purityTestData, { transaction: t });
            //     createdOrnaments.push(ornaments)
            // }
            return createdOrnaments
        })
        return res.status(200).json({ message: 'success', scrapId, loanCurrentStage: '4', finalScrapAmount, ornaments: scrapData })
    }

}

//FUNCTION FOR APPRAISER RATING DONE
exports.scrapAppraiserRating = async (req, res, next) => {
    try{
        let { scrapId, applicationFormForAppraiser, goldValuationForAppraiser, scrapStatusForAppraiser, commentByAppraiser } = req.body
        let createdBy = req.userData.id;
        let modifiedBy = req.userData.id;
        let appraiserId = req.userData.id
    
        let ornament = await models.customerScrap.findOne({
            where: { id: scrapId },
            include: [{
                model: models.customerScrapOrnamentsDetail,
                as: 'scrapOrnamentsDetail',
                include: [
                    {
                        model: models.ornamentType,
                        as: "ornamentType"
                    }
                ]
            }]
    
        });
    
        let scrapData = await sequelize.transaction(async t => {
            if (scrapStatusForAppraiser == "approved") {
                if (goldValuationForAppraiser == false || applicationFormForAppraiser == false) {
                    return res.status(400).json({ message: 'One field is not verified' })
                }
    
                let stageId = await models.scrapStage.findOne({ where: { stageName: 'assign packet' }, transaction: t })
                
                await models.customerScrap.update({
                    applicationFormForAppraiser, goldValuationForAppraiser, scrapStatusForAppraiser, commentByAppraiser, modifiedBy, appraiserId, isScrapSubmitted: true, scrapStageId: stageId.id
                }, { where: { id: scrapId }, transaction: t })
    
                await models.customerScrapHistory.create({ scrapId, action: APPRAISER_RATING, modifiedBy }, { transaction: t });
    
                // let loanDetail = await models.customerLoan.findOne({ where: { id: loanId }, transaction: t })
    
                //loan Id generation
                if (ornament.scrapUniqieId == null) {
                    var scrapUniqieId = null;
                    //secured loan Id
                    scrapUniqieId = `SCRAP${Math.floor(1000 + Math.random() * 9000)}`;
    
                    await models.customerScrap.update({ scrapUniqieId: scrapUniqieId }, { where: { id: scrapId }, transaction: t })
                }
    
            } else {
                let stageId = await models.scrapStage.findOne({ where: { stageName: 'appraiser rating' }, transaction: t })
    
                await models.customerScrapHistory.create({ scrapId, action: APPRAISER_RATING, modifiedBy }, { transaction: t });
    
                await models.customerScrap.update({
                    applicationFormForAppraiser, goldValuationForAppraiser, scrapStatusForAppraiser, commentByAppraiser, modifiedBy, appraiserId, isScrapSubmitted: true, scrapStageId: stageId.id
                }, { where: { id: scrapId }, transaction: t })
            }
        })
    
        let ornamentType = [];
        if (ornament.scrapOrnamentsDetail.length != 0) {
            for (let ornamentsDetail of ornament.scrapOrnamentsDetail) {
                ornamentType.push({ ornamentType: ornamentsDetail.ornamentType, id: ornamentsDetail.id })
            }
            ornament.dataValues.ornamentType = ornamentType;
        }
        return res.status(200).json({ message: 'success', ornamentType })
    
    }catch(err){
        console.log(err);
    }
   
}