// LOAD REQUIRED PACKAGES
const models = require('../../models');
const sequelize = models.sequelize;
const Sequelize = models.Sequelize;
const Op = Sequelize.Op;
const paginationFUNC = require('../../utils/pagination'); // IMPORTING PAGINATION FUNCTION

const check = require("../../lib/checkLib"); // IMPORTING CHECKLIB 
const moment = require('moment');
const { getSchemeDetails } = require('../../utils/loanFunction')

var pdf = require("pdf-creator-node"); // PDF CREATOR PACKAGE
var fs = require('fs');
let { sendMessageLoanIdGeneration } = require('../../utils/SMS')
const _ = require('lodash');
var randomize = require('randomatic');

const { LOAN_TRANSFER_APPLY_LOAN, BASIC_DETAILS_SUBMIT, NOMINEE_DETAILS, ORNAMENTES_DETAILS, FINAL_INTEREST_LOAN, BANK_DETAILS, APPRAISER_RATING, BM_RATING, OPERATIONAL_TEAM_RATING, PACKET_IMAGES, LOAN_DOCUMENTS, LOAN_DISBURSEMENT, LOAN_APPLY_FROM_APPRAISER_APP, LOAN_EDIT_FROM_APPRAISER_APP } = require('../../utils/customerLoanHistory');

