const models = require('../../../models');
const sequelize = models.sequelize;
const Sequelize = models.Sequelize;
const Op = Sequelize.Op;
const paginationFUNC = require('../../../utils/pagination'); // IMPORTING PAGINATION FUNCTION
const check = require("../../../lib/checkLib"); // IMPORTING CHECKLIB 
const moment = require('moment');
var pdf = require("pdf-creator-node"); // PDF CREATOR PACKAGE
var fs = require('fs');

const { BASIC_DETAILS_SUBMIT, CUSTOMER_ACKNOWLEDGEMENT, ORNAMENTES_DETAILS, ORNAMENTES_MELTING_DETAILS, BANK_DETAILS, APPRAISER_RATING, BM_RATING, OPERATIONAL_TEAM_RATING, PACKET_IMAGES, SCRAP_DOCUMENTS, SCRAP_DISBURSEMENT, PROCESS_COMPLETED } = require('../../../utils/customerScrapHistory')

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
    });

    let incompleteStageId = await models.scrapStage.findOne({ where: { stageName: "incomplete" } });
    let completedStageId = await models.scrapStage.findOne({ where: { stageName: "completed" } });

    
    if (!check.isEmpty(customerScrapStage)) {

        if (customerScrapStage.scrapStageId == incompleteStageId.id) {
            res.status(200).json({ message: 'customer details fetch successfully', customerData });
        }
        if(customerScrapStage.scrapStageId == completedStageId.id){
            res.status(200).json({ message: 'customer details fetch successfully', customerData });
        }
        
        const firstName = customerScrapStage.customer.firstName
        const lastName = customerScrapStage.customer.lastName

        let customerCurrentStage = customerScrapStage.customerScrapCurrentStage
        // let scrapId = await models.customerScrap.findOne({ where: { masterLoanId: customerScrapStage.id } })
        if (customerCurrentStage == '2') {
            return res.status(200).json({ message: 'success', scrapId: customerScrapStage.id, scrapCurrentStage: customerCurrentStage })
        } else if (customerCurrentStage == '3') {
            return res.status(200).json({ message: 'success', scrapId: customerScrapStage.id, scrapCurrentStage: customerCurrentStage })
        } else if (customerCurrentStage == '4') {
            return res.status(200).json({ message: 'success', scrapId: customerScrapStage.id, scrapCurrentStage: customerCurrentStage, finalScrapAmount: customerScrapStage.finalScrapAmount })
        } else if (customerCurrentStage == '5') {
            return res.status(200).json({ message: 'success', scrapId: customerScrapStage.id, scrapCurrentStage: customerCurrentStage })
        } else if (customerCurrentStage == '6') {
            return res.status(200).json({ message: 'success', scrapId: customerScrapStage.id, scrapCurrentStage: customerCurrentStage })
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
            return res.status(200).json({ message: 'success', scrapId: customerScrap.id, scrapCurrentStage: '2' });
        }
    }

    let scrapData = await sequelize.transaction(async t => {

        let scrap = await models.customerScrap.create({ customerId: customerId, scrapStageId: stageId.id, customerScrapCurrentStage: "2", internalBranchId: req.userData.internalBranchId, createdBy, modifiedBy, }, { transaction: t });

        await models.customerScrapHistory.create({ scrapId: scrap.id, action: BASIC_DETAILS_SUBMIT, modifiedBy }, { transaction: t });

        await models.customerScrapPersonalDetail.create({ scrapId: scrap.id, customerUniqueId, startDate, kycStatus, createdBy, modifiedBy, }, { transaction: t })
        return scrap
    })
    return res.status(200).json({ message: 'success', scrapStage: stageId, scrapId: scrapData.id, scrapCurrentStage: '2' })

}

