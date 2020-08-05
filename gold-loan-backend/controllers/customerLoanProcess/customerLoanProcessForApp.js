// LOAD REQUIRED PACKAGES
const models = require('../../models');
const sequelize = models.sequelize;
const Sequelize = models.Sequelize;
const Op = Sequelize.Op;
const paginationFUNC = require('../../utils/pagination'); // IMPORTING PAGINATION FUNCTION

const check = require("../../lib/checkLib"); // IMPORTING CHECKLIB 
const moment = require('moment');

var pdf = require("pdf-creator-node"); // PDF CREATOR PACKAGE
var fs = require('fs');
let { sendMessageLoanIdGeneration } = require('../../utils/SMS')

const { LOAN_TRANSFER_APPLY_LOAN, BASIC_DETAILS_SUBMIT, NOMINEE_DETAILS, ORNAMENTES_DETAILS, FINAL_INTEREST_LOAN, BANK_DETAILS, APPRAISER_RATING, BM_RATING, OPERATIONAL_TEAM_RATING, PACKET_IMAGES, LOAN_DOCUMENTS, LOAN_DISBURSEMENT } = require('../../utils/customerLoanHistory');

exports.loanRequest = async (req, res, next) => {

    let { customerId, customerUniqueId, kycStatus, startDate, purpose } = req.body //basic details
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

    let loanData = await sequelize.transaction(async t => {
        // create new loan id and masterLoanId
        let masterLoan = await models.customerLoanMaster.create({ customerId: customerId, loanStageId: stageId.id, internalBranchId: req.userData.internalBranchId, fullAmount, totalEligibleAmt, createdBy, modifiedBy }, { transaction: t })

        let loan = await models.customerLoan.create({ customerId, masterLoanId: masterLoan.id, loanType: 'secured', createdBy, modifiedBy }, { transaction: t })

        var loanId = loan.id
        var masterLoanId = masterLoan.id


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

        let checkOrnaments = await models.customerLoanOrnamentsDetail.findAll({ where: { masterLoanId: masterLoanId } })
        if (checkOrnaments.length == 0) {
            let createdOrnaments = await models.customerLoanOrnamentsDetail.bulkCreate(allOrnmanets, { transaction: t });
        }

        // interest table
        let interestData = [];
        for (let i = 0; i < interestTable.length; i++) {
            interestTable[i]['createdBy'] = createdBy
            interestTable[i]['modifiedBy'] = modifiedBy
            interestTable[i]['loanId'] = loanId
            interestTable[i]['interestAmount'] = interestTable[i].securedInterestAmount
            interestTable[i]['outstandingInterest'] = interestTable[i].securedInterestAmount
            interestTable[i]['masterLoanId'] = masterLoanId
            interestData.push(interestTable[i])
        }

        //get slab rate
        let securedSlab = await getSchemeSlab(schemeId, loanId)

        await models.customerLoanInterest.bulkCreate(interestData, { transaction: t });

        await models.customerLoanInitialInterest.bulkCreate(interestData, { transaction: t });

        await models.customerLoanSlabRate.bulkCreate(securedSlab, { transaction: t })

        if (isUnsecuredSchemeApplied == true) {
            await models.customerLoanMaster.update({ totalFinalInterestAmt, finalLoanAmount, outstandingAmount: finalLoanAmount, securedLoanAmount, unsecuredLoanAmount, tenure, loanStartDate, loanEndDate, paymentFrequency, processingCharge, isUnsecuredSchemeApplied }, { where: { id: masterLoanId }, transaction: t })

            var unsecuredLoan = await models.customerLoan.create({ customerId: checkFinalLoan.customerId, masterLoanId, partnerId, loanAmount: unsecuredLoanAmount, outstandingAmount: unsecuredLoanAmount, schemeId: unsecuredSchemeId, interestRate: unsecuredInterestRate, loanType: "unsecured", createdBy, modifiedBy }, { transaction: t })
            let newUnsecuredInterestData = []
            for (let i = 0; i < interestTable.length; i++) {
                interestTable[i]['createdBy'] = createdBy
                interestTable[i]['modifiedBy'] = modifiedBy
                interestTable[i]['loanId'] = unsecuredLoan.id
                interestTable[i]['interestAmount'] = interestTable[i].unsecuredInterestAmount
                interestTable[i]['outstandingInterest'] = interestTable[i].unsecuredInterestAmount
                interestTable[i]['masterLoanId'] = masterLoanId
                newUnsecuredInterestData.push(interestTable[i])
            }
            let unsecuredSlab = await getSchemeSlab(unsecuredSchemeId, unsecuredLoan.id)
            await models.customerLoanSlabRate.bulkCreate(unsecuredSlab, { transaction: t })

            await models.customerLoanInterest.bulkCreate(newUnsecuredInterestData, { transaction: t });
            await models.customerLoanInitialInterest.bulkCreate(newUnsecuredInterestData, { transaction: t });

            await models.customerLoan.update({ partnerId, schemeId, loanAmount: securedLoanAmount, outstandingAmount: securedLoanAmount, interestRate, unsecuredLoanId: unsecuredLoan.id, modifiedBy }, { where: { id: loanId }, transaction: t })

            await models.customerLoanHistory.create({ loanId, masterLoanId, action: FINAL_INTEREST_LOAN, modifiedBy }, { transaction: t });

        } else {
            await models.customerLoanMaster.update({ totalFinalInterestAmt, finalLoanAmount, outstandingAmount: finalLoanAmount, securedLoanAmount, unsecuredLoanAmount, tenure, loanStartDate, loanEndDate, paymentFrequency, processingCharge, isUnsecuredSchemeApplied }, { where: { id: masterLoanId }, transaction: t })

            await models.customerLoan.update({ partnerId, schemeId, loanAmount: securedLoanAmount, outstandingAmount: securedLoanAmount, interestRate, createdBy, modifiedBy }, { where: { id: loanId }, transaction: t })

            await models.customerLoanHistory.create({ loanId, masterLoanId, action: FINAL_INTEREST_LOAN, modifiedBy }, { transaction: t });

        }

        // bank details
        let bank = await models.customerLoanBankDetail.create({ loanId, masterLoanId, paymentType, bankName, accountNumber, ifscCode, bankBranchName, accountHolderName, passbookProof, createdBy, modifiedBy }, { transaction: t });



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

            let loanDetail = await models.customerLoan.findOne({ where: { id: loanId }, transaction: t })

            //loan Id generation
            if (loanDetail.loanUniqueId == null) {
                var loanUniqueId = null;
                //secured loan Id
                loanUniqueId = `LOAN${Math.floor(1000 + Math.random() * 9000)}`;

                await models.customerLoan.update({ loanUniqueId: loanUniqueId }, { where: { id: loanId }, transaction: t })
            }
            if (loanDetail.unsecuredLoanId != null) {
                if (loanDetail.unsecuredLoanId.loanUniqueId == null) {
                    var unsecuredLoanUniqueId = null;
                    // unsecured loan Id
                    unsecuredLoanUniqueId = `LOAN${Math.floor(1000 + Math.random() * 9000)}`;
                    await models.customerLoan.update({ loanUniqueId: unsecuredLoanUniqueId }, { where: { id: loanDetail.unsecuredLoanId }, transaction: t });
                }
            }

        } else {
            let stageId = await models.loanStage.findOne({ where: { name: 'appraiser rating' }, transaction: t })

            await models.customerLoanHistory.create({ loanId, masterLoanId, action: APPRAISER_RATING, modifiedBy }, { transaction: t });

            await models.customerLoanMaster.update({
                applicationFormForAppraiser, goldValuationForAppraiser, loanStatusForAppraiser, commentByAppraiser, modifiedBy, appraiserId, loanStageId: stageId.id
            }, { where: { id: masterLoanId }, transaction: t })
        }

        return { loanId, masterLoanId }
    })
    return res.status(200).json({ message: "Success", loanId: loanData.loanId, masterLoanId: loanData.masterLoanId })

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