exports.loanRequest = async (req, res, next) => {

    let { customerId, appraiserRequestId, customerUniqueId, kycStatus, startDate, purpose, masterLoanId, isEdit, loanId, isNewLoanFromPartRelease, partReleaseId } = req.body //basic details
    let { nomineeName, nomineeAge, relationship, nomineeType, guardianName, guardianAge, guardianRelationship } = req.body //nominee
    let { loanOrnaments, totalEligibleAmt, fullAmount } = req.body //ornaments
    let allOrnmanets = []
    let { loanFinalCalculator, interestTable } = req.body //final interest calculator
    let { partnerId, schemeId, finalLoanAmount, loanStartDate, tenure, loanEndDate, paymentFrequency, processingCharge, interestRate, unsecuredInterestRate, unsecuredSchemeId, securedLoanAmount, unsecuredLoanAmount, totalFinalInterestAmt, isUnsecuredSchemeApplied } = loanFinalCalculator // interest table
    let { paymentType, bankName, accountNumber, ifscCode, bankBranchName, accountHolderName, passbookProof } = req.body // bank details
    let { applicationFormForAppraiser, goldValuationForAppraiser, loanStatusForAppraiser, commentByAppraiser } = req.body // appraiser
    let createdBy = req.userData.id;
    let modifiedBy = req.userData.id;
    let appraiserId = req.userData.id;
    let stageId = await models.loanStage.findOne({ where: { name: 'applying' } })
    let ornamentType = [];
    if (!isNewLoanFromPartRelease) {
        isNewLoanFromPartRelease = false
    }

    let customerDetails = await models.customer.findOne({ where: { id: customerId } })

    let sliceCustId = customerDetails.customerUniqueId.slice(0, 2)

    let getAppraiserRequest = await models.appraiserRequest.findOne({ where: { id: appraiserRequestId, appraiserId: appraiserId } });

    if (check.isEmpty(getAppraiserRequest)) {
        return res.status(400).json({ message: `This customer is not assign to you` })
    }

    let getCustomer = await models.customer.findOne({ where: { id: getAppraiserRequest.customerId } })

    if (getCustomer.kycStatus != "approved") {
        return res.status(400).json({ message: 'This customer Kyc is not completed' })
    }


    let loanData = await sequelize.transaction(async t => {
        if (isEdit) {
            let masterLoan = await models.customerLoanMaster.update({ loanStageId: stageId.id, internalBranchId: req.userData.internalBranchId, fullAmount, totalEligibleAmt, createdBy, modifiedBy }, { where: { id: masterLoanId }, transaction: t })

            let loan = await models.customerLoan.update({ loanType: 'secured', createdBy, modifiedBy }, { where: { masterLoanId: masterLoanId }, transaction: t })

            await models.customerLoanPersonalDetail.update({ customerUniqueId, startDate, purpose, kycStatus, createdBy, modifiedBy }, { where: { masterLoanId: masterLoanId }, transaction: t });

            // nominee
            await models.customerLoanNomineeDetail.update({ nomineeName, nomineeAge, relationship, nomineeType, guardianName, guardianAge, guardianRelationship, createdBy, modifiedBy }, { where: { masterLoanId: masterLoanId }, transaction: t })

            // await models.customerLoanOrnamentsDetail.destroy({ where: { masterLoanId: masterLoanId }, transaction: t });
            // let createdOrnaments = await models.customerLoanOrnamentsDetail.bulkCreate(allOrnmanets, { transaction: t });
            let checkOrnaments = await models.customerLoanOrnamentsDetail.findAll({ where: { masterLoanId: masterLoanId } })

            let newOrnaments = loanOrnaments.map((single) => { return single.id })
            let oldOrnaments = checkOrnaments.map((single) => { return single.id })
            let deleteOrnaments = await _.difference(oldOrnaments, newOrnaments);

            await models.customerLoanOrnamentsDetail.destroy({ where: { id: { [Op.in]: deleteOrnaments } }, transaction: t });

            for (let i = 0; i < loanOrnaments.length; i++) {
                loanOrnaments[i]['createdBy'] = createdBy
                loanOrnaments[i]['modifiedBy'] = modifiedBy
                loanOrnaments[i]['loanId'] = loanId
                loanOrnaments[i]['masterLoanId'] = masterLoanId
                allOrnmanets.push(loanOrnaments[i])
            }

            let createdOrnaments = await models.customerLoanOrnamentsDetail.bulkCreate(loanOrnaments, { updateOnDuplicate: ["ornamentTypeId", "quantity", "grossWeight", "netWeight", "deductionWeight", "weightMachineZeroWeight", "withOrnamentWeight", "stoneTouch", "acidTest", "purityTest", "karat", "ltvRange", "currentGoldRate","ornamentImage", "ltvPercent", "ltvAmount", "currentLtvAmount", "ornamentFullAmount","loanAmount"] }, { transaction: t })

            // for (let singleOrna of loanOrnaments) {
            //     delete singleOrna.id;
            //     singleOrna['createdBy'] = createdBy
            //     singleOrna['modifiedBy'] = modifiedBy
            //     singleOrna['loanId'] = loanId
            //     singleOrna['masterLoanId'] = masterLoanId
            //     var ornaments = await models.customerLoanOrnamentsDetail.create(singleOrna, { transaction: t });
            //     createdOrnaments.push(ornaments)
            // }
        } else {
            let masterLoan = await models.customerLoanMaster.create({ appraiserRequestId, customerId: customerId, loanStageId: stageId.id, internalBranchId: req.userData.internalBranchId, fullAmount, totalEligibleAmt, createdBy, modifiedBy, isNewLoanFromPartRelease }, { transaction: t })

            let loan = await models.customerLoan.create({ customerId, masterLoanId: masterLoan.id, loanType: 'secured', createdBy, modifiedBy }, { transaction: t })
            if (isNewLoanFromPartRelease) {
                await models.partRelease.update({ isLoanCreated: true, newLoanId: masterLoan.id }, { where: { id: partReleaseId }, transaction: t });
            }
            loanId = loan.id
            masterLoanId = masterLoan.id


            await models.customerLoanPersonalDetail.create({ loanId, masterLoanId, customerUniqueId, startDate, purpose, kycStatus, createdBy, modifiedBy }, { transaction: t });

            // nominee
            await models.customerLoanNomineeDetail.create({ loanId, masterLoanId, nomineeName, nomineeAge, relationship, nomineeType, guardianName, guardianAge, guardianRelationship, createdBy, modifiedBy }, { transaction: t })

            // ornaments 
            for (let i = 0; i < loanOrnaments.length; i++) {
                loanOrnaments[i]['createdBy'] = createdBy
                loanOrnaments[i]['modifiedBy'] = modifiedBy
                loanOrnaments[i]['loanId'] = loanId
                loanOrnaments[i]['masterLoanId'] = masterLoanId
                allOrnmanets.push(loanOrnaments[i])
            }
            console.log(loanOrnaments[0].ornamentTypeId)

            let checkOrnaments = await models.customerLoanOrnamentsDetail.findAll({ where: { masterLoanId: masterLoanId } })
            if (checkOrnaments.length == 0) {
                await models.customerLoanMaster.update({ customerLoanCurrentStage: '4', modifiedBy, fullAmount, totalEligibleAmt }, { where: { id: masterLoanId }, transaction: t })

                await models.customerLoanOrnamentsDetail.bulkCreate(allOrnmanets, { transaction: t });
            }

        }

        // create new loan id and masterLoanId
        let interestData = [];
        for (let i = 0; i < interestTable.length; i++) {
            interestTable[i]['createdBy'] = createdBy
            interestTable[i]['modifiedBy'] = modifiedBy
            interestTable[i]['loanId'] = loanId
            interestTable[i]['interestAmount'] = interestTable[i].securedInterestAmount
            interestTable[i]['outstandingInterest'] = interestTable[i].securedInterestAmount
            interestTable[i]['masterLoanId'] = masterLoanId
            interestTable[i]['interestRate'] = interestRate
            interestData.push(interestTable[i])
        }

        //get slab rate
        let securedSlab = await getSchemeSlab(schemeId, loanId)

        let securedPenal = await getSchemeDetails(schemeId)

        if (isUnsecuredSchemeApplied) {
            var unsecuredPenal = await getSchemeDetails(schemeId)
        }

        if (!isEdit) {
            await models.customerLoanInterest.bulkCreate(interestData, { transaction: t });
            await models.customerLoanInitialInterest.bulkCreate(interestData, { transaction: t });

            await models.customerLoanSlabRate.bulkCreate(securedSlab, { transaction: t })

            if (isUnsecuredSchemeApplied == true) {
                await models.customerLoanMaster.update({ customerLoanCurrentStage: '5', totalFinalInterestAmt, finalLoanAmount, outstandingAmount: finalLoanAmount, securedLoanAmount, unsecuredLoanAmount, tenure, loanStartDate, loanEndDate, paymentFrequency, processingCharge, isUnsecuredSchemeApplied }, { where: { id: masterLoanId }, transaction: t })

                var unsecuredLoan = await models.customerLoan.create({ customerId: customerId, masterLoanId, partnerId, loanAmount: unsecuredLoanAmount, outstandingAmount: unsecuredLoanAmount, schemeId: unsecuredSchemeId, interestRate: unsecuredInterestRate, currentSlab: paymentFrequency, selectedSlab: paymentFrequency, currentInterestRate: unsecuredInterestRate, penalInterest: unsecuredPenal.penalInterest, loanType: "unsecured", createdBy, modifiedBy }, { transaction: t })

                let newUnsecuredInterestData = []
                for (let i = 0; i < interestTable.length; i++) {
                    interestTable[i]['createdBy'] = createdBy
                    interestTable[i]['modifiedBy'] = modifiedBy
                    interestTable[i]['loanId'] = unsecuredLoan.id
                    interestTable[i]['interestAmount'] = interestTable[i].unsecuredInterestAmount
                    interestTable[i]['outstandingInterest'] = interestTable[i].unsecuredInterestAmount
                    interestTable[i]['masterLoanId'] = masterLoanId
                    interestTable[i]['interestRate'] = unsecuredInterestRate
                    newUnsecuredInterestData.push(interestTable[i])
                }
                let unsecuredSlab = await getSchemeSlab(unsecuredSchemeId, unsecuredLoan.id)
                await models.customerLoanSlabRate.bulkCreate(unsecuredSlab, { transaction: t })

                await models.customerLoanInterest.bulkCreate(newUnsecuredInterestData, { transaction: t });
                await models.customerLoanInitialInterest.bulkCreate(newUnsecuredInterestData, { transaction: t });

                await models.customerLoan.update({ partnerId, schemeId, loanAmount: securedLoanAmount, outstandingAmount: securedLoanAmount, interestRate, currentSlab: paymentFrequency, selectedSlab: paymentFrequency, currentInterestRate: interestRate, penalInterest: securedPenal.penalInterest, unsecuredLoanId: unsecuredLoan.id, modifiedBy }, { where: { id: loanId }, transaction: t })

            } else {
                await models.customerLoanMaster.update({ customerLoanCurrentStage: '5', totalFinalInterestAmt, finalLoanAmount, outstandingAmount: finalLoanAmount, securedLoanAmount, unsecuredLoanAmount, tenure, loanStartDate, loanEndDate, paymentFrequency, processingCharge, isUnsecuredSchemeApplied }, { where: { id: masterLoanId }, transaction: t })

                await models.customerLoan.update({ partnerId, schemeId, loanAmount: securedLoanAmount, outstandingAmount: securedLoanAmount, interestRate, currentSlab: paymentFrequency, selectedSlab: paymentFrequency, currentInterestRate: interestRate, penalInterest: securedPenal.penalInterest, createdBy, modifiedBy }, { where: { id: loanId }, transaction: t })
            }
        } else {

            let getUnsecuredLoanId = await models.customerLoan.findOne({ where: { id: loanId } });

            await models.customerLoanInterest.destroy({ where: { loanId: loanId }, transaction: t });
            await models.customerLoanInitialInterest.destroy({ where: { loanId: loanId }, transaction: t });
            await models.customerLoanSlabRate.destroy({ where: { loanId: loanId }, transaction: t })

            await models.customerLoanInterest.bulkCreate(interestData, { transaction: t });
            await models.customerLoanInitialInterest.bulkCreate(interestData, { transaction: t });
            await models.customerLoanSlabRate.bulkCreate(securedSlab, { transaction: t })

            let unsecuredInterestData = [];
            let unsecuredSlab;

            if (isUnsecuredSchemeApplied == true) {
                for (let i = 0; i < interestTable.length; i++) {
                    interestTable[i]['createdBy'] = createdBy
                    interestTable[i]['modifiedBy'] = modifiedBy
                    interestTable[i]['loanId'] = getUnsecuredLoanId.unsecuredLoanId
                    interestTable[i]['interestAmount'] = interestTable[i].unsecuredInterestAmount
                    interestTable[i]['outstandingInterest'] = interestTable[i].unsecuredInterestAmount
                    interestTable[i]['masterLoanId'] = masterLoanId
                    interestTable[i]['interestRate'] = unsecuredInterestRate
                    unsecuredInterestData.push(interestTable[i])
                }
                unsecuredSlab = await getSchemeSlab(unsecuredSchemeId, getUnsecuredLoanId.unsecuredLoanId)
            }

            if (isUnsecuredSchemeApplied == true) {
                if (getUnsecuredLoanId.unsecuredLoanId == null) {

                    await models.customerLoanMaster.update({ customerLoanCurrentStage: '5', totalFinalInterestAmt, finalLoanAmount, outstandingAmount: finalLoanAmount, securedLoanAmount, unsecuredLoanAmount, tenure, loanStartDate, loanEndDate, paymentFrequency, processingCharge, isUnsecuredSchemeApplied }, { where: { id: masterLoanId }, transaction: t })

                    var unsecuredLoan = await models.customerLoan.create({ customerId: customerId, masterLoanId, partnerId, schemeId: unsecuredSchemeId, loanAmount: unsecuredLoanAmount, outstandingAmount: unsecuredLoanAmount, interestRate: unsecuredInterestRate, penalInterest: unsecuredPenal.penalInterest, currentSlab: paymentFrequency, selectedSlab: paymentFrequency, currentInterestRate: unsecuredInterestRate, loanType: "unsecured", createdBy, modifiedBy }, { transaction: t })

                    await models.customerLoan.update({ partnerId, schemeId, loanAmount: securedLoanAmount, outstandingAmount: securedLoanAmount, interestRate, currentSlab: paymentFrequency, selectedSlab: paymentFrequency, currentInterestRate: interestRate, penalInterest: securedPenal.penalInterest, loanType: "secured", unsecuredLoanId: unsecuredLoan.id, createdBy, modifiedBy }, { where: { id: loanId }, transaction: t })

                    let newUnsecuredInterestData = []
                    for (let i = 0; i < interestTable.length; i++) {
                        interestTable[i]['createdBy'] = createdBy
                        interestTable[i]['modifiedBy'] = modifiedBy
                        interestTable[i]['loanId'] = unsecuredLoan.id
                        interestTable[i]['interestAmount'] = interestTable[i].unsecuredInterestAmount
                        interestTable[i]['outstandingInterest'] = interestTable[i].unsecuredInterestAmount
                        interestTable[i]['masterLoanId'] = masterLoanId
                        interestTable[i]['interestRate'] = unsecuredInterestRate
                        newUnsecuredInterestData.push(interestTable[i])
                    }

                    let newUnsecuredSlab = await getSchemeSlab(unsecuredSchemeId, unsecuredLoan.id)

                    await models.customerLoanInterest.bulkCreate(newUnsecuredInterestData, { transaction: t });
                    await models.customerLoanInitialInterest.bulkCreate(newUnsecuredInterestData, { transaction: t });
                    await models.customerLoanSlabRate.bulkCreate(newUnsecuredSlab, { transaction: t })

                } else {

                    await models.customerLoanMaster.update({ customerLoanCurrentStage: '5', totalFinalInterestAmt, finalLoanAmount, outstandingAmount: finalLoanAmount, securedLoanAmount, unsecuredLoanAmount, tenure, loanStartDate, loanEndDate, paymentFrequency, processingCharge, isUnsecuredSchemeApplied }, { where: { id: masterLoanId }, transaction: t })

                    await models.customerLoan.update({ partnerId, schemeId, loanAmount: securedLoanAmount, outstandingAmount: securedLoanAmount, interestRate, currentSlab: paymentFrequency, selectedSlab: paymentFrequency, currentInterestRate: interestRate, penalInterest: securedPenal.penalInterest, modifiedBy }, { where: { id: loanId }, transaction: t })

                    await models.customerLoan.update({ partnerId, schemeId: unsecuredSchemeId, loanAmount: unsecuredLoanAmount, outstandingAmount: unsecuredLoanAmount, interestRate: unsecuredInterestRate, penalInterest: unsecuredPenal.penalInterest, currentSlab: paymentFrequency, selectedSlab: paymentFrequency, currentInterestRate: unsecuredInterestRate, modifiedBy, isActive: true }, { where: { id: getUnsecuredLoanId.unsecuredLoanId }, transaction: t })

                    await models.customerLoanInterest.destroy({ where: { loanId: getUnsecuredLoanId.unsecuredLoanId }, transaction: t })
                    await models.customerLoanInitialInterest.destroy({ where: { loanId: getUnsecuredLoanId.unsecuredLoanId }, transaction: t });
                    await models.customerLoanSlabRate.destroy({ where: { loanId: getUnsecuredLoanId.unsecuredLoanId }, transaction: t })

                    await models.customerLoanInterest.bulkCreate(unsecuredInterestData, { transaction: t });
                    await models.customerLoanInitialInterest.bulkCreate(unsecuredInterestData, { transaction: t });
                    await models.customerLoanSlabRate.bulkCreate(unsecuredSlab, { transaction: t })
                }
            } else {
                await models.customerLoanMaster.update({ customerLoanCurrentStage: '5', totalFinalInterestAmt, finalLoanAmount, outstandingAmount: finalLoanAmount, securedLoanAmount, unsecuredLoanAmount, tenure, loanStartDate, loanEndDate, paymentFrequency, processingCharge, isUnsecuredSchemeApplied }, { where: { id: masterLoanId }, transaction: t })

                await models.customerLoanInterest.destroy({ where: { loanId: getUnsecuredLoanId.unsecuredLoanId }, transaction: t })
                await models.customerLoanInitialInterest.destroy({ where: { loanId: getUnsecuredLoanId.unsecuredLoanId }, transaction: t });
                await models.customerLoanSlabRate.destroy({ where: { loanId: getUnsecuredLoanId.unsecuredLoanId }, transaction: t })
                await models.customerLoanHistory.destroy({ where: { loanId: getUnsecuredLoanId.unsecuredLoanId }, transaction: t })
                await models.customerLoan.update({ partnerId, schemeId, unsecuredLoanId: null, loanAmount: securedLoanAmount, outstandingAmount: securedLoanAmount, interestRate, penalInterest: securedPenal.penalInterest, currentSlab: paymentFrequency, selectedSlab: paymentFrequency, currentInterestRate: interestRate, modifiedBy }, { where: { id: loanId }, transaction: t })

                await models.customerLoan.destroy({ where: { id: getUnsecuredLoanId.unsecuredLoanId }, transaction: t })
            }
        }
        // bank details
        if (!isEdit) {
            await models.customerLoanMaster.update({ customerLoanCurrentStage: '6', modifiedBy }, { where: { id: masterLoanId }, transaction: t })

            await models.customerLoanBankDetail.create({ loanId, masterLoanId, paymentType, bankName, accountNumber, ifscCode, bankBranchName, accountHolderName, passbookProof, createdBy, modifiedBy }, { transaction: t });

            // history
            await models.customerLoanHistory.create({ loanId, masterLoanId, action: LOAN_APPLY_FROM_APPRAISER_APP, modifiedBy }, { transaction: t });
        } else {
            await models.customerLoanMaster.update({ customerLoanCurrentStage: '6', modifiedBy }, { where: { id: masterLoanId }, transaction: t })

            await models.customerLoanBankDetail.update({ paymentType, bankName, accountNumber, ifscCode, bankBranchName, accountHolderName, passbookProof, createdBy, modifiedBy }, { where: { loanId: loanId }, transaction: t });

            // history
            await models.customerLoanHistory.create({ loanId, masterLoanId, action: LOAN_EDIT_FROM_APPRAISER_APP, modifiedBy }, { transaction: t });
        }
        // appraiser rating
        if (loanStatusForAppraiser == "approved") {
            if (goldValuationForAppraiser == false || applicationFormForAppraiser == false) {
                return res.status(400).json({ message: 'One field is not verified' })
            }

            let stageId = await models.loanStage.findOne({ where: { name: 'assign packet' }, transaction: t })
            await models.customerLoanMaster.update({
                applicationFormForAppraiser, goldValuationForAppraiser, loanStatusForAppraiser, commentByAppraiser, modifiedBy, appraiserId, loanStageId: stageId.id
            }, { where: { id: masterLoanId }, transaction: t })

            await models.customerLoanHistory.create({ loanId, masterLoanId, action: APPRAISER_RATING, modifiedBy }, { transaction: t });

            let loanDetail = await models.customerLoan.findOne({ 
                include : [{
                    model: models.customerLoan,
                    as: 'unsecuredLoan'
                }],
                where: { id: loanId }, transaction: t 
            })

            //loan Id generation
            if (loanDetail.loanUniqueId == null) {
                var loanUniqueId = null;

                //secured loan Id
                let loanSendId;
                let checkSecuredUnique = false
                do {
                    let getSecu = randomize('A0', 4);
                    loanUniqueId = `LR${sliceCustId}${getSecu}`;
                    loanSendId = loanUniqueId
                    let checkUnique = await models.customerLoan.findOne({ where: { loanUniqueId: loanUniqueId }, transaction: t })
                    if (!checkUnique) {
                        checkSecuredUnique = true
                    }
                }
                while (!checkSecuredUnique);
                //secured loan Id
                // loanUniqueId = `LOAN${Math.floor(1000 + Math.random() * 9000)}`;
                // let loanSendId = loanUniqueId

                await models.customerLoan.update({ loanUniqueId: loanUniqueId }, { where: { id: loanId }, transaction: t })
                if (loanDetail.unsecuredLoanId != null) {
                    if (loanDetail.unsecuredLoan.loanUniqueId == null) {
                        // var unsecuredLoanUniqueId = null;
                        // unsecured loan Id
                        let checkUnsecuredUnique = false
                        var unsecuredLoanUniqueId = null;
                        do {
                            let getUnsecu = randomize('A0', 4);
                            unsecuredLoanUniqueId = `LR${sliceCustId}${getUnsecu}`;
                            loanSendId = loanUniqueId
                            loanSendId = `${loanUniqueId}, ${unsecuredLoanUniqueId}`
                            let checkUniqueUnsecured = await models.customerLoan.findOne({ where: { loanUniqueId: unsecuredLoanUniqueId }, transaction: t })
                            if (!checkUniqueUnsecured) {
                                checkUnsecuredUnique = true
                            }
                        }
                        while (!checkUnsecuredUnique);

                        // unsecuredLoanUniqueId = `LOAN${Math.floor(1000 + Math.random() * 9000)}`;
                        await models.customerLoan.update({ loanUniqueId: unsecuredLoanUniqueId }, { where: { id: loanDetail.unsecuredLoanId }, transaction: t });
                        // loanSendId = `secured Loan ID ${loanUniqueId}, unsecured Loan ID ${unsecuredLoanUniqueId}`
                    }
                }
                await sendMessageLoanIdGeneration(customerDetails.mobileNumber, customerDetails.firstName, loanSendId)
            }else{
                    if (loanDetail.unsecuredLoanId != null) {
                        if (loanDetail.unsecuredLoan.loanUniqueId == null) {
                            // unsecured loan Id
                            let checkUnsecuredUnique = false
                            var unsecuredLoanUniqueId = null;
                            do {
                                let getUnsecu = randomize('A0', 4);
                                unsecuredLoanUniqueId = `LR${sliceCustId}${getUnsecu}`;
                                loanSendId = loanDetail.loanUniqueId
                                loanSendId = `${loanDetail.loanUniqueId}, ${unsecuredLoanUniqueId}`
                                let checkUniqueUnsecured = await models.customerLoan.findOne({ where: { loanUniqueId: unsecuredLoanUniqueId }, transaction: t })
                                if (!checkUniqueUnsecured) {
                                    checkUnsecuredUnique = true
                                }
                            }
                            while (!checkUnsecuredUnique);
    
                            await models.customerLoan.update({ loanUniqueId: unsecuredLoanUniqueId }, { where: { id: loanDetail.unsecuredLoanId }, transaction: t });
                        }
                    }
            }

        } else {
            let stageId = await models.loanStage.findOne({ where: { name: 'appraiser rating' }, transaction: t })

            await models.customerLoanHistory.create({ loanId, masterLoanId, action: APPRAISER_RATING, modifiedBy }, { transaction: t });

            await models.customerLoanMaster.update({
                applicationFormForAppraiser, goldValuationForAppraiser, loanStatusForAppraiser, commentByAppraiser, modifiedBy, appraiserId, loanStageId: stageId.id
            }, { where: { id: masterLoanId }, transaction: t })
        }
    })
    return res.status(200).json({ message: "Success", loanId: loanId, masterLoanId: masterLoanId })
}