//function for submitting acknowledgement details  DONE
exports.acknowledgementDetails = async (req, res, next) => {
    let { processingCharges, standardDeduction, customerConfirmationStatus, customerConfirmation, scrapId } = req.body;
    let createdBy = req.userData.id;
    let modifiedBy = req.userData.id;
    if (customerConfirmationStatus == "confirmed") {
        let checkAcknowledgement = await models.customerAcknowledgement.findOne({ where: { scrapId } });

        if (check.isEmpty(checkAcknowledgement)) {
            let scrapData = await sequelize.transaction(async t => {

                let scrap = await models.customerScrap.update({ customerScrapCurrentStage: '4', modifiedBy }, { where: { id: scrapId }, transaction: t })

                await models.customerScrapHistory.create({ scrapId, action: CUSTOMER_ACKNOWLEDGEMENT, modifiedBy }, { transaction: t });

                await models.customerAcknowledgement.create({ scrapId, processingCharges, standardDeduction, customerConfirmation, customerConfirmationStatus, createdBy, modifiedBy }, { transaction: t })
                return scrap
            })
            return res.status(200).json({ message: 'success', scrapId, scrapCurrentStage: '4', processingCharges })
        } else {
            // let scrapSubmitted = await models.customerScrap.findOne({ where: { id: scrapId } })
            let scrapData = await sequelize.transaction(async t => {

                // if (loanSubmitted.isLoanSubmitted == false) {
                var scrap = await models.customerScrap.update({ customerScrapCurrentStage: '4', modifiedBy }, { where: { id: scrapId }, transaction: t })
                // }
                await models.customerScrapHistory.create({ scrapId, action: CUSTOMER_ACKNOWLEDGEMENT, modifiedBy }, { transaction: t });

                await models.customerAcknowledgement.update({ scrapId, processingCharges, standardDeduction, customerConfirmation, customerConfirmationStatus, modifiedBy }, { where: { scrapId: scrapId }, transaction: t })
                return scrap
            })
            return res.status(200).json({ message: 'success', scrapId, scrapCurrentStage: '4', processingCharges })

        }
    } else {
        let checkAcknowledgement = await models.customerAcknowledgement.findOne({ where: { scrapId } });
        let incompleteStageId = await models.scrapStage.findOne({ where: { stageName: "incomplete" } });

        if (check.isEmpty(checkAcknowledgement)) {
            let scrapData = await sequelize.transaction(async t => {

                let scrap = await models.customerScrap.update({ customerScrapCurrentStage: '3', scrapStageId: incompleteStageId.id, modifiedBy }, { where: { id: scrapId }, transaction: t })

                await models.customerScrapHistory.create({ scrapId, action: CUSTOMER_ACKNOWLEDGEMENT, modifiedBy }, { transaction: t });

                await models.customerAcknowledgement.create({ scrapId, processingCharges, standardDeduction, customerConfirmationStatus, customerConfirmation, createdBy, modifiedBy }, { transaction: t });
                return scrap
            })
            return res.status(200).json({ message: 'success', scrapId, scrapCurrentStage: '3' })
        } else {
            // let scrapSubmitted = await models.customerScrap.findOne({ where: { id: scrapId } })
            let scrapData = await sequelize.transaction(async t => {

                // if (loanSubmitted.isLoanSubmitted == false) {
                var scrap = await models.customerScrap.update({ customerScrapCurrentStage: '3', scrapStageId: incompleteStageId.id, modifiedBy }, { where: { id: scrapId }, transaction: t })
                // }
                await models.customerScrapHistory.create({ scrapId, action: CUSTOMER_ACKNOWLEDGEMENT, modifiedBy }, { transaction: t });

                await models.customerAcknowledgement.update({ scrapId, processingCharges, standardDeduction, customerConfirmationStatus, customerConfirmation, modifiedBy }, { where: { scrapId: scrapId }, transaction: t });
                return scrap
            })
            return res.status(200).json({ message: 'success', scrapId, scrapCurrentStage: '3' })

        }
    }

}

//function for scrap bank details DONE
exports.scrapBankDetails = async (req, res, next) => {
    let { scrapId, paymentType, bankName, accountNumber, ifscCode, bankBranchName, accountHolderName, passbookProof } = req.body
    let createdBy = req.userData.id;
    let modifiedBy = req.userData.id;

    let checkBank = await models.customerScrapBankDetails.findOne({ where: { scrapId: scrapId } })

    if (check.isEmpty(checkBank)) {
        let scrapData = await sequelize.transaction(async t => {

            await models.customerScrap.update({ customerScrapCurrentStage: '6', modifiedBy }, { where: { id: scrapId }, transaction: t })

            await models.customerScrapHistory.create({ scrapId, action: BANK_DETAILS, modifiedBy }, { transaction: t });

            let scrap = await models.customerScrapBankDetails.create({ scrapId, paymentType, bankName, acNumber: accountNumber, ifscCode, bankBranch: bankBranchName, acHolderName: accountHolderName, passbookProof, createdBy, modifiedBy }, { transaction: t });

            return scrap
        })
        return res.status(200).json({ message: 'success', scrapId, scrapCurrentStage: '6' });
    } else {

        // let loanSubmitted = await models.customerLoanMaster.findOne({ where: { id: masterLoanId } })

        let scrapData = await sequelize.transaction(async t => {
            // if (loanSubmitted.isLoanSubmitted == false) {
            await models.customerScrap.update({ customerScrapCurrentStage: '6', modifiedBy }, { where: { id: scrapId }, transaction: t })
            // }
            await models.customerScrapHistory.create({ scrapId, action: BANK_DETAILS, modifiedBy }, { transaction: t });
            let scrap = await models.customerScrapBankDetails.update({ paymentType, bankName, acNumber: accountNumber, ifscCode, bankBranch: bankBranchName, acHolderName: accountHolderName, passbookProof, createdBy, modifiedBy }, { where: { scrapId: scrapId }, transaction: t });

            return scrap
        })
        return res.status(200).json({ message: 'success', scrapId, scrapCurrentStage: '6' });
    }

}

