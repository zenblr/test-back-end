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
            return res.status(200).json({ message: 'success', scrapId: scrapId.id, scrapCurrentStage: '2' })
        }
    }

    let scrapData = await sequelize.transaction(async t => {

        let scrap = await models.customerScrap.create({ customerId: customerId, scrapStageId: stageId.id, customerScrapCurrentStage: "2", internalBranchId: req.userData.internalBranchId, createdBy, modifiedBy,}, { transaction: t });

        await models.customerScrapHistory.create({ scrapId: scrap.id, action: BASIC_DETAILS_SUBMIT, modifiedBy }, { transaction: t });

        await models.customerScrapPersonalDetail.create({ scrapId: scrap.id, customerUniqueId, startDate, kycStatus, createdBy, modifiedBy, }, { transaction: t })
        return scrap
    })
    return res.status(200).json({ message: 'success', scrapStage: stageId, scrapId: scrapData.id, scrapCurrentStage: '2' })

}

//FUNCTION for submitting nominee details  DONE
exports.acknowledgementDetails = async (req, res, next) => {
        let { approxPurityReading, xrfMachineReading, customerConfirmation, scrapId} = req.body;
        let createdBy = req.userData.id;
        let modifiedBy = req.userData.id;
    
        let checkAcknowledgement = await models.customerAcknowledgement.findOne({ where: { scrapId } });
    
        if (check.isEmpty(checkAcknowledgement)) {
            let scrapData = await sequelize.transaction(async t => {
    
                let scrap = await models.customerScrap.update({ customerScrapCurrentStage: '4', modifiedBy }, { where: { id: scrapId }, transaction: t })
    
                await models.customerScrapHistory.create({ scrapId, action: CUSTOMER_ACKNOWLEDGEMENT, modifiedBy }, { transaction: t });
    
                await models.customerAcknowledgement.create({ scrapId, approxPurityReading, xrfMachineReading, customerConfirmation, createdBy, modifiedBy }, { transaction: t })
                return scrap
            })
            return res.status(200).json({ message: 'success', scrapId, loanCurrentStage: '4' })
        } else {
            // let scrapSubmitted = await models.customerScrap.findOne({ where: { id: scrapId } })
            let scrapData = await sequelize.transaction(async t => {
    
                // if (loanSubmitted.isLoanSubmitted == false) {
                    var scrap = await models.customerScrap.update({ customerLoanCurrentStage: '4', modifiedBy }, { where: { id: scrapId }, transaction: t })
                // }
                await models.customerScrapHistory.create({ scrapId, action: CUSTOMER_ACKNOWLEDGEMENT, modifiedBy }, { transaction: t });
    
                await models.customerAcknowledgement.update({ scrapId, approxPurityReading, xrfMachineReading, customerConfirmation, modifiedBy }, { where: { scrapId: scrapId }, transaction: t })
                return scrap
            })
            return res.status(200).json({ message: 'success', scrapId, loanCurrentStage: '4' })
    
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
                await models.customerScrap.update({ customerLoanCurrentStage: '3', modifiedBy, finalScrapAmount }, { where: { id: scrapId }, transaction: t })
                console.log(allOrnmanets);
                let createdOrnaments = await models.customerScrapOrnamentsDetail.bulkCreate(allOrnmanets,{ returning: true }, { transaction: t });
    
                await models.customerScrapHistory.create({ scrapId, action: ORNAMENTES_DETAILS, modifiedBy }, { transaction: t });
    
                return createdOrnaments
            })
            return res.status(200).json({ message: 'success', scrapId, loanCurrentStage: '3', finalScrapAmount, ornaments: scrapData })
        } else {
    
            // let loanSubmitted = await models.customerLoanMaster.findOne({ where: { id: masterLoanId } })
            let scrapData = await sequelize.transaction(async t => {
                // if (loanSubmitted.isLoanSubmitted == false) {
                    await models.customerScrap.update({ customerLoanCurrentStage: '3', modifiedBy, finalScrapAmount }, { where: { id: scrapId }, transaction: t })
                // }
    
                await models.customerScrapHistory.create({ scrapId, action: ORNAMENTES_DETAILS, modifiedBy }, { transaction: t });
    
                await models.customerScrapOrnamentsDetail.destroy({ where: { scrapId: scrapId }, transaction: t });
                console.log(allOrnmanets);
                let createdOrnaments = await models.customerScrapOrnamentsDetail.bulkCreate(allOrnmanets,{ returning: true }, { transaction: t });
    
                // let createdOrnaments = []
                // for (let purityTestData of allOrnmanets) {
                //     delete purityTestData.id;
                //     var ornaments = await models.customerScrapOrnamentsDetail.create(purityTestData, { transaction: t });
                //     createdOrnaments.push(ornaments)
                // }
                return createdOrnaments;
            })
            return res.status(200).json({ message: 'success', scrapId, loanCurrentStage: '3', finalScrapAmount, ornaments: scrapData })
        }
    
}