async function getSchemeSlab(schemeId, loanId) {
    let securedScheme = await models.scheme.findOne({
        where: { id: schemeId },
        order: [
            [models.schemeInterest, 'days', 'asc']
        ],
        include: [{
            model: models.schemeInterest,
            as: 'schemeInterest',
            attributes: ['days', 'interestRate']
        }]
    })

    let slab = securedScheme.schemeInterest
    let newSlab = []
    for (let i = 0; i < slab.length; i++) {
        data = {}
        data.loanId = loanId
        data.days = slab[i].days
        data.interestRate = slab[i].interestRate
        newSlab.push(data)
    }

    console.log(newSlab)
    return newSlab
}

//FUNCTION FOR PRINT DETAILS
exports.getLoanDetailsForPrint = async (req, res, next) => {
    let { customerLoanId } = req.query
    let includeArray = [
        {
            model: models.customerLoan,
            as: 'customerLoan',
            attributes: ['id', 'loanUniqueId', 'loanAmount', 'interestRate', 'loanType', 'unsecuredLoanId', 'partnerId', 'schemeId'],
            include: [
                {
                    model: models.scheme,
                    as: 'scheme',
                    attributes: ['penalInterest', 'schemeName']
                }, {
                    model: models.partner,
                    as: 'partner',
                    attributes: ['name']
                },
            ]
        },
        {
            model: models.customerLoanBankDetail,
            as: 'loanBankDetail',
            attributes: ['accountHolderName', 'accountNumber', 'ifscCode', 'passbookProof']
        },
        {
            model: models.customerLoanNomineeDetail,
            as: 'loanNomineeDetail',
            attributes: ['nomineeName', 'nomineeAge', 'relationship']
        },
        {
            model: models.customer,
            as: 'customer',
            attributes: ['id', 'customerUniqueId', 'firstName', 'lastName', 'mobileNumber'],
            include: [
                {
                    model: models.customerKycPersonalDetail,
                    as: 'customerKycPersonal',
                    attributes: ['dateOfBirth', 'identityProofNumber']
                },
                {
                    model: models.customerKycAddressDetail,
                    as: 'customerKycAddress',
                    attributes: ['address', 'pinCode'],
                    include: [
                        {
                            model: models.state,
                            as: 'state',
                            attributes: ['name']
                        }, {
                            model: models.city,
                            as: 'city',
                            attributes: ['name']
                        }]
                }
            ]
        },
        {
            model: models.customerLoanOrnamentsDetail,
            as: 'loanOrnamentsDetail',
            attributes: ['quantity', 'grossWeight', 'netWeight', 'deductionWeight', 'purityTest'],
            include: [
                {
                    model: models.ornamentType,
                    as: "ornamentType",
                    attributes: ['name']
                }
            ]
        },
        {
            model: models.internalBranch,
            as: 'internalBranch',
            attributes: ['name']
        }

    ]

    let customerLoanDetail = await models.customerLoanMaster.findOne({
        where: { id: customerLoanId },
        order: [
            [models.customerLoan, 'id', 'asc'],
        ],
        attributes: ['id', 'tenure', 'loanStartDate', 'loanEndDate', 'isUnsecuredSchemeApplied', 'processingCharge'],
        include: includeArray
    });

    let ornaments = [];
    if (customerLoanDetail.loanOrnamentsDetail.length != 0) {
        for (let ornamentsDetail of customerLoanDetail.loanOrnamentsDetail) {
            ornaments.push({
                ornamentType: ornamentsDetail.ornamentType.name,
                quantity: ornamentsDetail.quantity,
                grossWeight: ornamentsDetail.grossWeight,
                netWeight: ornamentsDetail.netWeight,
                deduction: ornamentsDetail.deductionWeight
            })
        }
    }

    let customerAddress = []
    if (customerLoanDetail.customer.length != 0) {
        for (let address of customerLoanDetail.customer.customerKycAddress) {
            customerAddress.push({
                address: address.address,
                pinCode: address.pinCode,
                state: address.state.name,
                city: address.city.name
            })
        }
        customerLoanDetail.customerAddress = customerAddress
    }
    var d = new Date(customerLoanDetail.customer.customerKycPersonal.dateOfBirth)
    dateOfBirth = d.getDate() + "-" + (d.getMonth() + 1) + "-" + d.getFullYear();
    //console.log(customerLoanDetail.customerLoan[1])
    let customerUnsecureLoanData = [];
    if (customerLoanDetail.isUnsecuredSchemeApplied) {
        customerUnsecureLoanData = await [{
            Name: customerLoanDetail.customer.firstName + " " + customerLoanDetail.customer.lastName,
            dob: dateOfBirth,
            contactNumber: customerLoanDetail.customer.mobileNumber,
            startDate: customerLoanDetail.loanStartDate,
            customerAddress: `${customerLoanDetail.customerAddress[0].address},${customerLoanDetail.customerAddress[0].pinCode},${customerLoanDetail.customerAddress[0].state},${customerLoanDetail.customerAddress[0].city}`,
            customerId: customerLoanDetail.customer.customerUniqueId,
            loanTenure: customerLoanDetail.tenure,
            endDate: customerLoanDetail.loanEndDate,
            loanNumber: customerLoanDetail.customerLoan[1].loanUniqueId,
            loanAmount: customerLoanDetail.customerLoan[1].loanAmount,
            loanScheme: customerLoanDetail.customerLoan[1].scheme.schemeName,
            penalCharges: customerLoanDetail.customerLoan[1].scheme.penalInterest,
            interestRate: customerLoanDetail.customerLoan[1].interestRate,
            processingFee: customerLoanDetail.processingCharge,
            branch: customerLoanDetail.internalBranch.name,
            aadhaarNumber: customerLoanDetail.customer.customerKycPersonal.identityProofNumber
        }]
    }
    //console.log(customerUnsecureLoanData,'unsecure')
    var customerSecureLoanData = await [{
        partnerName: customerLoanDetail.customerLoan[0].partner.name,
        Name: customerLoanDetail.customer.firstName + " " + customerLoanDetail.customer.lastName,
        dob: dateOfBirth,
        contactNumber: customerLoanDetail.customer.mobileNumber,
        nomineeDetails: `${customerLoanDetail.loanNomineeDetail[0].nomineeName}, ${customerLoanDetail.loanNomineeDetail[0].nomineeAge}, ${customerLoanDetail.loanNomineeDetail[0].relationship}`,
        startDate: customerLoanDetail.loanStartDate,
        customerAddress: `${customerLoanDetail.customerAddress[0].address},${customerLoanDetail.customerAddress[0].pinCode},${customerLoanDetail.customerAddress[0].state},${customerLoanDetail.customerAddress[0].city}`,
        interestRate: customerLoanDetail.customerLoan[0].interestRate,
        customerId: customerLoanDetail.customer.customerUniqueId,
        loanNumber: customerLoanDetail.customerLoan[0].loanUniqueId,
        loanAmount: customerLoanDetail.customerLoan[0].loanAmount,
        loanTenure: customerLoanDetail.tenure,
        end_Date: customerLoanDetail.loanEndDate,
        loanScheme: customerLoanDetail.customerLoan[0].scheme.schemeName,
        penalCharges: customerLoanDetail.customerLoan[0].scheme.penalInterest,
        processingFee: customerLoanDetail.processingCharge,
        branch: customerLoanDetail.internalBranch.name,
        aadhaarNumber: customerLoanDetail.customer.customerKycPersonal.identityProofNumber,
        ornaments
    }];
    //console.log(customerSecureLoanData,'secure)
    return res.status(200).json({ customerSecureLoanData, customerUnsecureLoanData })
}