//function for submitting ornament details  DONE
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
            await models.customerScrap.update({ customerScrapCurrentStage: '3', modifiedBy, finalScrapAmount }, { where: { id: scrapId }, transaction: t })
            let createdOrnaments = await models.customerScrapOrnamentsDetail.bulkCreate(allOrnmanets, { returning: true }, { transaction: t });

            await models.customerScrapHistory.create({ scrapId, action: ORNAMENTES_DETAILS, modifiedBy }, { transaction: t });

            return createdOrnaments
        })
        return res.status(200).json({ message: 'success', scrapId, scrapCurrentStage: '3', finalScrapAmount, ornaments: scrapData })
    } else {

        // let loanSubmitted = await models.customerLoanMaster.findOne({ where: { id: masterLoanId } })
        let scrapData = await sequelize.transaction(async t => {
            // if (loanSubmitted.isLoanSubmitted == false) {
            await models.customerScrap.update({ customerScrapCurrentStage: '3', modifiedBy, finalScrapAmount }, { where: { id: scrapId }, transaction: t })
            // }

            await models.customerScrapHistory.create({ scrapId, action: ORNAMENTES_DETAILS, modifiedBy }, { transaction: t });

            await models.customerScrapOrnamentsDetail.destroy({ where: { scrapId: scrapId }, transaction: t });
            // let createdOrnaments = await models.customerScrapOrnamentsDetail.bulkCreate(allOrnmanets, { returning: true }, { transaction: t });

            let createdOrnaments = []
            for (let purityTestData of allOrnmanets) {
                delete purityTestData.id;
                var ornaments = await models.customerScrapOrnamentsDetail.create(purityTestData, { transaction: t });
                createdOrnaments.push(ornaments)
            }

            return createdOrnaments;
        })
        return res.status(200).json({ message: 'success', scrapId, scrapCurrentStage: '3', finalScrapAmount, ornaments: scrapData });
    }
}

//function for submitting melting ornament details  DONE
exports.scrapOrnmanetMeltingDetails = async (req, res, next) => {

    let { scrapId, grossWeight, netWeight, deductionWeight, karat, purityReading, ornamentImageWithWeight, ornamentImageWithXrfMachineReading, ornamentImage, customerConfirmation, finalScrapAmountAfterMelting, eligibleScrapAmount } = req.body
    let createdBy = req.userData.id;
    let modifiedBy = req.userData.id;

    let checkMeltingOrnaments = await models.scrapMeltingOrnament.findAll({ where: { scrapId: scrapId } });

    let checkFinalScrap = await models.customerScrap.findOne({
        where: { id: scrapId },
        include: [{
            model: models.customer,
            as: 'customer'
        }]
    })

    let firstName = checkFinalScrap.customer.firstName;
    let lastName = checkFinalScrap.customer.lastName;

    if (checkMeltingOrnaments.length == 0) {
        let scrapData = await sequelize.transaction(async t => {
            await models.customerScrap.update({ customerScrapCurrentStage: '5', modifiedBy, finalScrapAmountAfterMelting, eligibleScrapAmount }, { where: { id: scrapId }, transaction: t });

            let createdMeltingOrnaments = await models.scrapMeltingOrnament.create({ scrapId, grossWeight, netWeight, deductionWeight, karat, purityReading, ornamentImageWithWeight, ornamentImageWithXrfMachineReading, ornamentImage, customerConfirmation, createdBy, modifiedBy }, { transaction: t });

            await models.customerScrapHistory.create({ scrapId, action: ORNAMENTES_MELTING_DETAILS, modifiedBy }, { transaction: t });

            return createdMeltingOrnaments
        })
        return res.status(200).json({ message: 'success', scrapId, scrapCurrentStage: '5', finalScrapAmountAfterMelting, eligibleScrapAmount, ornaments: scrapData, firstName, lastName });
    } else {

        // let loanSubmitted = await models.customerLoanMaster.findOne({ where: { id: masterLoanId } })
        let scrapData = await sequelize.transaction(async t => {
            // if (loanSubmitted.isLoanSubmitted == false) {
            await models.customerScrap.update({ customerScrapCurrentStage: '5', modifiedBy, finalScrapAmountAfterMelting, eligibleScrapAmount }, { where: { id: scrapId }, transaction: t })
            // }

            await models.customerScrapHistory.create({ scrapId, action: ORNAMENTES_MELTING_DETAILS, modifiedBy }, { transaction: t });

            await models.scrapMeltingOrnament.destroy({ where: { scrapId: scrapId }, transaction: t });

            let createdMeltingOrnaments = await models.scrapMeltingOrnament.create({ scrapId, grossWeight, netWeight, deductionWeight, karat, purityReading, ornamentImageWithWeight, ornamentImageWithXrfMachineReading, ornamentImage, customerConfirmation, createdBy, modifiedBy }, { transaction: t });

            return createdMeltingOrnaments;
        })
        return res.status(200).json({ message: 'success', scrapId, scrapCurrentStage: '5', finalScrapAmountAfterMelting, eligibleScrapAmount, ornaments: scrapData, firstName, lastName });
    }
}