//FUNCTION FOR APPRAISER RATING DONE
exports.scrapAppraiserRating = async (req, res, next) => {
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
   
}

//FUNCTION FOR BM RATING
exports.scrapBmRating = async (req, res, next) => {
    let { scrapId,
        applicationFormForBM, goldValuationForBM, scrapStatusForBM, commentByBM } = req.body
    let createdBy = req.userData.id;
    let modifiedBy = req.userData.id;
    let bmId = req.userData.id


    let checkAppraiserVerified = await models.customerScrap.findOne({ where: { scrapStatusForAppraiser: "approved", id: scrapId } })
    if (check.isEmpty(checkAppraiserVerified)) {
        return res.status(400).json({ message: `Appraiser rating not verified` })
    }
    if (checkAppraiserVerified.scrapStatusForBM == "approved" || checkAppraiserVerified.scrapStatusForBM == "rejected") {
        return res.status(400).json({ message: `You cannot change status for this customer` })
    }
    if (scrapStatusForBM != "approved") {
        if (scrapStatusForBM == 'incomplete') {
            let incompleteStageId = await models.scrapStage.findOne({ where: { stageName: 'appraiser rating' } })
            await sequelize.transaction(async (t) => {
                await models.customerScrap.update(
                    { loanStatusForAppraiser: "pending", applicationFormForBM, goldValuationForBM, scrapStatusForBM, commentByBM, scrapStageId: incompleteStageId.id, bmId, modifiedBy },
                    { where: { id: scrapId }, transaction: t })

                await models.customerScrapHistory.create({ scrapId, action: BM_RATING, modifiedBy }, { transaction: t });
            })

            return res.status(200).json({ message: 'success' })
        } else {
            let rejectedStageId = await models.scrapStage.findOne({ where: { stageName: 'bm rating' } })

            await sequelize.transaction(async (t) => {
                await models.customerScrap.update(
                    { applicationFormForBM, goldValuationForBM, scrapStatusForBM, commentByBM, scrapStageId: rejectedStageId.id, bmId, modifiedBy },
                    { where: { id: scrapId }, transaction: t })

                await models.customerScrapHistory.create({ scrapId, action: BM_RATING, modifiedBy }, { transaction: t });
            })
            return res.status(200).json({ message: 'success' })
        }
    } else {
        let approvedStageId = await models.scrapStage.findOne({ where: { stageName: 'upload documents' } })

        if (applicationFormForBM == false || goldValuationForBM == false) {
            return res.status(400).json({ message: `One of field is not verified` })
        }

        await sequelize.transaction(async (t) => {
            await models.customerScrap.update(
                { applicationFormForBM, goldValuationForBM, scrapStatusForBM, commentByBM, scrapStageId: approvedStageId.id, bmId, modifiedBy },
                { where: { id: scrapId }, transaction: t })

            await models.customerScrapHistory.create({ scrapId, action: BM_RATING, modifiedBy }, { transaction: t });

        })
        return res.status(200).json({ message: 'success' })
    }
   
}

// FUNCTION FOR OPS TEAM RATING
exports.scrapOpsTeamRating = async (req, res, next) => {
    let { scrapId,
        applicationFormForOperatinalTeam, goldValuationForOperatinalTeam, scrapStatusForOperatinalTeam, commentByOperatinalTeam } = req.body;
    let createdBy = req.userData.id;
    let modifiedBy = req.userData.id;

    let checkAppraiserVerified = await models.customerScrap.findOne({ where: { scrapStatusForBM: "approved", id: scrapId } })
    if (check.isEmpty(checkAppraiserVerified)) {
        return res.status(400).json({ message: `Bm rating not verified` })
    }
    if (checkAppraiserVerified.scrapStatusForOperatinalTeam == "approved" || checkAppraiserVerified.scrapStatusForOperatinalTeam == "rejected") {
        return res.status(400).json({ message: `You cannot change status for this customer` })
    }
    let operatinalTeamId = req.userData.id;

    if (scrapStatusForOperatinalTeam !== "approved") {
        if (scrapStatusForOperatinalTeam == 'incomplete') {
            let incompleteStageId = await models.scrapStage.findOne({ where: { stageName: 'appraiser rating' } })
            await sequelize.transaction(async (t) => {
                await models.customerScrap.update(
                    { scrapStatusForAppraiser: "pending", scrapStatusForBM: "pending", applicationFormForOperatinalTeam, goldValuationForOperatinalTeam, scrapStatusForOperatinalTeam, commentByOperatinalTeam, scrapStageId: incompleteStageId.id, operatinalTeamId, modifiedBy },
                    { where: { id: scrapId }, transaction: t })

                await models.customerScrapHistory.create({ scrapId, action: OPERATIONAL_TEAM_RATING, modifiedBy }, { transaction: t });


            })


            return res.status(200).json({ message: 'success' })
        } else {
            let rejectedStageId = await models.scrapStage.findOne({ where: { stageName: 'OPS team rating' } })

            await sequelize.transaction(async (t) => {
                await models.customerScrap.update(
                    { applicationFormForOperatinalTeam, goldValuationForOperatinalTeam, scrapStatusForOperatinalTeam, commentByOperatinalTeam, scrapStageId: rejectedStageId.id, operatinalTeamId, modifiedBy },
                    { where: { id: scrapId }, transaction: t })

                await models.customerScrapHistory.create({ scrapId, action: OPERATIONAL_TEAM_RATING, modifiedBy }, { transaction: t });

            })


            return res.status(200).json({ message: 'success' })
        }
    } else {
        let approvedStageId = await models.scrapStage.findOne({ where: { stageName: 'disbursement pending' } })

        // let checkUnsecuredLoan = await models.customerLoan.findOne({ where: { id: loanId, isActive: true } })

        // let loanMaster = await models.customerLoanMaster.findOne(
        //     {
        //         where: { id: masterLoanId },
        //         include: [
        //             {
        //                 model: models.customerLoan,
        //                 as: "customerLoan",
        //             },
        //             {
        //                 model: models.customerLoanTransfer,
        //                 as: "loanTransfer",
        //             }
        //         ]
        //     })

        if (applicationFormForOperatinalTeam == false || goldValuationForOperatinalTeam == false) {
            return res.status(400).json({ message: `One of field is not verified` });
        }
        await sequelize.transaction(async (t) => {
            // loan transfer changes complete
            // if (loanMaster.isLoanTransfer == true) {
            //     let stageIdTransfer = await models.loanStage.findOne({ where: { stageName: 'disbursed' }, transaction: t })

            //     let customerLoanId = [];
            //     for (const loan of loanMaster.customerLoan) {
            //         customerLoanId.push(loan.id);
            //         await models.customerLoanDisbursement.create({
            //             loanId: loan.id, masterLoanId, loanAmount: loanMaster.loanTransfer.disbursedLoanAmount, transactionId: loanMaster.loanTransfer.transactionId, date: loanMaster.loanTransfer.updatedAt, paymentMode: 'Loan transfer', createdBy: loanMaster.loanTransfer.modifiedBy, modifiedBy: loanMaster.loanTransfer.modifiedBy
            //         }, { transaction: t })
            //     }
            //     await models.customerLoan.update({ disbursed: true }, { where: { id: { [Op.in]: customerLoanId } }, transaction: t })
            //     await models.customerLoanMaster.update({ loanStageId: stageIdTransfer.id, modifiedBy }, { where: { id: masterLoanId }, transaction: t })
            // }
            // loan transfer changes complete

            await models.customerScrap.update({ applicationFormForOperatinalTeam, goldValuationForOperatinalTeam, scrapStatusForOperatinalTeam, commentByOperatinalTeam, scrapStageId: approvedStageId.id, operatinalTeamId, modifiedBy }, { where: { id: scrapId }, transaction: t })
            //securedLoanIdUpdate
            // await models.customerLoan.update({ loanUniqueId: loanUniqueId }, { where: { id: loanId }, transaction: t })
            // if (!check.isEmpty(checkUnsecuredLoan)) {
            //     //unsecuredLoanIdUpdate
            //     await models.customerLoan.update({ loanUniqueId: unsecuredLoanUniqueId }, { where: { id: checkUnsecuredLoan.unsecuredLoanId }, transaction: t })
            // }

            await models.customerScrapHistory.create({ scrapId, action: OPERATIONAL_TEAM_RATING, modifiedBy }, { transaction: t });

        })

        return res.status(200).json({ message: 'success' })
    }
}