//function for appraiser rating
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
            if (ornament.scrapUniqueId == null) {
                var scrapUniqueId = null;
                //secured loan Id
                scrapUniqueId = `SCRAP${Math.floor(1000 + Math.random() * 9000)}`;

                await models.customerScrap.update({ scrapUniqueId: scrapUniqueId }, { where: { id: scrapId }, transaction: t })
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

//function for bm rating
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
                    { scrapStatusForAppraiser: "pending", applicationFormForBM, goldValuationForBM, scrapStatusForBM, commentByBM, scrapStageId: incompleteStageId.id, bmId, modifiedBy },
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

// function ops team rating
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
        let approvedStageId = await models.scrapStage.findOne({ where: { stageName: 'disbursement pending' } });

        if (applicationFormForOperatinalTeam == false || goldValuationForOperatinalTeam == false) {
            return res.status(400).json({ message: `One of field is not verified` });
        }
        await sequelize.transaction(async (t) => {

            await models.customerScrap.update({ applicationFormForOperatinalTeam, goldValuationForOperatinalTeam, scrapStatusForOperatinalTeam, commentByOperatinalTeam, scrapStageId: approvedStageId.id, operatinalTeamId, modifiedBy }, { where: { id: scrapId }, transaction: t })

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

            await models.customerScrapHistory.create({ scrapId, action: SCRAP_DOCUMENTS, modifiedBy }, { transaction: t });

        })

        return res.status(200).json({ message: 'Documents added successfully', scrapId })
    } else {
        console.log("err");
        let scrapData = await sequelize.transaction(async t => {
            let stageId = await models.scrapStage.findOne({ where: { stageName: 'OPS team rating' }, transaction: t })

            await models.customerScrapDocument.update({ purchaseVoucher, purchaseInvoice, saleInvoice, modifiedBy }, { where: { scrapId: scrapId }, transaction: t })

            await models.customerScrap.update({ scrapStageId: stageId.id, modifiedBy }, { where: { id: scrapId }, transaction: t })

            await models.customerScrapHistory.create({ scrapId, action: SCRAP_DOCUMENTS, modifiedBy }, { transaction: t });

        })
        return res.status(200).json({ message: 'Documents added successfully', scrapId })
    }

}