//function of loan documents
exports.scrapDocuments = async (req, res, next) => {

    let { purchaseVoucher, purchaseInvoice, saleInvoice, scrapId } = req.body
    let createdBy = req.userData.id;
    let modifiedBy = req.userData.id;

    let checkDocument = await models.customerScrapDocument.findOne({ where: { scrapId: scrapId } })

    if (check.isEmpty(checkDocument)) {
        // remove if condiction
        let scrapData = await sequelize.transaction(async t => {
            let stageId = await models.scrapStage.findOne({ where: { stageName: 'OPS team rating' }, transaction: t })

            await models.customerScrap.update({ scrapStageId: stageId.id, modifiedBy }, { where: { id: scrapId }, transaction: t })

            await models.customerScrapDocument.create({ scrapId, purchaseVoucher, purchaseInvoice, saleInvoice, createdBy, modifiedBy }, { transaction: t })

            await models.customerScrapHistory.create({ scrapId, action: LOAN_DOCUMENTS, modifiedBy }, { transaction: t });

        })

        return res.status(200).json({ message: 'success', scrapId })
    } else {
        let scrapData = await sequelize.transaction(async t => {

            await models.customerScrapDocument.update({ purchaseVoucher, purchaseInvoice, saleInvoice, modifiedBy }, { where: { scrapId: scrapId }, transaction: t })

            await models.customerScrapHistory.create({ scrapId, action: SCRAP_DOCUMENTS, modifiedBy }, { transaction: t });

            return loan
        })
        return res.status(200).json({ message: 'success', scrapId })
    }
}

exports.singleScrapDetails = async (req, res, next) => {

    const { scrapId } = req.query;

    let customerScrap = await models.customerScrap.findOne({where: {id: scrapId},
    include: [{
        model: models.customer,
        as: 'customer',
        attributes: ['id', 'customerUniqueId', 'firstName', 'lastName', 'mobileNumber', 'email', 'kycStatus']
    },
    {
        model: models.customerScrapPersonalDetail,
        as: 'scrapPersonalDetail',
        attributes: ['scrapId', 'startDate', 'kycStatus']
    },
    {
        model: models.customerScrapBankDetails,
        as: 'scrapBankDetails',
        attributes: ['scrapId', 'paymentType', 'bankName', 'bankBranch', 'acHolderName', 'acNumber', 'passbookProof', 'createdBy','modifiedBy']
    },
    {
        model: models.customerAcknowledgement,
        as: 'customerScrapAcknowledgement',
        attributes: ['scrapId', 'approxPurityReading', 'xrfMachineReading', 'customerConfirmation']
    },
    {
        model: models.customerScrapDocument,
        as: 'scrapDocument',
        attributes: ['scrapId', 'purchaseVoucher', 'purchaseInvoice', 'saleInvoice']
    },
    {
        model: models.customerScrapOrnamentsDetail,
        as: 'scrapOrnamentsDetail',
        include: 
            {
                model: models.ornamentType,
                as: "ornamentType",
                attributes: ['name','id']
            },
        // attributes: ['scrapId', 'ornamentTypeId', 'quantity', 'grossWeight', 'netWeight', 'deductionWeight','karat','purity','fineWeight','imageOne','imageTwo','imageThree','ornamentImage','ltvAmount','scrapAmount']
    }]
    });

    let ornamentTypesss = [];
    if (customerScrap.scrapOrnamentsDetail.length != 0) {
        for (let ornamentsDetail of customerScrap.scrapOrnamentsDetail) {
            ornamentTypesss.push({ ornamentType: ornamentsDetail.ornamentType, id: ornamentsDetail.id })
        }
        customerScrap.dataValues.ornamentType = ornamentTypesss;
    }

    return res.status(200).json({ customerScrap })
}

//  FUNCTION FOR ADD PACKAGE IMAGES
exports.addPackageImagesForScrap = async (req, res, next) => {
    try{
        let { scrapId, emptyPacketWithRefiningOrnament, sealedPacketWithWeight, sealedPacketWithCustomer, packetOrnamentArray } = req.body;
        let createdBy = req.userData.id;
        let modifiedBy = req.userData.id;
        let scrapDetails = await models.customerScrap.findOne({ where: { id: scrapId } });
    
        let getPackets = await models.customerScrapPackageDetails.findAll({ where: { scrapId: scrapId } })
        if (!check.isEmpty(getPackets)) {
            return res.status(400).json({ message: `Packets has been already assign` })
        }
    
        if (scrapDetails !== null && scrapDetails.scrapStatusForAppraiser === 'approved') {
    
            //FOR PACKET UPDATE
            let packetArray = await packetOrnamentArray.map(ele => {
                return ele.packetId
            })
            let packetUpdateArray = await packetArray.map(ele => {
                let obj = {}
                obj.id = ele;
                obj.customerId = scrapDetails.customerId;
                obj.scrapId = scrapId;
                obj.modifiedBy = modifiedBy
                obj.packetAssigned = true;
                return obj
            })
    
            await sequelize.transaction(async (t) => {
                let stageId = await models.loanStage.findOne({ where: { name: 'bm rating' }, transaction: t })
    
                await models.customerScrap.update({ scrapStageId: stageId.id, modifiedBy }, { where: { id: scrapId }, transaction: t })
    
                let scrapPacket = await models.customerScrapPackageDetails.create({ scrapId, emptyPacketWithRefiningOrnament, sealedPacketWithWeight, sealedPacketWithCustomer, createdBy, modifiedBy }, { transaction: t });
    
                let packetMapping = []
                for (single of packetOrnamentArray) {
                    let entry = {}
                    entry['customerScrapPackageDetailId'] = scrapPacket.id
                    entry['packetId'] = single.packetId
                    packetMapping.push(entry)
                }
    
                await models.customerScrapPacket.bulkCreate(packetMapping, { transaction: t })
    
                // let ornamentPacketData = [];
                // for (let x of packetOrnamentArray) {
                //     for (let singleOrnamentId of x.ornamentsId) {
                //         let pushData = {}
                //         pushData['packetId'] = Number(x.packetId)
                //         pushData['ornamentTypeId'] = Number(singleOrnamentId)
                //         ornamentPacketData.push(pushData)
                //     }
                // }
                // console.log(ornamentPacketData)
                // await models.scrapPacketOrnament.bulkCreate(ornamentPacketData, { transaction: t })
    
                await models.scrapPacket.bulkCreate(packetUpdateArray, {
                    updateOnDuplicate: ["customerId", "scrapId", "modifiedBy", "packetAssigned"]
                }, { transaction: t })
    
                await models.customerLoanHistory.create({ scrapId, action: PACKET_IMAGES, modifiedBy }, { transaction: t });
    
            })
    
            return res.status(200).json({ message: `Packets added successfully` })
    
        } else {
            res.status(404).json({ message: 'Given scrap id is not proper' })
        }
    }catch(err){
        console.log(err);
    }
    
}