exports.singleScrapDetails = async (req, res, next) => {
    const { scrapId } = req.query;

    let customerScrap = await models.customerScrap.findOne({
        where: { id: scrapId },
        include: [{
            model: models.scrapStage,
            as: 'scrapStage',
            attributes: ['id', 'stageName']
        },
        {
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
            attributes: ['scrapId', 'paymentType', 'bankName', ['bank_branch', 'bankBranchName'], ['ac_number', 'accountNumber'], ['ac_holder_name', 'accountHolderName'], 'ifscCode', 'passbookProof', 'createdBy', 'modifiedBy']
        },
        {
            model: models.customerAcknowledgement,
            as: 'customerScrapAcknowledgement',
            attributes: ['scrapId', 'processingCharges', 'standardDeduction', 'customerConfirmation', 'customerConfirmationStatus']
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
                // attributes: ['name', 'id']
            },
            attributes: ['id', 'scrapId', 'ornamentTypeId', 'quantity', 'grossWeight', 'netWeight', 'deductionWeight', 'karat', 'approxPurityReading', 'ornamentImage', 'ornamentImageWithWeight', 'ornamentImageWithXrfMachineReading', 'ltvAmount', 'ltvAmount', 'scrapAmount']
        },
        {
            model: models.scrapMeltingOrnament,
            as: 'meltingOrnament',
            attributes: ['id', 'scrapId', 'grossWeight', 'netWeight', 'deductionWeight', 'karat', 'purityReading', 'ornamentImageWithWeight', 'ornamentImageWithXrfMachineReading', 'ornamentImage', 'customerConfirmation']
        },
        {
            model: models.customerScrapPackageDetails,
            as: 'scrapPacketDetails',
            attributes: ['scrapId', 'emptyPacketWithRefiningOrnament', 'sealedPacketWithWeight', 'sealedPacketWithCustomer'],
            include: [{
                model: models.scrapPacket,
                as: 'CustomerScrapPackageDetail',
                // include: [{
                //     model: models.scrapPacketOrnament,
                //     as: 'scrapPacketOrnament',
                // include: [{
                //     model: models.ornamentType,
                //     as: 'ornamentType'
                // }]
                // }]
            }]
        },
        {
            model: models.customerScrapDisbursement,
            as: 'scrapDisbursement',
            attributes: ['id', 'scrapId', 'transactionId', 'date', 'paymentMode', 'ifscCode', 'bankName', 'bankBranch', 'acHolderName', 'acNumber', 'disbursementStatus']  
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

//  function for add packet image for scrap
exports.addPackageImagesForScrap = async (req, res, next) => {
    let { scrapId, emptyPacketWithNoOrnament, sealingPacketWithWeight, sealingPacketWithCustomer, packetOrnamentArray } = req.body;
    let createdBy = req.userData.id;
    let modifiedBy = req.userData.id;
    let scrapDetails = await models.customerScrap.findOne({ where: { id: scrapId } });

    let getPackets = await models.customerScrapPackageDetails.findAll({ where: { scrapId: scrapId } });

    let packetArray = await packetOrnamentArray.map(ele => {
        return ele.packetId
    })
    let packetUpdateArray = await packetArray.map(ele => {
        let obj = {}
        obj.id = Number(ele);
        obj.customerId = scrapDetails.customerId;
        obj.scrapId = scrapId;
        obj.modifiedBy = modifiedBy
        obj.packetAssigned = true;
        return obj
    })

    if (check.isEmpty(getPackets)) {

        await sequelize.transaction(async (t) => {
            let stageId = await models.scrapStage.findOne({ where: { stageName: 'bm rating' }, transaction: t })

            await models.customerScrap.update({ scrapStageId: stageId.id, modifiedBy }, { where: { id: scrapId }, transaction: t })

            let scrapPacket = await models.customerScrapPackageDetails.create({ scrapId, emptyPacketWithRefiningOrnament: emptyPacketWithNoOrnament, sealedPacketWithWeight: sealingPacketWithWeight, sealedPacketWithCustomer: sealingPacketWithCustomer, createdBy, modifiedBy }, { transaction: t })

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
            // await models.packetOrnament.bulkCreate(ornamentPacketData, { transaction: t })

            await models.scrapPacket.bulkCreate(packetUpdateArray, {
                updateOnDuplicate: ["customerId", "scrapId", "modifiedBy", "packetAssigned"]
            }, { transaction: t })

            await models.customerScrapHistory.create({ scrapId, action: PACKET_IMAGES, modifiedBy }, { transaction: t });

        })
    } else {
        await sequelize.transaction(async (t) => {
            let stageId = await models.scrapStage.findOne({ where: { stageName: 'bm rating' }, transaction: t })

            await models.customerScrap.update({ scrapStageId: stageId.id, modifiedBy }, { where: { id: scrapId }, transaction: t })

            let loanPacket = await models.customerScrapPackageDetails.update({ emptyPacketWithRefiningOrnament: emptyPacketWithNoOrnament, sealedPacketWithWeight: sealingPacketWithWeight, sealedPacketWithCustomer: sealingPacketWithCustomer, modifiedBy }, { where: { scrapId: scrapId }, transaction: t })

            let previousSelectedPacket = await models.scrapPacket.findAll({ where: { scrapId: scrapId } });

            let packetId = previousSelectedPacket.map(ele => ele.id)

            let x = await models.customerScrapPacket.destroy({ where: { customerScrapPackageDetailId: getPackets[0].id }, transaction: t })

            // let y = await models.packetOrnament.destroy({ where: { packetId: { [Op.in]: packetId } }, transaction: t })

            let z = await models.scrapPacket.update({ customerId: null, scrapId: null, packetAssigned: false }, {
                where: { id: { [Op.in]: packetId } }, transaction: t
            })

            let packetMapping = []
            for (single of packetOrnamentArray) {
                let entry = {}
                entry['customerScrapPackageDetailId'] = getPackets[0].id
                entry['packetId'] = single.packetId
                packetMapping.push(entry)
            }

            for (let ele of packetMapping) {
                await models.customerScrapPacket.create({ customerScrapPackageDetailId: ele.customerScrapPackageDetailId, packetId: ele.packetId }, { transaction: t });

            }

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
            // await models.packetOrnament.bulkCreate(ornamentPacketData, { transaction: t })

            for (let ele of packetUpdateArray) {
                await models.scrapPacket.update({
                    customerId: ele.customerId, scrapId: ele.scrapId, modifiedBy: ele.modifiedBy, packetAssigned: true
                }
                    , { where: { id: { [Op.in]: packetId } }, transaction: t });
            }

            // console.log(packetUpdateArray);
            // await models.scrapPacket.bulkCreate(packetUpdateArray, {
            //     updateOnDuplicate: ["customerId", "scrapId", "modifiedBy", "packetAssigned"]
            // }, { transaction: t });

            await models.customerScrapHistory.create({ scrapId, action: PACKET_IMAGES, modifiedBy }, { transaction: t });
        })

    }
    return res.status(200).json({ message: `Packets added successfully` });

}

//function for disbursement
exports.disbursementOfScrapBankDetails = async (req, res, next) => {
    let { scrapId } = req.query;
    let createdBy = req.userData.id;
    let userBankDetails = await models.customerScrapBankDetails.findOne({
        where: { scrapId: scrapId },
        attributes: ['paymentType', 'bankName', ['bank_branch', 'bankBranchName'], ['ac_holder_name', 'accountHolderName'], ['ac_number', 'accountNumber'], 'ifscCode']
    });
    let scrapbrokerId = await models.userInternalBranch.findOne({ where: { userId: createdBy } });
    let brokerBankDetails = await models.internalBranch.findOne({
        where: { id: scrapbrokerId.internalBranchId },
        attributes: ['bankName', 'bankBranch', 'accountHolderName', 'accountNumber', 'ifscCode']
    });

    let amount = await models.customerScrap.findOne({
        where: { id: scrapId },
        attributes: ['finalScrapAmountAfterMelting']
    });
    let data = {
        userBankDetail: userBankDetails,
        branchBankDetail: brokerBankDetails,
        paymentType: userBankDetails.paymentType,
        finalScrapAmount: Math.round(amount.finalScrapAmountAfterMelting),
        scrapId
    }
    return res.status(200).json({ message: 'success', data: data })

}

//  function for disbursement og scrap amount
exports.disbursementOfScrapAmount = async (req, res, next) => {
    let { scrapId, scrapAmount, transactionId, date, paymentMode, ifscCode, bankName, bankBranch,
        accountHolderName, accountNumber, disbursementStatus } = req.body;
    let createdBy = req.userData.id;
    let modifiedBy = req.userData.id;
    let scrapDetails = await models.customerScrap.findOne({ where: { id: scrapId } });

    let scrapDisbursementDetails = await models.customerScrapDisbursement.findOne({ where: { id: scrapId } });

    if (!check.isEmpty(scrapDisbursementDetails)) {
        return res.status(400).json({ message: `This scrap is already disbursed` })
    }

    let matchStageId = await models.scrapStage.findOne({ where: { stageName: 'disbursement pending' } });

    if (scrapDetails.scrapStageId == matchStageId.id) {

        await sequelize.transaction(async (t) => {

            let stageId = await models.scrapStage.findOne({ where: { stageName: 'disbursed' } });

            await models.customerScrap.update({ disbursementAmount: scrapAmount, scrapStageId: stageId.id, isDisbursed: true }, { where: { id: scrapId }, transaction: t });

            await models.customerScrapBankDetails.update({ paymentType: paymentMode, bankName, acNumber: accountNumber, ifscCode, bankBranch, acHolderName: accountHolderName, createdBy, modifiedBy }, { where: { scrapId: scrapId }, transaction: t });

            await models.customerScrapDisbursement.create({
                scrapId, scrapAmount, transactionId, date, paymentMode, ifscCode, bankName, bankBranch,
                acHolderName: accountHolderName, acNumber: accountNumber, disbursementStatus, createdBy, modifiedBy
            }, { transaction: t })

            await models.customerScrapHistory.create({ scrapId, action: SCRAP_DISBURSEMENT, modifiedBy }, { transaction: t });

        })
        return res.status(200).json({ message: 'Your scrap amount has been disbursed successfully' });
    } else {
        return res.status(404).json({ message: 'Given scrap id is not proper' });
    }

}

//  function for apploed scrap detail
exports.appliedScrapDetails = async (req, res, next) => {
    let stage = await models.scrapStage.findOne({
        where: { stageName: 'applying' }
    })

    let { appraiserApproval, bmApproval, scrapStageId, operatinalTeamApproval } = req.query
    let { search, offset, pageSize } =
        paginationFUNC.paginationWithFromTo(req.query.search, req.query.from, req.query.to);

    let query = {};

    if (appraiserApproval) {
        appraiserApproval = req.query.appraiserApproval.split(",");
        query.scrapStatusForAppraiser = appraiserApproval
    }
    if (bmApproval) {
        bmApproval = req.query.bmApproval.split(",");
        query.scrapStatusForBM = bmApproval
    }
    if (operatinalTeamApproval) {
        operatinalTeamApproval = req.query.operatinalTeamApproval.split(",");
        query.scrapStatusForOperatinalTeam = operatinalTeamApproval
    }
    if (scrapStageId) {
        scrapStageId = req.query.scrapStageId.split(",");
        query.scrapStageId = scrapStageId;
    }


    let searchQuery = {
        [Op.and]: [query, {
            [Op.or]: {
                "$customer.first_name$": { [Op.iLike]: search + '%' },
                "$customer.last_name$": { [Op.iLike]: search + '%' },
                "$customer.mobile_number$": { [Op.iLike]: search + '%' },
                "$customer.pan_card_number$": { [Op.iLike]: search + '%' },
                "$customer.customer_unique_id$": { [Op.iLike]: search + '%' },

                appraiser_status: sequelize.where(
                    sequelize.cast(sequelize.col("customerScrap.scrap_status_for_appraiser"), "varchar"),
                    {
                        [Op.iLike]: search + "%",
                    }
                ),
                bm_status: sequelize.where(
                    sequelize.cast(sequelize.col("customerScrap.scrap_status_for_bm"), "varchar"),
                    {
                        [Op.iLike]: search + "%",
                    }
                ),
                operatinal_team_status: sequelize.where(
                    sequelize.cast(sequelize.col("customerScrap.scrap_status_for_operatinal_team"), "varchar"),
                    {
                        [Op.iLike]: search + "%",
                    }
                )
            },
        }],
        scrapStageId: { [Op.notIn]: [stage.id] },
        isActive: true
    };
    let internalBranchId = req.userData.internalBranchId
    let internalBranchWhere;
    if (req.userData.userTypeId != 4) {
        internalBranchWhere = { isActive: true, internalBranchId: internalBranchId }
    } else {
        internalBranchWhere = { isActive: true }
    }

    let associateModel =
        [{
            model: models.scrapStage,
            as: 'scrapStage',
            attributes: ['id', 'stageName']
        }, {
            model: models.customer,
            as: 'customer',
            where: internalBranchWhere,
            attributes: ['id', 'firstName', 'lastName', 'panCardNumber', 'customerUniqueId', 'mobileNumber']
        },
        {
            model: models.customerScrapPersonalDetail,
            as: 'scrapPersonalDetail',
            attributes: ['startDate']
        },
        {
            model: models.scrapQuickPay,
            as: 'scrapQuickPay',
            attributes: ['depositAmount']
        }];


    let appliedScrapDetails = await models.customerScrap.findAll({
        where: searchQuery,
        subQuery: false,
        include: associateModel,
        order: [
            ["updatedAt", "DESC"]
        ],
        attributes: ['id', 'customerId', 'scrapUniqueId', 'scrapStatusForAppraiser', 'scrapStatusForBM', 'scrapStatusForOperatinalTeam', 'finalScrapAmountAfterMelting', 'eligibleScrapAmount', 'customerScrapCurrentStage', 'scrapStageId', 'isScrapSubmitted', 'isDisbursed'],
        offset: offset,
        limit: pageSize,

    });
    let count = await models.customerScrap.findAll({
        where: searchQuery,
        subQuery: false,
        include: associateModel,
    });

    if (appliedScrapDetails.length === 0) {
        return res.status(200).json([]);
    } else {
        return res.status(200).json({ message: 'Applied scrap details fetch successfully', appliedScrapDetails, count: count.length });
    }

}

//  function for get scrap details
exports.getScrapDetails = async (req, res, next) => {

    let { search, offset, pageSize } =
        paginationFUNC.paginationWithFromTo(req.query.search, req.query.from, req.query.to);

    let stageId = await models.scrapStage.findOne({ where: { stageName: 'disbursed' } });
    let query = {}
    let searchQuery = {
        [Op.and]: [query, {
            [Op.or]: {
                "$customer.first_name$": { [Op.iLike]: search + '%' },
                "$customer.last_name$": { [Op.iLike]: search + '%' },
                "$customer.customer_unique_id$": { [Op.iLike]: search + '%' },
                "$customerScrap.scrap_unique_id$": { [Op.iLike]: search + '%' },
                finalScrapAmountAfterMelting: sequelize.where(
                    sequelize.cast(sequelize.col("customerScrap.final_scrap_amount_after_melting"), "varchar"),
                    {
                        [Op.iLike]: search + "%",
                    }
                ),
            },
        }],
        isActive: true,
        scrapStageId: stageId.id
    };
    let internalBranchId = req.userData.internalBranchId
    let internalBranchWhere;
    if (req.userData.userTypeId != 4) {
        internalBranchWhere = { isActive: true, internalBranchId: internalBranchId }
    } else {
        internalBranchWhere = { isActive: true }
    }

    let associateModel = [
        {
            model: models.customer,
            as: 'customer',
            where: internalBranchWhere,
            attributes: ['id', 'customerUniqueId', 'firstName', 'lastName']
        }, {
            model: models.customerScrapDisbursement,
            as: 'scrapDisbursement',
            attributes: ['scrapId', 'date', 'scrapAmount']
        }
    ]

    let scrapDetails = await models.customerScrap.findAll({
        where: searchQuery,
        subQuery: false,
        include: associateModel,
        order: [["updatedAt", "DESC"]],
        attributes: ['id', 'customerId', 'scrapUniqueId'],
        offset: offset,
        limit: pageSize
    });
    let count = await models.customerScrap.findAll({
        where: searchQuery,
        subQuery: false,
        include: associateModel,
    });
    if (scrapDetails.length === 0) {
        return res.status(200).json([]);
    } else {
        return res.status(200).json({ message: 'Scrap details fetch successfully', data: scrapDetails, count: count.length });
    }
}

//function for quick pay in scrap melting details 
exports.quickPay = async (req, res, next) => {
    let { scrapId, paymentMode, bankName, bankBranch, transactionId, chequeNumber, depositAmount, depositDate,grossWeight, netWeight, deductionWeight, karat, purityReading, ornamentImageWithWeight, ornamentImageWithXrfMachineReading, ornamentImage, customerConfirmation, finalScrapAmountAfterMelting, eligibleScrapAmount } = req.body;

    let createdBy = req.userData.id;
    let modifiedBy = req.userData.id;

    let checkMeltingOrnaments = await models.scrapMeltingOrnament.findAll({ where: { scrapId: scrapId } });


    if (checkMeltingOrnaments.length == 0) {
        let scrapData = await sequelize.transaction(async t => {

            let createdMeltingOrnaments = await models.scrapMeltingOrnament.create({ scrapId, grossWeight, netWeight, deductionWeight, karat, purityReading, ornamentImageWithWeight, ornamentImageWithXrfMachineReading, ornamentImage, customerConfirmation, createdBy, modifiedBy }, { transaction: t });

            return createdMeltingOrnaments
        })
      
    } else {

        let scrapData = await sequelize.transaction(async t => {
            
            await models.scrapMeltingOrnament.destroy({ where: { scrapId: scrapId }, transaction: t });

            let createdMeltingOrnaments = await models.scrapMeltingOrnament.create({ scrapId, grossWeight, netWeight, deductionWeight, karat, purityReading, ornamentImageWithWeight, ornamentImageWithXrfMachineReading, ornamentImage, customerConfirmation, createdBy, modifiedBy }, { transaction: t });

            return createdMeltingOrnaments;
        })
    }

    let stageId = await models.scrapStage.findOne({ where: { stageName: 'completed' } });

    if (paymentMode == 'cash') {
        let quickPay = await sequelize.transaction(async t => {
            let customerQuickPay = await models.scrapQuickPay.create({ scrapId, paymentMode, depositAmount, depositDate, createdBy, modifiedBy }, { transaction: t });

            await models.customerScrap.update({ scrapStageId: stageId.id,finalScrapAmountAfterMelting, eligibleScrapAmount, customerScrapCurrentStage: "4", modifiedBy }, { where: { id: scrapId }, transaction: t });

            await models.customerScrapHistory.create({ scrapId, action: PROCESS_COMPLETED, modifiedBy }, { transaction: t });

            return customerQuickPay
        });
        return res.status(200).json({ message: "success", quickPay });
    } else if (paymentMode == 'cheque') {
        let quickPay = await sequelize.transaction(async t => {

            let customerQuickPay = await models.scrapQuickPay.create({ scrapId, paymentMode, depositAmount, depositDate, chequeNumber, bankName, bankBranch, createdBy, modifiedBy }, { transaction: t });

            await models.customerScrap.update({ scrapStageId: stageId.id,finalScrapAmountAfterMelting, eligibleScrapAmount, customerScrapCurrentStage: "4", modifiedBy }, { where: { id: scrapId }, transaction: t });

            await models.customerScrapHistory.create({ scrapId, action: PROCESS_COMPLETED, modifiedBy }, { transaction: t });
            return customerQuickPay

        });
        return res.status(200).json({ message: "success", quickPay });
    } else if (paymentMode == 'bankTransfer') {
        let quickPay = await sequelize.transaction(async t => {

            let customerQuickPay = await models.scrapQuickPay.create({ scrapId, paymentMode, depositAmount, depositDate, transactionId, bankName, bankBranch, createdBy, modifiedBy }, { transaction: t });

            await models.customerScrap.update({ scrapStageId: stageId.id,finalScrapAmountAfterMelting, eligibleScrapAmount, customerScrapCurrentStage: "4", modifiedBy }, { where: { id: scrapId }, transaction: t });

            await models.customerScrapHistory.create({ scrapId, action: PROCESS_COMPLETED, modifiedBy }, { transaction: t });

            return customerQuickPay
        });
        return res.status(200).json({ message: "success", quickPay });
    } else {
        return res.status(400).json({ message: 'invalid paymentType' });
    }
}

exports.printCustomerAcknowledgement = async (req, res) => {

    let { scrapId } = req.query;
    let customerScrap = await models.customerScrap.findOne({
        where: { id: scrapId },
        attributes: { exclude: ['createdAt', 'updatedAt', 'createdBy', 'modifiedBy', 'isActive'] },

    });


    var html = fs.readFileSync("./templates/scrap-customer-acknowledgement-templet.html", 'utf8');

    var options = {
        format: "A4",
        orientation: "portrait",
        border: "1mm",
        "header": {
            "height": "2mm",

        },
        "footer": {
            "height": "2mm",
        },
        "height": "11.69in",
        "width": "8.27in"
    }
    let acknowledgementData = await [{
        scrapUniqueId: customerScrap.scrapUniqueId,

    }]
    let emiData = [];

    let fileName = await `customerAcknowledgement${Date.now()}`;
    document = await {
        html: html,
        data: {
            bootstrapCss: `${process.env.URL}/bootstrap.css`,
            jqueryJs: `${process.env.URL}/jquery-slim.min.js`,
            popperJs: `${process.env.URL}/popper.min.js`,
            bootstrapJs: `${process.env.URL}/bootstrap.js`,
            acknowledgementData: acknowledgementData,
        },
        path: `./public/uploads/pdf/${fileName}.pdf`,
        timeout: '60000'
    };
    let createPdf = await pdf.create(document, options);
    if (createPdf) {
        fs.readFile(`./public/uploads/pdf/${fileName}.pdf`, function (err, data) {
            let stat = fs.statSync(`./public/uploads/pdf/${fileName}.pdf`);
            res.setHeader('Content-Length', stat.size);
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=${fileName}.pdf`);
            res.send(data);
            if (fs.existsSync(`./public/uploads/pdf/${fileName}.pdf`)) {
                fs.unlinkSync(`./public/uploads/pdf/${fileName}.pdf`);
            }
        });
    }

}

exports.printPurchaseVoucher = async (req, res) => {
    let { scrapId } = req.query;
    let customerScrap = await models.customerScrap.findOne({
        where: { id: scrapId },
        attributes: { exclude: ['createdAt', 'updatedAt', 'createdBy', 'modifiedBy', 'isActive'] },
    });

    var html = fs.readFileSync("./templates/scrap-purchase-voucher.html", 'utf8');

    var options = {
        format: "A4",
        orientation: "portrait",
        border: "1mm",
        "header": {
            "height": "2mm",

        },
        "footer": {
            "height": "2mm",
        },
        "height": "11.69in",
        "width": "8.27in"
    }
    let purchaseVoucher = await [{
        scrapUniqueId: customerScrap.scrapUniqueId,

    }]
    let emiData = [];

    let fileName = await `purchaseVoucher${Date.now()}`;
    document = await {
        html: html,
        data: {
            bootstrapCss: `${process.env.URL}/bootstrap.css`,
            jqueryJs: `${process.env.URL}/jquery-slim.min.js`,
            popperJs: `${process.env.URL}/popper.min.js`,
            bootstrapJs: `${process.env.URL}/bootstrap.js`,
            purchaseVoucher: purchaseVoucher,
        },
        path: `./public/uploads/pdf/${fileName}.pdf`,
        timeout: '60000'
    };
    let createPdf = await pdf.create(document, options);
    if (createPdf) {
        fs.readFile(`./public/uploads/pdf/${fileName}.pdf`, function (err, data) {
            let stat = fs.statSync(`./public/uploads/pdf/${fileName}.pdf`);
            res.setHeader('Content-Length', stat.size);
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=${fileName}.pdf`);
            res.send(data);
            if (fs.existsSync(`./public/uploads/pdf/${fileName}.pdf`)) {
                fs.unlinkSync(`./public/uploads/pdf/${fileName}.pdf`);
            }
        });
    }

}

exports.getScrapStatus = async (req, res) => {

    let scrapStatus = await models.scrapStage.findAll({
        where: { isActive: true },
        attributes: ['id', 'stageName']
    });

    if (!scrapStatus) {
        return res.status(404).json({ message: "Data not found" });
    } else {
        return res.status(200).json({ scrapStatus });
    }
}
