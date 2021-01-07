// LOAD REQUIRED PACKAGES
const models = require('../../models');
var xl = require('excel4node');

const sequelize = models.sequelize;
const Sequelize = models.Sequelize;
const Op = Sequelize.Op;
const paginationFUNC = require('../../utils/pagination'); // IMPORTING PAGINATION FUNCTION
const extend = require('extend')
const check = require("../../lib/checkLib"); // IMPORTING CHECKLIB 
const moment = require('moment');
const { getSchemeDetails } = require('../../utils/loanFunction')
var pdf = require("pdf-creator-node"); // PDF CREATOR PACKAGE
var fs = require('fs');
let { sendMessageLoanIdGeneration } = require('../../utils/SMS');
const { VIEW_ALL_CUSTOMER } = require('../../utils/permissionCheck')
const _ = require('lodash');
const { getSingleLoanDetail, intrestCalculationForSelectedLoan, penalInterestCalculationForSelectedLoan, customerNameNumberLoanId, customerLoanDetailsByMasterLoanDetails, getSecuredScheme } = require('../../utils/loanFunction')

const { sendDisbursalMessage } = require('../../utils/SMS')

const { LOAN_TRANSFER_APPLY_LOAN, BASIC_DETAILS_SUBMIT, NOMINEE_DETAILS, ORNAMENTES_DETAILS, FINAL_INTEREST_LOAN, BANK_DETAILS, APPRAISER_RATING, BM_RATING, OPERATIONAL_TEAM_RATING, PACKET_IMAGES, LOAN_DOCUMENTS, LOAN_DISBURSEMENT } = require('../../utils/customerLoanHistory');
var randomize = require('randomatic');

//LOAN DATE CHANGE
exports.loanDateChange = async (req, res, next) => {
    let { loanStartDate, loanUniqueId } = req.body

    let { masterLoanId } = await models.customerLoan.findOne({ where: { loanUniqueId: loanUniqueId } })

    let data = await models.customerLoanMaster.findOne({
        where: { id: masterLoanId },
        attributes: ['tenure', 'id', 'paymentFrequency', 'loanStartDate'],
        order: [[models.customerLoanInterest, 'id', 'asc']],
        include: [
            {
                model: models.customerLoanInterest,
                as: 'customerLoanInterest'
            },
            {
                model: models.customerLoanInitialInterest,
                as: 'initialInterest'
            }
        ]
    })

    let loanEndDate = null
    let diff = moment(data.loanStartDate).diff(loanStartDate, 'days');

    await sequelize.transaction(async t => {
        for (let i = 0; i < data.customerLoanInterest.length; i++) {
            let id = data.customerLoanInterest[i].id
            let emiDueDate
            let emiStartDate
            let emiEndDate
            if (diff < 0) {
                let poss = Math.abs(diff)
                emiDueDate = moment(data.customerLoanInterest[i].emiDueDate).add(poss, 'd').format('YYYY-MM-DD');
                emiStartDate = moment(data.customerLoanInterest[i].emiStartDate).add(poss, 'd').format('YYYY-MM-DD');
                emiEndDate = moment(data.customerLoanInterest[i].emiEndDate).add(poss, 'd').format('YYYY-MM-DD');
            } else {
                emiDueDate = moment(data.customerLoanInterest[i].emiDueDate).subtract(diff, 'd').format('YYYY-MM-DD');
                emiStartDate = moment(data.customerLoanInterest[i].emiStartDate).subtract(diff, 'd').format('YYYY-MM-DD');
                emiEndDate = moment(data.customerLoanInterest[i].emiEndDate).subtract(diff, 'd').format('YYYY-MM-DD');
            }
            loanEndDate = emiDueDate
            await models.customerLoanInterest.update({ emiDueDate, emiStartDate, emiEndDate }, { where: { id: id }, transaction: t })
        }

        for (let i = 0; i < data.initialInterest.length; i++) {
            let id = data.customerLoanInterest[i].id
            let emiDueDate
            if (diff < 0) {
                let poss = Math.abs(diff)
                emiDueDate = moment(data.initialInterest[i].emiDueDate).add(poss, 'd').format('YYYY-MM-DD');
            } else {
                emiDueDate = moment(data.initialInterest[i].emiDueDate).subtract(diff, 'd').format('YYYY-MM-DD');
            }
            await models.customerLoanInitialInterest.update({ emiDueDate }, { where: { id: id }, transaction: t })
        }
        await models.customerLoanMaster.update({ loanStartDate, loanEndDate }, { where: { id: masterLoanId }, transaction: t })

    })
    let date = moment();
    await intrestCalculationForSelectedLoan(date, masterLoanId);
    await penalInterestCalculationForSelectedLoan(date, masterLoanId)

    return res.status(200).json({ loanEndDate })
}


//  FUNCTION FOR GET CUSTOMER DETAILS AFTER ENTER UNIQUE ID DONE
exports.customerDetails = async (req, res, next) => {

    //new request

    let appraiserRequestId = req.params.customerUniqueId;
    let reqId = req.userData.id;
    let getAppraiserRequest = await models.appraiserRequest.findOne({ where: { id: appraiserRequestId, appraiserId: reqId } });

    if (check.isEmpty(getAppraiserRequest)) {
        return res.status(400).json({ message: `This customer is not assign to you` })
    }

    let getCustomer = await models.customer.findOne({ where: { id: getAppraiserRequest.customerId } })

    if (getCustomer.kycStatus != "approved") {
        return res.status(400).json({ message: 'This customer Kyc is not completed' })
    }

    // if (check.isEmpty(getAppraiserRequest)) {
    //     return res.status(400).json({ message: 'This customer Did not assign in to anyone' })
    // }
    // if (reqId != getAppraiserRequest.appraiserId) {
    //     return res.status(400).json({ message: `This customer is not assign to you` })
    // }
    //new request

    let customerData = await models.customer.findOne({
        where: { customerUniqueId: getCustomer.customerUniqueId, isActive: true, kycStatus: 'approved' },
        attributes: ['id', 'customerUniqueId', 'panCardNumber', 'mobileNumber', 'kycStatus', 'panType', 'panImage'],

    })
    let disbursedPendingId = await models.loanStage.findOne({ where: { name: 'disbursement pending' } })
    let bmRatingId = await models.loanStage.findOne({ where: { name: 'bm rating' } })
    let opsRatingId = await models.loanStage.findOne({ where: { name: 'OPS team rating' } })


    let customerLoanStage = await models.customerLoanMaster.findOne({
        where: { customerId: customerData.id, appraiserRequestId: appraiserRequestId, isLoanSubmitted: false, isLoanTransfer: false },
        include: [{
            model: models.customer,
            as: 'customer'
        }]
    })


    if (!check.isEmpty(customerLoanStage)) {
        let { loanStatusForAppraiser, loanStatusForBM, loanStatusForOperatinalTeam } = customerLoanStage;
        if (loanStatusForAppraiser != 'rejected' || loanStatusForBM != 'rejected' || loanStatusForOperatinalTeam != 'rejected') {
            if (customerLoanStage.loanStageId == bmRatingId.id) {
                return res.status(400).json({ message: 'This customer previous Loan bm rating is pending' })
            } else if (customerLoanStage.loanStageId == opsRatingId.id) {
                return res.status(400).json({ message: 'This customer previous Loan ops rating is pending' })
            }
            // else if (customerLoanStage.loanStageId == disbursedPendingId.id) {
            //     return res.status(400).json({ message: 'This customer previous Loan disbursement is pending' })
            // }
        }
        const firstName = customerLoanStage.customer.firstName
        const lastName = customerLoanStage.customer.lastName

        let customerCurrentStage = customerLoanStage.customerLoanCurrentStage

        let partReleaseData;
        if (customerLoanStage.isNewLoanFromPartRelease) {
            partReleaseData = await models.partRelease.findOne({ where: { newLoanId: customerLoanStage.id } });
        }
        let newLoanAmount = null;
        if (partReleaseData) {
            newLoanAmount = partReleaseData.newLoanAmount;
        }

        let loanId = await models.customerLoan.findOne({ where: { masterLoanId: customerLoanStage.id, loanType: 'secured' } })
        if (customerCurrentStage == '2') {
            return res.status(200).json({ message: 'Success', loanId: loanId.id, masterLoanId: customerLoanStage.id, loanCurrentStage: customerCurrentStage, newLoanAmount })
        } else if (customerCurrentStage == '3') {
            return res.status(200).json({ message: 'Success', loanId: loanId.id, masterLoanId: customerLoanStage.id, loanCurrentStage: customerCurrentStage, newLoanAmount })
        } else if (customerCurrentStage == '4') {
            return res.status(200).json({ message: 'Success', loanId: loanId.id, masterLoanId: customerLoanStage.id, loanCurrentStage: customerCurrentStage, totalEligibleAmt: customerLoanStage.totalEligibleAmt, newLoanAmount })
        } else if (customerCurrentStage == '5') {
            return res.status(200).json({ message: 'Success', loanId: loanId.id, masterLoanId: customerLoanStage.id, loanCurrentStage: customerCurrentStage, finalLoanAmount: customerLoanStage.finalLoanAmount, firstName, lastName, newLoanAmount })
        } else if (customerCurrentStage == '6') {
            return res.status(200).json({ message: 'Success', masterLoanId: customerLoanStage.id, loanId: loanId.id, loanCurrentStage: customerCurrentStage, newLoanAmount })
        }
    }

    if (!customerData) {
        res.status(404).json({ message: 'no customer details found' });
    } else {
        res.status(200).json({ message: 'customer details fetch successfully', customerData });
    }
}

//FUNCTION fot submitting basic details DONE
exports.loanBasicDeatils = async (req, res, next) => {

    let { customerId, customerUniqueId, kycStatus, startDate, purpose, masterLoanId, partReleaseId, requestId } = req.body
    let createdBy = req.userData.id;
    let modifiedBy = req.userData.id;
    let stageId = await models.loanStage.findOne({ where: { name: 'applying' } })

    if (masterLoanId != null) {
        let customerLoanMaster = await models.customerLoanMaster.findOne({ where: { id: masterLoanId } });
        if (customerLoanMaster.loanTransferId != null) {
            let transferLoan = await models.customerLoanTransfer.findOne({ where: { id: customerLoanMaster.loanTransferId } });
            if (transferLoan.isLoanApplied == false) {
                await sequelize.transaction(async t => {
                    let loan = await models.customerLoan.findOne({ where: { masterLoanId } });
                    await models.customerLoanMaster.update({ loanStageId: stageId.id, customerLoanCurrentStage: '2', internalBranchId: req.userData.internalBranchId, modifiedBy }, { where: { id: masterLoanId }, transaction: t })
                    await models.customerLoanHistory.create({ loanId: loan.id, masterLoanId: masterLoanId, action: LOAN_TRANSFER_APPLY_LOAN, modifiedBy }, { transaction: t });
                    await models.customerLoanPersonalDetail.update({ purpose, modifiedBy }, { where: { masterLoanId: masterLoanId }, transaction: t })
                    await models.customerLoanTransfer.update({ isLoanApplied: true, modifiedBy }, { where: { id: customerLoanMaster.loanTransferId }, transaction: t });
                })
            }
        }
        let loanId = await models.customerLoan.findOne({ where: { masterLoanId: customerLoanMaster.id, loanType: 'secured' } })
        if (!check.isEmpty(customerLoanMaster)) {
            return res.status(200).json({ message: 'Success', loanstage: stageId, loanId: loanId.id, masterLoanId: customerLoanMaster.id, loanCurrentStage: '2' })
        }
    }

    let loanData = await sequelize.transaction(async t => {
        let masterLoan;
        if (partReleaseId) {
            let partReleaseData = await models.partRelease.findOne({ where: { id: partReleaseId } });
            masterLoan = await models.customerLoanMaster.create({ customerId: customerId, loanStageId: stageId.id, customerLoanCurrentStage: '2', internalBranchId: req.userData.internalBranchId, createdBy, modifiedBy, isNewLoanFromPartRelease: true, parentLoanId: partReleaseData.masterLoanId }, { transaction: t });
        } else {
            masterLoan = await models.customerLoanMaster.create({ customerId: customerId, loanStageId: stageId.id, customerLoanCurrentStage: '2', internalBranchId: req.userData.internalBranchId, appraiserRequestId: requestId, createdBy, modifiedBy }, { transaction: t })

            await models.appraiserRequest.update({ status: 'complete' }, { where: { id: requestId }, transaction: t })
        }

        let loan = await models.customerLoan.create({ customerId, masterLoanId: masterLoan.id, loanType: 'secured', createdBy, modifiedBy }, { transaction: t })

        await models.customerLoanHistory.create({ loanId: loan.id, masterLoanId: masterLoan.id, action: BASIC_DETAILS_SUBMIT, modifiedBy }, { transaction: t });

        await models.customerLoanPersonalDetail.create({ loanId: loan.id, masterLoanId: masterLoan.id, customerUniqueId, startDate, purpose, kycStatus, createdBy, modifiedBy }, { transaction: t });

        if (partReleaseId) {
            await models.partRelease.update({ isLoanCreated: true, newLoanId: masterLoan.id }, { where: { id: partReleaseId }, transaction: t });
        }
        return loan
    })

    return res.status(200).json({ message: 'Success', loanstage: stageId, loanId: loanData.id, masterLoanId: loanData.masterLoanId, loanCurrentStage: '2' })

}

//FUNCTION for submitting nominee details  DONE
exports.loanNomineeDetails = async (req, res, next) => {
    let { nomineeName, nomineeAge, relationship, nomineeType, guardianName, guardianAge, guardianRelationship, loanId, masterLoanId } = req.body
    let createdBy = req.userData.id;
    let modifiedBy = req.userData.id;

    let checkNominee = await models.customerLoanNomineeDetail.findOne({ where: { masterLoanId: masterLoanId } })

    if (check.isEmpty(checkNominee)) {
        let loanData = await sequelize.transaction(async t => {

            let loan = await models.customerLoanMaster.update({ customerLoanCurrentStage: '3', modifiedBy }, { where: { id: masterLoanId }, transaction: t })

            await models.customerLoanHistory.create({ loanId, masterLoanId, action: NOMINEE_DETAILS, modifiedBy }, { transaction: t });

            await models.customerLoanNomineeDetail.create({ loanId, masterLoanId, nomineeName, nomineeAge, relationship, nomineeType, guardianName, guardianAge, guardianRelationship, createdBy, modifiedBy }, { transaction: t })
            return loan
        })
        return res.status(200).json({ message: 'Success', masterLoanId, loanId, loanCurrentStage: '3' })
    } else {
        let loanSubmitted = await models.customerLoanMaster.findOne({ where: { id: masterLoanId } })
        let loanData = await sequelize.transaction(async t => {

            if (loanSubmitted.isLoanSubmitted == false) {
                var loan = await models.customerLoanMaster.update({ customerLoanCurrentStage: '3', modifiedBy }, { where: { id: masterLoanId }, transaction: t })
            }
            await models.customerLoanHistory.create({ loanId, masterLoanId, action: NOMINEE_DETAILS, modifiedBy }, { transaction: t });

            await models.customerLoanNomineeDetail.update({ nomineeName, nomineeAge, relationship, nomineeType, guardianName, guardianAge, guardianRelationship, modifiedBy }, { where: { loanId: loanId }, transaction: t })
            return loan
        })
        return res.status(200).json({ message: 'Success', masterLoanId, loanId, loanCurrentStage: '3' })

    }

}


//FUNCTION for submitting ornament details  DONE
exports.loanOrnmanetDetails = async (req, res, next) => {

    let { loanOrnaments, totalEligibleAmt, fullAmount, loanId, masterLoanId } = req.body
    let allOrnmanets = []
    let createdBy = req.userData.id;
    let modifiedBy = req.userData.id;
    for (let i = 0; i < loanOrnaments.length; i++) {
        loanOrnaments[i]['createdBy'] = createdBy
        loanOrnaments[i]['modifiedBy'] = modifiedBy
        loanOrnaments[i]['loanId'] = loanId
        loanOrnaments[i]['masterLoanId'] = masterLoanId

        allOrnmanets.push(loanOrnaments[i])
    }
    let loanTransferData = await models.customerLoanMaster.findOne({
        where: { id: masterLoanId },
        attributes: ['loanTransferId'],
        include: [{
            model: models.customerLoanTransfer,
            as: "loanTransfer",
            attributes: ['disbursedLoanAmount', 'outstandingLoanAmount', 'processingCharge']
        }]
    });
    let checkIsPartRelease = await models.customerLoanMaster.findOne({
        where: { id: masterLoanId },
        attributes: ['isNewLoanFromPartRelease']
    });
    let partReleaseData;
    if (checkIsPartRelease.isNewLoanFromPartRelease) {
        partReleaseData = await models.partRelease.findOne({ where: { newLoanId: masterLoanId } });
    }
    let newLoanAmount = null;
    if (partReleaseData) {
        newLoanAmount = partReleaseData.newLoanAmount;
    }
    let checkOrnaments = await models.customerLoanOrnamentsDetail.findAll({ where: { masterLoanId: masterLoanId } })
    if (checkOrnaments.length == 0) {
        let loanData = await sequelize.transaction(async t => {
            await models.customerLoanMaster.update({ customerLoanCurrentStage: '4', modifiedBy, fullAmount, totalEligibleAmt }, { where: { id: masterLoanId }, transaction: t })

            let createdOrnaments = await models.customerLoanOrnamentsDetail.bulkCreate(allOrnmanets, { transaction: t });

            await models.customerLoanHistory.create({ loanId, masterLoanId, action: ORNAMENTES_DETAILS, modifiedBy }, { transaction: t });

            return createdOrnaments
        })
        return res.status(200).json({ message: 'Success', loanId, masterLoanId, loanCurrentStage: '4', totalEligibleAmt, ornaments: loanData, loanTransferData, newLoanAmount })
    } else {

        let newOrnaments = allOrnmanets.map((single) => { return single.id })
        let oldOrnaments = checkOrnaments.map((single) => { return single.id })
        let deleteOrnaments = await _.difference(oldOrnaments, newOrnaments);

        let loanSubmitted = await models.customerLoanMaster.findOne({ where: { id: masterLoanId } })
        let loanData = await sequelize.transaction(async t => {
            if (loanSubmitted.isLoanSubmitted == false) {
                await models.customerLoanMaster.update({ customerLoanCurrentStage: '4', modifiedBy, totalEligibleAmt, fullAmount }, { where: { id: masterLoanId }, transaction: t })
            }

            await models.customerLoanHistory.create({ loanId, masterLoanId, action: ORNAMENTES_DETAILS, modifiedBy }, { transaction: t });

            await models.customerLoanOrnamentsDetail.destroy({ where: { id: { [Op.in]: deleteOrnaments } }, transaction: t });
            // let createdOrnaments = await models.customerLoanOrnamentsDetail.bulkCreate( allOrnmanets, { transaction: t });

            let createdOrnaments
                = await models.customerLoanOrnamentsDetail.bulkCreate(allOrnmanets, { updateOnDuplicate: ["loanAmount", "ornamentTypeId", "quantity", "grossWeight", "netWeight", "deductionWeight", "weightMachineZeroWeight", "withOrnamentWeight", "stoneTouch", "acidTest", "purityTest", "karat", "ltvRange", "currentGoldRate", "ornamentImage", "ltvPercent", "ltvAmount", "currentLtvAmount", "evaluation", "ornamentFullAmount", "remark"] }, { transaction: t })

            return createdOrnaments
        })
        return res.status(200).json({ message: 'Success', allOrnmanets, loanId, masterLoanId, loanCurrentStage: '4', totalEligibleAmt, ornaments: loanData, loanTransferData, newLoanAmount })
    }
}

// amount validation and check its a secured scheme aur unsecured scheme
exports.checkForLoanType = async (req, res, next) => {
    let { loanAmount, securedSchemeId, fullAmount, partnerId, isLoanTransfer, isNewLoanFromPartReleaseis, isUnsecuredSchemeApplied } = req.body
    let processingCharge = 0;
    // let ltvPercent = await models.globalSetting.findAll()

    let securedScheme = await getSecuredScheme(securedSchemeId)
    let unsecuredScheme = securedScheme.unsecuredScheme


    // let secureSchemeMaximumAmtAllowed = (securedScheme.maximumPercentageAllowed / 100)

    // let securedLoanAmount = fullAmount * secureSchemeMaximumAmtAllowed
    var securedLoanAmount
    var unsecuredAmount
    // if(securedScheme.isSplitAtBeginning){

    // }else{
    if (isUnsecuredSchemeApplied) {
        let totalRpg = (Number(securedScheme.rpg) + Number(unsecuredScheme.rpg))
        securedLoanAmount = Number(loanAmount) * securedScheme.rpg / totalRpg
        unsecuredAmount = Number(loanAmount) * unsecuredScheme.rpg / totalRpg
        processingCharge = await processingChargeSecuredScheme(securedLoanAmount, securedScheme, unsecuredScheme, unsecuredAmount)

    } else {
        securedLoanAmount = Number(loanAmount)
        processingCharge = await processingChargeSecuredScheme(securedLoanAmount, securedScheme, undefined, undefined)

    }

    if (securedLoanAmount < securedScheme.schemeAmountStart) {
        return res.status(404).json({ message: "Secured scheme range amount is greater than secured loan amount" })
    }

    if (isUnsecuredSchemeApplied && unsecuredAmount < unsecuredScheme.schemeAmountStart) {
        return res.status(404).json({ message: "Unsecured scheme range amount is greater than unsecured loan amount" })
    }

    return res.status(200).json({ data: { securedLoanAmount, processingCharge, isUnsecuredSchemeApplied, unsecuredAmount, securedScheme } })


}


async function selectScheme(unsecured, scheme) {
    let unsecuredArray = [];
    for (let i = 0; i < unsecured.length; i++) {
        let unsec = unsecured[i];
        let schemeInterest = unsec.schemeInterest;
        if (schemeInterest.length != scheme.schemeInterest.length) {
            continue;
        }
        let isMached = true;
        for (let j = 0; j < schemeInterest.length; j++) {
            let schemeIntUnSec = schemeInterest[j];
            let schemeInt = scheme.schemeInterest[j];

            if (schemeIntUnSec.days != schemeInt.days) {
                isMached = false;
                break;
            }
        }
        if (isMached) {
            unsecuredArray.push(unsec);
        }
    }
    return unsecuredArray
}

//common FUNCTION for secure processing charge
async function processingChargeSecuredScheme(amount, securedScheme, unsecuredScheme, unsecuredAmount) {
    let processingCharge = 0
    var processingChargePercent = (amount * securedScheme.processingChargePercent) / 100
    if (processingChargePercent > parseFloat(securedScheme.processingChargeFixed)) {
        processingCharge += processingChargePercent
    } else {
        processingCharge += securedScheme.processingChargeFixed
    }

    if (unsecuredScheme) {
        let processingChargePercentUnsecure = (unsecuredAmount * unsecuredScheme.processingChargePercent) / 100
        if (processingChargePercentUnsecure > parseFloat(unsecuredScheme.processingChargeFixed)) {
            processingCharge += processingChargePercentUnsecure
        } else {
            processingCharge += unsecuredScheme.processingChargeFixed
        }
    }
    return Number(processingCharge.toFixed(2));
}

// FUNCTION for interest
exports.interestRate = async (req, res, next) => {
    let { securedSchemeId, unsecuredSchemeId, paymentFrequency } = req.body

    let securedinterestRate = await models.schemeInterest.findOne({
        where: { days: paymentFrequency, schemeId: securedSchemeId },
        attributes: ['interestRate'],
    })

    if (unsecuredSchemeId) {
        var unsecuredinterestRate = await models.schemeInterest.findOne({
            where: { days: paymentFrequency, schemeId: unsecuredSchemeId },
            attributes: ['interestRate'],
        })
    }

    return res.status(200).json({ data: { securedinterestRate, unsecuredinterestRate } })
}

// Function to generate Interest Table

exports.generateInterestTable = async (req, res, next) => {
    let { securedLoanAmount, interestRate, unsecuredLoanAmount, unsecuredInterestRate, paymentFrequency, isUnsecuredSchemeApplied, tenure, unsecuredSchemeId, schemeId, partnerId } = req.body
    let interestTable = []
    let totalInterestAmount = 0;

    // partner
    let partner = await models.partner.findOne({
        where: { id: partnerId },
        attributes: ['name']
    })

    // secure interest calculation
    let securedScheme = await models.scheme.findOne({
        where: { id: schemeId },
        attributes: ['schemeName'],
        order: [[models.schemeInterest, 'id', 'desc']],
        include: [{
            model: models.schemeInterest,
            as: 'schemeInterest'
        }]
    })
    let securedRebateInterest = securedScheme.schemeInterest[0].interestRate
    let unsecuredRebateInterest = 0;
    let { interest, rebateInterest } = await interestCalcultaion(securedLoanAmount, interestRate, paymentFrequency, securedRebateInterest)
    let securedInterestAmount = interest
    let secureHighestInterestAmount = rebateInterest
    let securedRebateAmount;

    let unsecuredInterestAmount = 0;
    let unsecureHighestInterestAmount = 0;
    let unsecuredRebateAmount = 0;
    // unsecure interest calculation
    if (isUnsecuredSchemeApplied) {
        var unsecuredScheme = await models.scheme.findOne({
            where: { id: unsecuredSchemeId },
            attributes: ['schemeName'],
            order: [[models.schemeInterest, 'id', 'desc']],
            include: [{
                model: models.schemeInterest,
                as: 'schemeInterest'
            }]

        })
        unsecuredRebateInterest = unsecuredScheme.schemeInterest[0].interestRate
        let { interest, rebateInterest } = await interestCalcultaion(unsecuredLoanAmount, unsecuredInterestRate, paymentFrequency, unsecuredRebateInterest)
        unsecuredInterestAmount = interest
        unsecureHighestInterestAmount = rebateInterest

    }

    // generate Table
    let length = (tenure * 30) / paymentFrequency
    console.log(length)
    for (let index = 0; index < Number(length); index++) {
        // let date = new Date("2020/03/08")
        let date;
        let newFrequency;
        if (index == 0) {
            date = new Date()
            newFrequency = paymentFrequency - 1
        } else {
            date = new Date(interestTable[interestTable.length - 1].emiDueDate)
            newFrequency = paymentFrequency
        }
        let data = {
            emiDueDate: moment(new Date(date.setDate(date.getDate() + (Number(newFrequency)))), "DD-MM-YYYY").format('YYYY-MM-DD'),
            month: "Month " + ((paymentFrequency / 30) * (index + 1)).toString(),
            paymentType: paymentFrequency,
            securedInterestAmount: securedInterestAmount,
            secureHighestInterestAmount: secureHighestInterestAmount,
            unsecuredInterestAmount: unsecuredInterestAmount,
            unsecureHighestInterestAmount: unsecureHighestInterestAmount,
            securedRebateAmount: (secureHighestInterestAmount - securedInterestAmount),
            unsecuredRebateAmount: (unsecureHighestInterestAmount - unsecuredInterestAmount),
            totalAmount: Number(securedInterestAmount) + Number(unsecuredInterestAmount)
        }
        interestTable.push(data)
    }

    if (!Number.isInteger(length)) {


        const noOfMonths = (((tenure * 30) - ((interestTable.length - 1) * paymentFrequency)) / 30)
        const lastElementOfTable = interestTable[interestTable.length - 1]
        const secondLast = interestTable[interestTable.length - 2]
        let date = new Date(secondLast.emiDueDate)
        const oneMonthSecured = securedInterestAmount / (paymentFrequency / 30)
        const oneMonthRebate = secureHighestInterestAmount / (paymentFrequency / 30)
        let secure = (oneMonthSecured * noOfMonths).toFixed(2)
        let secureRebate = (oneMonthRebate * noOfMonths).toFixed(2)
        lastElementOfTable.securedInterestAmount = secure;
        lastElementOfTable.secureHighestInterestAmount = secureRebate;
        lastElementOfTable.securedRebateAmount = (secureRebate - secure);
        lastElementOfTable.month = "Month " + tenure;
        let r = (tenure * 30) - (paymentFrequency * (interestTable.length - 1))
        lastElementOfTable.emiDueDate = moment(new Date(date.setDate(date.getDate() + (r))), "DD-MM-YYYY").format('YYYY-MM-DD')

        if (isUnsecuredSchemeApplied) {
            const oneMonthUnsecured = unsecuredInterestAmount / (paymentFrequency / 30)
            const oneMonthRebate = unsecureHighestInterestAmount / (paymentFrequency / 30)
            let unsecured = (oneMonthUnsecured * noOfMonths).toFixed(2)
            let unsecuredRebate = (oneMonthRebate * noOfMonths).toFixed(2)
            lastElementOfTable.unsecuredInterestAmount = unsecured
            lastElementOfTable.unsecureHighestInterestAmount = unsecuredRebate
            lastElementOfTable.unsecuredRebateAmount = (unsecuredRebate - unsecured)
            lastElementOfTable.totalAmount = Number(lastElementOfTable.securedInterestAmount) + Number(lastElementOfTable.unsecuredInterestAmount)
        }

    }

    interestTable.forEach(amount => {
        if (isUnsecuredSchemeApplied) {
            totalInterestAmount += amount.totalAmount
        } else {
            totalInterestAmount += Number(amount.securedInterestAmount)
        }
    });

    return res.status(200).json({ data: { interestTable, totalInterestAmount, securedScheme, unsecuredScheme, interestRate, unsecuredInterestRate, isUnsecuredSchemeApplied, partner, securedRebateInterest, unsecuredRebateInterest } })
}

// FUNCTION FOR unsecure table generation

exports.unsecuredTableGeneration = async (req, res, next) => {
    let { unsecuredSchemeAmount, unsecuredSchemeId, paymentFrequency, tenure } = req.body
    console.log(req.body)
    let interestTable = []
    var unsecuredInterestRate = await models.schemeInterest.findOne({
        where: { days: paymentFrequency, schemeId: unsecuredSchemeId },
        attributes: ['interestRate'],
    })

    var unsecuredInterestAmount = await interestCalcultaion(unsecuredSchemeAmount, unsecuredInterestRate.interestRate, paymentFrequency)

    let length = (tenure * 30) / paymentFrequency
    for (let index = 0; index < Number(length); index++) {
        let date = new Date()
        let data = {
            emiDueDate: moment(new Date(date.setDate(date.getDate() + (paymentFrequency * (index + 1)))), "DD-MM-YYYY").format('YYYY-MM-DD'),
            month: "Month " + ((paymentFrequency / 30) * (index + 1)).toString(),
            paymentType: paymentFrequency,
            unsecuredInterestAmount: unsecuredInterestAmount,
        }
        // if (Number(paymentFrequency) != 30) {
        //     if (index == 0) {
        //         data.month = "Month 1"
        //     }
        //     else {
        //         data.month = "Month " + (((paymentFrequency / 30) * (index)) + 1)
        //     }
        // }
        interestTable.push(data)
    }

    if (!Number.isInteger(length)) {
        let date = new Date()
        const lastElementOfTable = interestTable[interestTable.length - 1]

        let unsecure = (unsecuredInterestAmount / Math.ceil(length)).toFixed(2)
        lastElementOfTable.unsecuredInterestAmount = unsecure
        lastElementOfTable.month = "Month " + tenure;
        lastElementOfTable.emiDueDate = moment(new Date(date.setDate(date.getDate() + (30 * tenure))), "DD-MM-YYYY").format('YYYY-MM-DD')

    }

    return res.status(200).json({ data: { interestTable } })

}


// interest calculation
async function interestCalcultaion(amount, interestRate, paymentFrequency, rebateInterestRate) {

    let interest = ((Number(amount) * (Number(interestRate) * 12 / 100)) * Number(paymentFrequency)
        / 360).toFixed(2)
    let rebateInterest = ((Number(amount) * (Number(rebateInterestRate) * 12 / 100)) * Number(paymentFrequency)
        / 360).toFixed(2)
    return { interest, rebateInterest }
}

// function for unsecured scheme

exports.getUnsecuredScheme = async (req, res, next) => {

    let { partnerId, amount, securedSchemeId } = req.query
    amount = Number(amount)

    let securedScheme = await getSecuredScheme(securedSchemeId)

    let unsecuredScheme = await getUnsecuredScheme(partnerId, amount)


    let unsecured = unsecuredScheme.schemes
    var unsecuredSchemeApplied;

    var defaultUnsecuredScheme = unsecuredScheme.schemes.filter(scheme => { return scheme.default })
    let defaultFind = await selectScheme(defaultUnsecuredScheme, securedScheme)

    if (!check.isEmpty(defaultFind)) {
        unsecuredSchemeApplied = defaultFind[0]
    } else {
        let checkScheme = await selectScheme(unsecured, securedScheme)
        if (checkScheme.length === 0) {
            return res.status(400).json({ message: "No Unsecured Scheme Availabe" })
        }
        unsecuredSchemeApplied = checkScheme
    }
    return res.status(200).json({ data: unsecuredSchemeApplied })
}

// async function getSecuredScheme(securedSchemeId) {
//     let securedScheme = await models.scheme.findOne({
//         where: { id: securedSchemeId },
//         // attributes: ['id'],
//         order: [
//             [models.schemeInterest, 'days', 'asc']
//         ],
//         include: [{
//             model: models.schemeInterest,
//             as: 'schemeInterest',
//             attributes: ['days', 'interestRate']
//         }, {
//             model: models.scheme,
//             as: 'unsecuredScheme'
//         }]
//     })
//     return securedScheme
// }


async function getUnsecuredScheme(partnerId, amount) {
    unsecuredScheme = await models.partner.findOne({
        where: { id: partnerId },
        // attributes: ['id'],
        order: [
            [models.scheme, 'id', 'asc'],
            [models.scheme, models.schemeInterest, 'days', 'asc']
        ],
        include: [
            {
                model: models.scheme,
                // attributes: ['id', 'default'],
                where: {
                    isActive: true,
                    schemeType: 'unsecured',
                    [Op.and]: {
                        schemeAmountStart: { [Op.lte]: amount },
                        schemeAmountEnd: { [Op.gte]: amount },
                    }
                },
                include: [
                    {
                        model: models.schemeInterest,
                        as: 'schemeInterest',
                        attributes: ['days', 'interestRate']
                    }
                ]
            }
        ]
    })
    return unsecuredScheme
}

//FUNCTION for final loan calculator
exports.loanFinalLoan = async (req, res, next) => {
    let { loanFinalCalculator, loanId, masterLoanId, interestTable, ornaments, totalEligibleAmt } = req.body
    let { partnerId, schemeId, finalLoanAmount, loanStartDate, tenure, loanEndDate, paymentFrequency, processingCharge, interestRate, unsecuredInterestRate, unsecuredSchemeId, securedLoanAmount, unsecuredLoanAmount, totalFinalInterestAmt, isUnsecuredSchemeApplied, loanTransferExtraAmount, securedRebateInterest, unsecuredRebateInterest } = loanFinalCalculator
    let isLoanTransferExtraAmountAdded = false;
    let createdBy = req.userData.id;
    let modifiedBy = req.userData.id;

    if (loanTransferExtraAmount > 0) {
        isLoanTransferExtraAmountAdded = true;
        finalLoanAmount = Number(finalLoanAmount) + Number(loanTransferExtraAmount)
    }
    // unsecuredLoanId
    let interestData = [];
    for (let i = 0; i < interestTable.length; i++) {
        interestTable[i]['createdBy'] = createdBy
        interestTable[i]['modifiedBy'] = modifiedBy
        interestTable[i]['loanId'] = loanId
        interestTable[i]['interestAmount'] = interestTable[i].securedInterestAmount
        interestTable[i]['outstandingInterest'] = interestTable[i].securedInterestAmount
        interestTable[i]['highestInterestAmount'] = interestTable[i].secureHighestInterestAmount
        interestTable[i]['rebateAmount'] = interestTable[i].securedRebateAmount
        interestTable[i]['masterLoanId'] = masterLoanId
        interestTable[i]['interestRate'] = interestRate
        interestTable[i]['rebateInterestRate'] = securedRebateInterest
        interestData.push(interestTable[i])
    }

    let checkFinalLoan = await models.customerLoanMaster.findOne({
        where: { id: masterLoanId },
        include: [{
            model: models.customer,
            as: 'customer'
        }]
    })

    //get slab rate
    let securedSlab = await getSchemeSlab(schemeId, loanId)

    let securedPenal = await getSchemeDetails(schemeId)

    if (isUnsecuredSchemeApplied) {
        var unsecuredPenal = await getSchemeDetails(schemeId)
    }

    let scheme = await getSecuredScheme(schemeId)

    const firstName = checkFinalLoan.customer.firstName
    const lastName = checkFinalLoan.customer.lastName

    if (check.isEmpty(checkFinalLoan.finalLoanAmount)) {
        let loanData = await sequelize.transaction(async t => {
            //  new changes
            for (let index = 0; index < ornaments.length; index++) {
                const element = ornaments[index];

                await models.customerLoanOrnamentsDetail.update({ loanAmount: element.loanAmount, currentGoldRate: element.rpg }, { where: { id: element.id }, transaction: t })
            }
            //
            await models.customerLoanInterest.bulkCreate(interestData, { transaction: t });
            await models.customerLoanInitialInterest.bulkCreate(interestData, { transaction: t });

            await models.customerLoanSlabRate.bulkCreate(securedSlab, { transaction: t })

            if (isUnsecuredSchemeApplied == true) {
                await models.customerLoanMaster.update({ customerLoanCurrentStage: '5', totalFinalInterestAmt, finalLoanAmount, outstandingAmount: finalLoanAmount, securedLoanAmount, unsecuredLoanAmount, tenure, loanStartDate, loanEndDate, paymentFrequency, processingCharge, isUnsecuredSchemeApplied, isLoanTransferExtraAmountAdded, loanTransferExtraAmount, totalEligibleAmt }, { where: { id: masterLoanId }, transaction: t })

                var unsecuredLoan = await models.customerLoan.create({ customerId: checkFinalLoan.customerId, masterLoanId, partnerId, loanAmount: unsecuredLoanAmount, outstandingAmount: unsecuredLoanAmount, schemeId: unsecuredSchemeId, interestRate: unsecuredInterestRate, currentSlab: paymentFrequency, selectedSlab: paymentFrequency, currentInterestRate: unsecuredInterestRate, rebateInterestRate: unsecuredRebateInterest, penalInterest: unsecuredPenal.penalInterest, loanType: "unsecured", createdBy, modifiedBy, rpg: scheme.unsecuredScheme.rpg }, { transaction: t })

                let newUnsecuredInterestData = []
                for (let i = 0; i < interestTable.length; i++) {
                    interestTable[i]['createdBy'] = createdBy
                    interestTable[i]['modifiedBy'] = modifiedBy
                    interestTable[i]['loanId'] = unsecuredLoan.id
                    interestTable[i]['interestAmount'] = interestTable[i].unsecuredInterestAmount
                    interestTable[i]['outstandingInterest'] = interestTable[i].unsecuredInterestAmount
                    interestTable[i]['masterLoanId'] = masterLoanId
                    interestTable[i]['interestRate'] = unsecuredInterestRate
                    interestTable[i]['highestInterestAmount'] = interestTable[i].unsecureHighestInterestAmount
                    interestTable[i]['rebateInterestRate'] = unsecuredRebateInterest
                    interestTable[i]['rebateAmount'] = interestTable[i].unsecuredRebateAmount

                    newUnsecuredInterestData.push(interestTable[i])
                }
                let unsecuredSlab = await getSchemeSlab(unsecuredSchemeId, unsecuredLoan.id)
                await models.customerLoanSlabRate.bulkCreate(unsecuredSlab, { transaction: t })

                await models.customerLoanInterest.bulkCreate(newUnsecuredInterestData, { transaction: t });
                await models.customerLoanInitialInterest.bulkCreate(newUnsecuredInterestData, { transaction: t });

                await models.customerLoan.update({ partnerId, schemeId, loanAmount: securedLoanAmount, outstandingAmount: securedLoanAmount, interestRate, currentSlab: paymentFrequency, selectedSlab: paymentFrequency, currentInterestRate: interestRate, penalInterest: securedPenal.penalInterest, rebateInterestRate: securedRebateInterest, unsecuredLoanId: unsecuredLoan.id, rpg: scheme.rpg, modifiedBy }, { where: { id: loanId }, transaction: t })

                await models.customerLoanHistory.create({ loanId, masterLoanId, action: FINAL_INTEREST_LOAN, modifiedBy }, { transaction: t });

            } else {
                await models.customerLoanMaster.update({ customerLoanCurrentStage: '5', totalFinalInterestAmt, finalLoanAmount, outstandingAmount: finalLoanAmount, securedLoanAmount, unsecuredLoanAmount, tenure, loanStartDate, loanEndDate, paymentFrequency, processingCharge, isUnsecuredSchemeApplied, isLoanTransferExtraAmountAdded, loanTransferExtraAmount, totalEligibleAmt }, { where: { id: masterLoanId }, transaction: t })

                await models.customerLoan.update({ partnerId, schemeId, loanAmount: securedLoanAmount, outstandingAmount: securedLoanAmount, interestRate, currentSlab: paymentFrequency, selectedSlab: paymentFrequency, currentInterestRate: interestRate, rebateInterestRate: securedRebateInterest, penalInterest: securedPenal.penalInterest, rpg: scheme.rpg, createdBy, modifiedBy }, { where: { id: loanId }, transaction: t })

                await models.customerLoanHistory.create({ loanId, masterLoanId, action: FINAL_INTEREST_LOAN, modifiedBy }, { transaction: t });

            }

        })
        return res.status(200).json({ message: 'Success', loanId: loanId, loanCurrentStage: '5', finalLoanAmount, firstName, lastName })
    } else {


        let loanSubmitted = await models.customerLoanMaster.findOne({ where: { id: masterLoanId } })
        let getUnsecuredLoanId = await models.customerLoan.findOne({ where: { id: loanId } });



        let loanData = await sequelize.transaction(async t => {
            //  new changes
            for (let index = 0; index < ornaments.length; index++) {
                const element = ornaments[index];

                await models.customerLoanOrnamentsDetail.update({ loanAmount: element.loanAmount, currentLtvAmount: element.rpg }, { where: { id: element.id }, transaction: t })
            }
            //
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
                    interestTable[i]['highestInterestAmount'] = interestTable[i].unsecureHighestInterestAmount
                    interestTable[i]['rebateInterestRate'] = unsecuredRebateInterest
                    interestTable[i]['rebateAmount'] = interestTable[i].unsecuredRebateAmount

                    unsecuredInterestData.push(interestTable[i])
                }

                unsecuredSlab = await getSchemeSlab(unsecuredSchemeId, getUnsecuredLoanId.unsecuredLoanId)
            }

            if (isUnsecuredSchemeApplied == true) {

                if (getUnsecuredLoanId.unsecuredLoanId == null) {

                    await models.customerLoanMaster.update({ customerLoanCurrentStage: '5', totalFinalInterestAmt, finalLoanAmount, outstandingAmount: finalLoanAmount, securedLoanAmount, unsecuredLoanAmount, tenure, loanStartDate, loanEndDate, paymentFrequency, processingCharge, isUnsecuredSchemeApplied, isLoanTransferExtraAmountAdded, loanTransferExtraAmount, totalEligibleAmt }, { where: { id: masterLoanId }, transaction: t })

                    var unsecuredLoan = await models.customerLoan.create({ customerId: loanSubmitted.customerId, masterLoanId, partnerId, schemeId: unsecuredSchemeId, loanAmount: unsecuredLoanAmount, outstandingAmount: unsecuredLoanAmount, interestRate: unsecuredInterestRate, penalInterest: unsecuredPenal.penalInterest, currentSlab: paymentFrequency, selectedSlab: paymentFrequency, currentInterestRate: unsecuredInterestRate, rebateInterestRate: unsecuredRebateInterest, loanType: "unsecured", rpg: scheme.unsecuredScheme.rpg, createdBy, modifiedBy }, { transaction: t })

                    await models.customerLoan.update({ partnerId, schemeId, loanAmount: securedLoanAmount, outstandingAmount: securedLoanAmount, interestRate, currentSlab: paymentFrequency, selectedSlab: paymentFrequency, currentInterestRate: interestRate, penalInterest: securedPenal.penalInterest, rebateInterestRate: securedRebateInterest, loanType: "secured", unsecuredLoanId: unsecuredLoan.id, rpg: scheme.rpg, createdBy, modifiedBy }, { where: { id: loanId }, transaction: t })

                    let newUnsecuredInterestData = []
                    for (let i = 0; i < interestTable.length; i++) {
                        interestTable[i]['createdBy'] = createdBy
                        interestTable[i]['modifiedBy'] = modifiedBy
                        interestTable[i]['loanId'] = unsecuredLoan.id
                        interestTable[i]['interestAmount'] = interestTable[i].unsecuredInterestAmount
                        interestTable[i]['outstandingInterest'] = interestTable[i].unsecuredInterestAmount
                        interestTable[i]['masterLoanId'] = masterLoanId
                        interestTable[i]['interestRate'] = unsecuredInterestRate
                        interestTable[i]['highestInterestAmount'] = interestTable[i].unsecureHighestInterestAmount
                        interestTable[i]['rebateInterestRate'] = unsecuredRebateInterest
                        interestTable[i]['rebateAmount'] = interestTable[i].unsecuredRebateAmount

                        newUnsecuredInterestData.push(interestTable[i])
                    }

                    let newUnsecuredSlab = await getSchemeSlab(unsecuredSchemeId, unsecuredLoan.id)

                    await models.customerLoanInterest.bulkCreate(newUnsecuredInterestData, { transaction: t });
                    await models.customerLoanInitialInterest.bulkCreate(newUnsecuredInterestData, { transaction: t });
                    await models.customerLoanSlabRate.bulkCreate(newUnsecuredSlab, { transaction: t })



                    await models.customerLoanHistory.create({ loanId, masterLoanId, action: FINAL_INTEREST_LOAN, modifiedBy }, { transaction: t });

                } else {

                    await models.customerLoanMaster.update({ customerLoanCurrentStage: '5', totalFinalInterestAmt, finalLoanAmount, outstandingAmount: finalLoanAmount, securedLoanAmount, unsecuredLoanAmount, tenure, loanStartDate, loanEndDate, paymentFrequency, processingCharge, isUnsecuredSchemeApplied, isLoanTransferExtraAmountAdded, loanTransferExtraAmount, totalEligibleAmt }, { where: { id: masterLoanId }, transaction: t })

                    await models.customerLoan.update({ partnerId, schemeId, loanAmount: securedLoanAmount, outstandingAmount: securedLoanAmount, interestRate, currentSlab: paymentFrequency, selectedSlab: paymentFrequency, currentInterestRate: interestRate, penalInterest: securedPenal.penalInterest, rebateInterestRate: securedRebateInterest, rpg: scheme.rpg, modifiedBy }, { where: { id: loanId }, transaction: t })

                    await models.customerLoan.update({ partnerId, schemeId: unsecuredSchemeId, loanAmount: unsecuredLoanAmount, outstandingAmount: unsecuredLoanAmount, interestRate: unsecuredInterestRate, penalInterest: unsecuredPenal.penalInterest, currentSlab: paymentFrequency, selectedSlab: paymentFrequency, rebateInterestRate: unsecuredRebateInterest, currentInterestRate: unsecuredInterestRate, rpg: scheme.unsecuredScheme.rpg, modifiedBy, isActive: true }, { where: { id: getUnsecuredLoanId.unsecuredLoanId }, transaction: t })

                    await models.customerLoanInterest.destroy({ where: { loanId: getUnsecuredLoanId.unsecuredLoanId }, transaction: t })
                    await models.customerLoanInitialInterest.destroy({ where: { loanId: getUnsecuredLoanId.unsecuredLoanId }, transaction: t });
                    await models.customerLoanSlabRate.destroy({ where: { loanId: getUnsecuredLoanId.unsecuredLoanId }, transaction: t })


                    await models.customerLoanInterest.bulkCreate(unsecuredInterestData, { transaction: t });
                    await models.customerLoanInitialInterest.bulkCreate(unsecuredInterestData, { transaction: t });
                    await models.customerLoanSlabRate.bulkCreate(unsecuredSlab, { transaction: t })

                    await models.customerLoanHistory.create({ loanId, masterLoanId, action: FINAL_INTEREST_LOAN, modifiedBy }, { transaction: t });

                }

            } else {
                await models.customerLoanMaster.update({ customerLoanCurrentStage: '5', totalFinalInterestAmt, finalLoanAmount, outstandingAmount: finalLoanAmount, securedLoanAmount, unsecuredLoanAmount, tenure, loanStartDate, loanEndDate, paymentFrequency, processingCharge, isUnsecuredSchemeApplied, isLoanTransferExtraAmountAdded, loanTransferExtraAmount, totalEligibleAmt }, { where: { id: masterLoanId }, transaction: t })


                await models.customerLoanInterest.destroy({ where: { loanId: getUnsecuredLoanId.unsecuredLoanId }, transaction: t })
                await models.customerLoanInitialInterest.destroy({ where: { loanId: getUnsecuredLoanId.unsecuredLoanId }, transaction: t });
                await models.customerLoanSlabRate.destroy({ where: { loanId: getUnsecuredLoanId.unsecuredLoanId }, transaction: t })
                await models.customerLoanHistory.destroy({ where: { loanId: getUnsecuredLoanId.unsecuredLoanId }, transaction: t })
                await models.customerLoan.update({ partnerId, schemeId, unsecuredLoanId: null, loanAmount: securedLoanAmount, outstandingAmount: securedLoanAmount, interestRate, penalInterest: securedPenal.penalInterest, currentSlab: paymentFrequency, selectedSlab: paymentFrequency, currentInterestRate: interestRate, rebateInterestRate: securedRebateInterest, rpg: scheme.rpg, modifiedBy }, { where: { id: loanId }, transaction: t })

                await models.customerLoan.destroy({ where: { id: getUnsecuredLoanId.unsecuredLoanId }, transaction: t })



                await models.customerLoanHistory.create({ loanId, masterLoanId, action: FINAL_INTEREST_LOAN, modifiedBy }, { transaction: t });

            }

        })
        return res.status(200).json({ message: 'Success', loanId, masterLoanId, loanCurrentStage: '5', finalLoanAmount, firstName, lastName })
    }
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


//FUNCTION for loan bank details DONE
exports.loanBankDetails = async (req, res, next) => {
    let { loanId, masterLoanId, paymentType, bankName, accountNumber, ifscCode, bankBranchName, accountHolderName, passbookProof } = req.body
    let createdBy = req.userData.id;
    let modifiedBy = req.userData.id;

    let checkBank = await models.customerLoanBankDetail.findOne({ where: { masterLoanId: masterLoanId } })

    if (check.isEmpty(checkBank)) {
        let loanData = await sequelize.transaction(async t => {
            await models.customerLoanMaster.update({ customerLoanCurrentStage: '6', modifiedBy }, { where: { id: masterLoanId }, transaction: t })

            await models.customerLoanHistory.create({ loanId, masterLoanId, action: BANK_DETAILS, modifiedBy }, { transaction: t });

            let loan = await models.customerLoanBankDetail.create({ loanId, masterLoanId, paymentType, bankName, accountNumber, ifscCode, bankBranchName, accountHolderName, passbookProof, createdBy, modifiedBy }, { transaction: t });

            return loan
        })
        return res.status(200).json({ message: 'Success', loanId, masterLoanId, loanCurrentStage: '6' })
    } else {

        let loanSubmitted = await models.customerLoanMaster.findOne({ where: { id: masterLoanId } })

        let loanData = await sequelize.transaction(async t => {
            // if (loanSubmitted.isLoanSubmitted == false) {
            var a = await models.customerLoanMaster.update({ customerLoanCurrentStage: '6', modifiedBy }, { where: { id: masterLoanId }, transaction: t })
            // }
            await models.customerLoanHistory.create({ loanId, masterLoanId, action: BANK_DETAILS, modifiedBy }, { transaction: t });
            console.log(a)
            let loan = await models.customerLoanBankDetail.update({ paymentType, bankName, accountNumber, ifscCode, bankBranchName, accountHolderName, passbookProof, createdBy, modifiedBy }, { where: { loanId: loanId }, transaction: t });

            return loan
        })
        return res.status(200).json({ message: 'Success', loanId, masterLoanId, loanCurrentStage: '6' })
    }

}

//FUNCTION FOR APPRAISER RATING DONE
exports.loanAppraiserRating = async (req, res, next) => {
    let { loanId, masterLoanId,
        applicationFormForAppraiser, goldValuationForAppraiser, loanStatusForAppraiser, commentByAppraiser } = req.body
    let createdBy = req.userData.id;
    let modifiedBy = req.userData.id;
    let appraiserId = req.userData.id

    let ornament = await models.customerLoanMaster.findOne({
        where: { id: masterLoanId },
        include: [{
            model: models.customerLoanOrnamentsDetail,
            as: 'loanOrnamentsDetail',
            include: [
                {
                    model: models.ornamentType,
                    as: "ornamentType"
                }
            ]
        }]
    });

    let customerDetails = await models.customer.findOne({ where: { id: ornament.customerId } })

    let sliceCustId = customerDetails.customerUniqueId.slice(0, 2)

    let loanData = await sequelize.transaction(async t => {


        await models.appraiserRequest.update({ isProcessComplete: true }, { where: { id: ornament.appraiserRequestId }, transaction: t })

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
                include: [{
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


                await models.customerLoan.update({ loanUniqueId: loanUniqueId }, { where: { id: loanId }, transaction: t })

                if (loanDetail.unsecuredLoanId != null) {
                    if (loanDetail.unsecuredLoan.loanUniqueId == null) {
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

                        await models.customerLoan.update({ loanUniqueId: unsecuredLoanUniqueId }, { where: { id: loanDetail.unsecuredLoanId }, transaction: t });

                    }
                }

                await sendMessageLoanIdGeneration(customerDetails.mobileNumber, customerDetails.firstName, loanSendId)
            } else {
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

    let ornamentType = [];
    if (ornament.loanOrnamentsDetail.length != 0) {
        for (let ornamentsDetail of ornament.loanOrnamentsDetail) {
            ornamentType.push({ ornamentType: ornamentsDetail.ornamentType.name, id: ornamentsDetail.id })
        }
    }
    return res.status(200).json({ message: 'Success', ornamentType })

}

//  FUNCTION FOR ADD PACKAGE IMAGES
exports.addPackageImagesForLoan = async (req, res, next) => {

    let { loanId, masterLoanId, emptyPacketWithNoOrnament, sealingPacketWithWeight, sealingPacketWithCustomer, packetOrnamentArray } = req.body;
    let createdBy = req.userData.id;
    let modifiedBy = req.userData.id;
    let loanDetails = await models.customerLoanMaster.findOne({ where: { id: masterLoanId } });

    let getPackets = await models.customerLoanPackageDetails.findAll({ where: { masterLoanId: masterLoanId } })

    let packetArray = await packetOrnamentArray.map(ele => {
        return ele.packetId
    })
    let packetUpdateArray = await packetArray.map(ele => {
        let obj = {}
        obj.id = Number(ele);
        obj.customerId = loanDetails.customerId;
        obj.loanId = loanId;
        obj.masterLoanId = masterLoanId;
        obj.modifiedBy = modifiedBy
        obj.packetAssigned = true;
        return obj
    })

    if (check.isEmpty(getPackets)) {

        //FOR PACKET UPDATE

        await sequelize.transaction(async (t) => {
            let stageId = await models.loanStage.findOne({ where: { name: 'bm rating' }, transaction: t })

            await models.customerLoanMaster.update({ loanStageId: stageId.id, modifiedBy }, { where: { id: masterLoanId }, transaction: t })

            let loanPacket = await models.customerLoanPackageDetails.create({ loanId, masterLoanId, emptyPacketWithNoOrnament, sealingPacketWithWeight, sealingPacketWithCustomer, createdBy, modifiedBy }, { transaction: t })

            let packetMapping = []
            for (single of packetOrnamentArray) {
                let entry = {}
                entry['customerLoanPackageDetailId'] = loanPacket.id
                entry['packetId'] = single.packetId
                packetMapping.push(entry)
            }

            await models.customerLoanPacket.bulkCreate(packetMapping, { transaction: t })

            let ornamentPacketData = [];
            for (let x of packetOrnamentArray) {
                for (let singleOrnamentId of x.ornamentsId) {
                    let pushData = {}
                    pushData['packetId'] = Number(x.packetId)
                    pushData['ornamentDetailId'] = Number(singleOrnamentId)
                    ornamentPacketData.push(pushData)
                }
            }
            await models.packetOrnament.bulkCreate(ornamentPacketData, { transaction: t })

            await models.packet.bulkCreate(packetUpdateArray, {
                updateOnDuplicate: ["customerId", "loanId", "masterLoanId", "modifiedBy", "packetAssigned"]
            }, { transaction: t })

            await models.customerLoanHistory.create({ loanId, masterLoanId, action: PACKET_IMAGES, modifiedBy }, { transaction: t });

        })


    }
    else {
        await sequelize.transaction(async (t) => {
            let stageId = await models.loanStage.findOne({ where: { name: 'bm rating' }, transaction: t })

            await models.customerLoanMaster.update({ loanStageId: stageId.id, modifiedBy }, { where: { id: masterLoanId }, transaction: t })

            let loanPacket = await models.customerLoanPackageDetails.update({ loanId, masterLoanId, emptyPacketWithNoOrnament, sealingPacketWithWeight, sealingPacketWithCustomer, createdBy, modifiedBy }, { where: { masterLoanId: masterLoanId }, transaction: t })


            let previousSelectedPacket = await models.packet.findAll({ where: { masterLoanId: masterLoanId } })


            let packetId = previousSelectedPacket.map(ele => ele.id)

            let x = await models.customerLoanPacket.destroy({ where: { customerLoanPackageDetailId: getPackets[0].id }, transaction: t })

            let y = await models.packetOrnament.destroy({ where: { packetId: { [Op.in]: packetId } }, transaction: t })


            let z = await models.packet.update({ customerId: null, loanId: null, masterLoanId: null, packetAssigned: false, isActive: false }, {
                where: { id: { [Op.in]: packetId } }, transaction: t
            })

            let packetMapping = []
            for (single of packetOrnamentArray) {
                let entry = {}
                entry['customerLoanPackageDetailId'] = getPackets[0].id
                entry['packetId'] = single.packetId
                packetMapping.push(entry)
            }

            await models.customerLoanPacket.bulkCreate(packetMapping, { transaction: t })

            let ornamentPacketData = [];
            for (let x of packetOrnamentArray) {
                for (let singleOrnamentId of x.ornamentsId) {
                    let pushData = {}
                    pushData['packetId'] = Number(x.packetId)
                    pushData['ornamentDetailId'] = Number(singleOrnamentId)
                    ornamentPacketData.push(pushData)
                }
            }
            console.log(ornamentPacketData)
            let a = await models.packetOrnament.bulkCreate(ornamentPacketData, { transaction: t })

            console.log(packetUpdateArray)
            for (let i = 0; i < packetUpdateArray.length; i++) {
                var b = await models.packet.update({ customerId: packetUpdateArray[i].customerId, loanId: packetUpdateArray[i].loanId, masterLoanId: packetUpdateArray[i].masterLoanId, modifiedBy: packetUpdateArray[i].modifiedBy, packetAssigned: packetUpdateArray[i].packetAssigned, isActive: true }, { where: { id: packetUpdateArray[i].id }, transaction: t })
            }

            // await models.packet.bulkCreate(packetUpdateArray, {
            //     updateOnDuplicate: ["customerId", "loanId", "masterLoanId", "modifiedBy", "packetAssigned"]
            // }, { transaction: t })

            await models.customerLoanHistory.create({ loanId, masterLoanId, action: PACKET_IMAGES, modifiedBy }, { transaction: t });
        })


    }
    return res.status(200).json({ message: `Packets added successfully` })
}

//FUNCTION FOR BM RATING
exports.loanBmRating = async (req, res, next) => {

    let { loanId, masterLoanId,
        applicationFormForBM, goldValuationForBM, loanStatusForBM, commentByBM } = req.body
    let createdBy = req.userData.id;
    let modifiedBy = req.userData.id;


    let checkAppraiserVerified = await models.customerLoanMaster.findOne({ where: { loanStatusForAppraiser: "approved", id: masterLoanId } })
    if (check.isEmpty(checkAppraiserVerified)) {
        return res.status(400).json({ message: `Appraiser rating not verified` })
    }
    if (checkAppraiserVerified.loanStatusForBM == "approved" || checkAppraiserVerified.loanStatusForBM == "rejected") {
        return res.status(400).json({ message: `You cannot change status for this customer` })
    }
    let bmId = req.userData.id
    if (loanStatusForBM != "approved") {
        if (loanStatusForBM == 'incomplete') {
            let incompleteStageId = await models.loanStage.findOne({ where: { name: 'appraiser rating' } })
            await sequelize.transaction(async (t) => {
                await models.customerLoanMaster.update(
                    { loanStatusForAppraiser: "pending", applicationFormForBM, goldValuationForBM, loanStatusForBM, commentByBM, loanStageId: incompleteStageId.id, bmId, modifiedBy },
                    { where: { id: masterLoanId }, transaction: t })

                await models.customerLoanHistory.create({ loanId, masterLoanId, action: BM_RATING, modifiedBy }, { transaction: t });
            })

            return res.status(200).json({ message: 'Success' })
        } else {
            let rejectedStageId = await models.loanStage.findOne({ where: { name: 'bm rating' } })

            await sequelize.transaction(async (t) => {
                await models.customerLoanMaster.update(
                    { applicationFormForBM, goldValuationForBM, loanStatusForBM, commentByBM, loanStageId: rejectedStageId.id, bmId, modifiedBy },
                    { where: { id: masterLoanId }, transaction: t })

                await models.customerLoanHistory.create({ loanId, masterLoanId, action: BM_RATING, modifiedBy }, { transaction: t });
            })
            return res.status(200).json({ message: 'Success' })
        }
    } else {
        let approvedStageId = await models.loanStage.findOne({ where: { name: 'upload documents' } })

        if (applicationFormForBM == false || goldValuationForBM == false) {
            return res.status(400).json({ message: `One of field is not verified` })
        }

        await sequelize.transaction(async (t) => {
            await models.customerLoanMaster.update(
                { applicationFormForBM, goldValuationForBM, loanStatusForBM, commentByBM, loanStageId: approvedStageId.id, bmId, modifiedBy },
                { where: { id: masterLoanId }, transaction: t })

            await models.customerLoanHistory.create({ loanId, masterLoanId, action: BM_RATING, modifiedBy }, { transaction: t });

        })
        return res.status(200).json({ message: 'Success' })
    }
}

//function of loan documents
exports.loanDocuments = async (req, res, next) => {

    let { loanAgreementCopy, pawnCopy, schemeConfirmationCopy, loanId, masterLoanId } = req.body
    let createdBy = req.userData.id;
    let modifiedBy = req.userData.id;

    let checkDocument = await models.customerLoanDocument.findOne({ where: { masterLoanId: masterLoanId } })
    let loanMaster = await models.customerLoanMaster.findOne(
        {
            where: { id: masterLoanId },
            include: [{
                model: models.customerLoanTransfer,
                as: "loanTransfer",
            }]
        })
    if (check.isEmpty(checkDocument)) {
        // remove if condiction
        let loanData = await sequelize.transaction(async t => {
            let stageId = await models.loanStage.findOne({ where: { name: 'OPS team rating' }, transaction: t })

            await models.customerLoanMaster.update({ loanStageId: stageId.id, modifiedBy }, { where: { id: masterLoanId }, transaction: t })

            await models.customerLoanDocument.create({ loanId, masterLoanId, loanAgreementCopy, pawnCopy, schemeConfirmationCopy, createdBy, modifiedBy }, { transaction: t })

            await models.customerLoanHistory.create({ loanId, masterLoanId, action: LOAN_DOCUMENTS, modifiedBy }, { transaction: t });

            // return loan
        })

        return res.status(200).json({ message: 'Success', masterLoanId, loanId })
    } else {
        let loanData = await sequelize.transaction(async t => {

            let stageId = await models.loanStage.findOne({ where: { name: 'OPS team rating' }, transaction: t })

            await models.customerLoanMaster.update({ loanStageId: stageId.id, modifiedBy }, { where: { id: masterLoanId }, transaction: t })


            let x = await models.customerLoanDocument.update({ loanAgreementCopy: loanAgreementCopy, pawnCopy: pawnCopy, schemeConfirmationCopy: schemeConfirmationCopy, modifiedBy: modifiedBy }, { where: { id: checkDocument.id }, transaction: t })

            let y = await models.customerLoanHistory.create({ loanId, masterLoanId, action: LOAN_DOCUMENTS, modifiedBy }, { transaction: t });

            // return loan
        })
        return res.status(200).json({ message: 'Success', masterLoanId, loanId })

    }

}

// FUNCTION FOR OPS TEAM RATING
exports.loanOpsTeamRating = async (req, res, next) => {

    let { loanId, masterLoanId,
        applicationFormForOperatinalTeam, goldValuationForOperatinalTeam, loanStatusForOperatinalTeam, commentByOperatinalTeam } = req.body
    let createdBy = req.userData.id;
    let modifiedBy = req.userData.id;

    let checkAppraiserVerified = await models.customerLoanMaster.findOne({ where: { loanStatusForBM: "approved", id: masterLoanId } })
    if (check.isEmpty(checkAppraiserVerified)) {
        return res.status(400).json({ message: `Bm rating not verified` })
    }
    if (checkAppraiserVerified.loanStatusForOperatinalTeam == "approved" || checkAppraiserVerified.loanStatusForOperatinalTeam == "rejected") {
        return res.status(400).json({ message: `You cannot change status for this customer` })
    }
    let operatinalTeamId = req.userData.id

    if (loanStatusForOperatinalTeam !== "approved") {
        if (loanStatusForOperatinalTeam == 'incomplete') {
            let incompleteStageId = await models.loanStage.findOne({ where: { name: 'appraiser rating' } })
            await sequelize.transaction(async (t) => {
                await models.customerLoanMaster.update(
                    { loanStatusForAppraiser: "pending", loanStatusForBM: "pending", applicationFormForOperatinalTeam, goldValuationForOperatinalTeam, loanStatusForOperatinalTeam, commentByOperatinalTeam, loanStageId: incompleteStageId.id, operatinalTeamId, modifiedBy },
                    { where: { id: masterLoanId }, transaction: t })

                await models.customerLoanHistory.create({ loanId, masterLoanId, action: OPERATIONAL_TEAM_RATING, modifiedBy }, { transaction: t });


            })


            return res.status(200).json({ message: 'Success' })
        } else {
            let rejectedStageId = await models.loanStage.findOne({ where: { name: 'OPS team rating' } })

            await sequelize.transaction(async (t) => {
                await models.customerLoanMaster.update(
                    { applicationFormForOperatinalTeam, goldValuationForOperatinalTeam, loanStatusForOperatinalTeam, commentByOperatinalTeam, loanStageId: rejectedStageId.id, operatinalTeamId, modifiedBy },
                    { where: { id: masterLoanId }, transaction: t })

                await models.customerLoanHistory.create({ loanId, masterLoanId, action: OPERATIONAL_TEAM_RATING, modifiedBy }, { transaction: t });

            })


            return res.status(200).json({ message: 'Success' })
        }
    } else {
        let approvedStageId = await models.loanStage.findOne({ where: { name: 'disbursement pending' } })

        let checkUnsecuredLoan = await models.customerLoan.findOne({ where: { id: loanId, isActive: true } })

        let loanMaster = await models.customerLoanMaster.findOne(
            {
                where: { id: masterLoanId },
                order: [
                    [models.customerLoan, 'id', 'asc']
                ],
                include: [
                    {
                        model: models.customerLoan,
                        as: "customerLoan",
                    },
                    {
                        model: models.customerLoanTransfer,
                        as: "loanTransfer",
                    }
                ]
            })

        if (applicationFormForOperatinalTeam == false || goldValuationForOperatinalTeam == false) {
            return res.status(400).json({ message: `One of field is not verified` });
        }
        await sequelize.transaction(async (t) => {
            // loan transfer changes complete
            if (loanMaster.isNewLoanFromPartRelease == true) {
                let stageIdTransfer = await models.loanStage.findOne({ where: { name: 'check out' }, transaction: t })
                let dateChnage = await disbursementOfLoanTransfer(masterLoanId);

                let loan = await models.customerLoanMaster.findOne({
                    where: { id: masterLoanId },
                    order: [
                        [models.customerLoan, 'id', 'asc']
                    ],
                    // attributes: ['id', 'processingCharge'],
                    include: [
                        {
                            model: models.customerLoan,
                            as: "customerLoan",
                            // attributes: ['id', 'loanUniqueId', 'loanAmount']
                        }
                    ]
                })
                if (loan.isUnsecuredSchemeApplied) {
                    let amount = loan.customerLoan[1].loanAmount;
                    let unsecuredDisbursed = await models.customerTransactionDetail.create({ masterLoanId, loanId: loan.customerLoan[1].id, debit: amount, description: `Loan amount disbursed to customer`, paymentDate: moment() }, { transaction: t })
                    await models.customerTransactionDetail.update({ referenceId: `${loan.customerLoan[1].loanUniqueId}-${unsecuredDisbursed.id}` }, { where: { id: unsecuredDisbursed.id }, transaction: t })

                    // let processingDebit = await models.customerTransactionDetail.create({ masterLoanId, loanId: unsecuredLoanId, debit: loan.processingCharge, description: `Processing charges debit` }, { transaction: t })
                    // await models.customerTransactionDetail.update({ referenceId: `${unsecuredLoanUniqueId}-${processingDebit.id}` }, { where: { id: processingDebit.id }, transaction: t })

                    // let processing = await models.customerTransactionDetail.create({ masterLoanId, loanId: loan.customerLoan[1].id, credit: loan.processingCharge, description: `Processing charges for current loan from the customer` }, { transaction: t })
                    // await models.customerTransactionDetail.update({ referenceId: `${loan.customerLoan[1].loanUniqueId}}-${processing.id}` }, { where: { id: processing.id }, transaction: t })

                    let securedDisbursed = await models.customerTransactionDetail.create({ masterLoanId, loanId: loan.customerLoan[0].id, debit: loan.customerLoan[0].loanAmount, description: `Loan amount disbursed to customer`, paymentDate: moment() }, { transaction: t })
                    await models.customerTransactionDetail.update({ referenceId: `${loan.customerLoan[0].loanUniqueId}-${securedDisbursed.id}` }, { where: { id: securedDisbursed.id }, transaction: t })
                } else {
                    let amount = loan.customerLoan[0].loanAmount - loan.processingCharge;
                    let securedDisbursed = await models.customerTransactionDetail.create({ masterLoanId, loanId: loan.customerLoan[0].id, debit: amount, description: `Loan amount disbursed to customer`, paymentDate: moment() }, { transaction: t })
                    await models.customerTransactionDetail.update({ referenceId: `${loan.customerLoan[0].loanUniqueId}-${securedDisbursed.id}` }, { where: { id: securedDisbursed.id }, transaction: t })

                    // let processingDebit = await models.customerTransactionDetail.create({ masterLoanId, loanId: unsecuredLoanId, debit: loan.processingCharge, description: `Processing charges debit` }, { transaction: t })
                    // await models.customerTransactionDetail.update({ referenceId: `${unsecuredLoanUniqueId}-${processingDebit.id}` }, { where: { id: processingDebit.id }, transaction: t })

                    // let processing = await models.customerTransactionDetail.create({ masterLoanId, loanId: loan.customerLoan[0].id, credit: loan.processingCharge, description: `Processing charges for current loan from the customer` }, { transaction: t })
                    // await models.customerTransactionDetail.update({ referenceId: `${loan.customerLoan[0].loanUniqueId}-${processing.id}` }, { where: { id: processing.id }, transaction: t })
                }

                for (let a = 0; a < dateChnage.securedInterest.length; a++) {
                    let updateDate = dateChnage.securedInterest[a].emiDueDate
                    let emiStartDate = dateChnage.securedInterest[a].emiStartDate
                    let emiEndDate = dateChnage.securedInterest[a].emiEndDate
                    await models.customerLoanInterest.update({ emiDueDate: updateDate, emiStartDate, emiEndDate }, { where: { id: dateChnage.securedInterest[a].id }, transaction: t });
                    await models.customerLoanInitialInterest.update({ emiDueDate: updateDate }, { where: { id: dateChnage.securedInterest[a].id }, transaction: t })
                }
                if (dateChnage.isUnSecured == true) {
                    for (let a = 0; a < dateChnage.unsecuredInterest.length; a++) {
                        let updateDate = dateChnage.unsecuredInterest[a].emiDueDate
                        let emiStartDate = dateChnage.securedInterest[a].emiStartDate
                        let emiEndDate = dateChnage.securedInterest[a].emiEndDate
                        await models.customerLoanInterest.update({ emiDueDate: updateDate, emiStartDate, emiEndDate }, { where: { id: dateChnage.unsecuredInterest[a].id }, transaction: t })
                        await models.customerLoanInitialInterest.update({ emiDueDate: updateDate }, { where: { id: dateChnage.unsecuredInterest[a].id }, transaction: t })
                    }
                }
                let customerLoanId = [];
                for (const loan of loanMaster.customerLoan) {
                    customerLoanId.push(loan.id);
                    if (loanMaster.isLoanTransfer) {
                        await models.customerLoanDisbursement.update({
                            loanId: loan.id, disbursementAmount: loan.loanAmount, transactionId: loanMaster.loanTransfer.transactionId, date: loanMaster.loanTransfer.updatedAt, paymentMode: 'Loan transfer', createdBy: loanMaster.loanTransfer.modifiedBy, modifiedBy: loanMaster.loanTransfer.modifiedBy
                        }, { where: { masterLoanId: masterLoanId }, transaction: t })
                    } else {
                        //////
                        ////Loan
                        let parentDisbursementData = await models.customerLoanDisbursement.findAll({ where: { masterLoanId: loanMaster.parentLoanId }, order: [['id']] })
                        if (loan.loanType == "secured") {
                            await models.customerLoanDisbursement.create({
                                loanId: loan.id, masterLoanId, disbursementAmount: loan.loanAmount, date: moment(), paymentMode: 'Part release', createdBy, modifiedBy, transactionId: parentDisbursementData[0].transactionId, bankTransferType: parentDisbursementData[0].bankTransferType
                            }, { transaction: t })
                        } else {
                            if (parentDisbursementData.length > 1) {
                                await models.customerLoanDisbursement.create({
                                    loanId: loan.id, masterLoanId, disbursementAmount: loan.loanAmount, date: moment(), paymentMode: 'Part release', createdBy, modifiedBy, transactionId: parentDisbursementData[1].transactionId, bankTransferType: parentDisbursementData[1].bankTransferType
                                }, { transaction: t })
                            } else {
                                await models.customerLoanDisbursement.create({
                                    loanId: loan.id, masterLoanId, disbursementAmount: loan.loanAmount, date: moment(), paymentMode: 'Part release', createdBy, modifiedBy, transactionId: parentDisbursementData[0].transactionId
                                }, { transaction: t })
                            }
                        }
                    }

                }

                await models.customerLoan.update({ disbursed: true }, { where: { id: { [Op.in]: customerLoanId } }, transaction: t })
                await models.customerLoanMaster.update({ applicationFormForOperatinalTeam, goldValuationForOperatinalTeam, loanStatusForOperatinalTeam, commentByOperatinalTeam, loanStageId: stageIdTransfer.id, modifiedBy, operatinalTeamId, isLoanSubmitted: true, }, { where: { id: masterLoanId }, transaction: t })
            } else {
                // loan transfer changes complete

                await models.customerLoanMaster.update({ applicationFormForOperatinalTeam, goldValuationForOperatinalTeam, loanStatusForOperatinalTeam, commentByOperatinalTeam, loanStageId: approvedStageId.id, operatinalTeamId, modifiedBy, isLoanSubmitted: true, }, { where: { id: masterLoanId }, transaction: t })

            }

            await models.customerLoanHistory.create({ loanId, masterLoanId, action: OPERATIONAL_TEAM_RATING, modifiedBy }, { transaction: t });

        })
        if (loanMaster.isNewLoanFromPartRelease == true) {
            await intrestCalculationForSelectedLoan(moment(), masterLoanId);
        }
        return res.status(200).json({ message: 'Success' })
    }
}

async function disbursementOfLoanTransfer(masterLoanId) {
    let checkLoan = await models.customerLoanMaster.findOne({
        where: { id: masterLoanId },
        order: [[models.customerLoan, 'id', 'asc']],
        include: [{
            model: models.customerLoan,
            as: 'customerLoan',
        }]
    });
    let securedLoanId;
    let unsecuredLoanId;
    if (checkLoan.isUnsecuredSchemeApplied == true) {
        securedLoanId = checkLoan.customerLoan[0].id;
        unsecuredLoanId = checkLoan.customerLoan[1].id;
    } else {
        securedLoanId = checkLoan.customerLoan[0].id;
    }
    let Loan = await models.customerLoanMaster.findOne({
        where: { id: masterLoanId },
        attributes: ['paymentFrequency', 'processingCharge', 'isUnsecuredSchemeApplied', 'tenure'],
        include: [{
            model: models.customerLoanInterest,
            as: 'customerLoanInterest',
            where: { isActive: true, loanId: securedLoanId }
        }]
    });
    let securedInterest = await getInterestTable(masterLoanId, securedLoanId, Loan);
    let unsecuredInterest;
    let isUnSecured = false;
    if (Loan.isUnsecuredSchemeApplied == true) {
        isUnSecured = true;
        unsecuredInterest = await getInterestTable(masterLoanId, unsecuredLoanId, Loan);
    }
    return { securedInterest, unsecuredInterest, isUnSecured }
}

//FUNCTION for disbursement
exports.disbursementOfLoanBankDetails = async (req, res, next) => {
    let { loanId, masterLoanId } = req.query;
    let createdBy = req.userData.id;
    let userBankDetails = await models.customerLoanBankDetail.findOne({
        where: { masterLoanId: masterLoanId },
        attributes: ['paymentType', 'bankName', 'bankBranchName', 'accountType', 'accountHolderName',
            'accountNumber', 'ifscCode']
    });
    let loanbrokerId = await models.userInternalBranch.findOne({ where: { userId: createdBy } });
    let brokerBankDetails = await models.internalBranch.findOne({
        where: { id: loanbrokerId.internalBranchId },
        attributes: ['bankName', 'bankBranch', 'accountHolderName', 'accountNumber', 'ifscCode']
    });

    let checkLoan = await models.customerLoanMaster.findOne({
        where: { id: masterLoanId },
        order: [[models.customerLoan, 'id', 'asc']],
        include: [{
            model: models.customerLoan,
            as: 'customerLoan',
            include: [{
                model: models.scheme,
                as: 'scheme',
                attributes: ['id', 'schemeName']
            }]
        }, {
            model: models.customerLoanDisbursement,
            as: 'customerLoanDisbursement'
        }, {
            model: models.customerLoanTransfer,
            as: 'loanTransfer',
        }]
    });
    let otherAmountTransactionId = null;
    let getOtherAmountTransactionId = await models.customerLoanDisbursement.findOne({ where: { masterLoanId, isLoanTransferExtraAmountAdded: true } });
    if (getOtherAmountTransactionId) {
        otherAmountTransactionId = getOtherAmountTransactionId.transactionId;
    }
    let securedLoanAmount;
    let unsecuredLoanAmount = 0;
    let securedLoanId;
    let unsecuredLoanId;
    let securedSchemeName;
    let unsecuredSchemeName;
    let bankTransferType = null;
    if (checkLoan.customerLoanDisbursement.length != 0) {
        bankTransferType = checkLoan.customerLoanDisbursement[0].bankTransferType;
    }


    let fullSecuredAmount = Number(checkLoan.securedLoanAmount)
    let fullUnsecuredAmount = 0

    let securedLoanUniqueId = checkLoan.customerLoan[0].loanUniqueId;
    let unsecuredLoanUniqueId;
    if (checkLoan.isUnsecuredSchemeApplied == true) {
        securedLoanId = checkLoan.customerLoan[0].id
        securedSchemeName = checkLoan.customerLoan[0].scheme.schemeName
        securedLoanAmount = Number(checkLoan.securedLoanAmount)

        fullUnsecuredAmount = Number(checkLoan.unsecuredLoanAmount)
        unsecuredLoanId = checkLoan.customerLoan[1].id
        unsecuredSchemeName = checkLoan.customerLoan[1].scheme.schemeName
        unsecuredLoanAmount = Number(checkLoan.unsecuredLoanAmount) - Number(checkLoan.processingCharge)

        unsecuredLoanUniqueId = checkLoan.customerLoan[1].loanUniqueId;

    } else {
        securedLoanId = checkLoan.customerLoan[0].id
        securedSchemeName = checkLoan.customerLoan[0].scheme.schemeName
        securedLoanAmount = Number(checkLoan.securedLoanAmount) - Number(checkLoan.processingCharge);
    }
    let securedTransactionId = null;
    let unsecuredTransactionId = null;
    if (checkLoan.isLoanTransfer) {
        securedTransactionId = checkLoan.loanTransfer.transactionId
        if (checkLoan.isUnsecuredSchemeApplied == true) {
            unsecuredTransactionId = checkLoan.loanTransfer.transactionId
        }
    }

    let data = {
        userBankDetail: userBankDetails,
        branchBankDetail: brokerBankDetails,
        paymentType: userBankDetails.paymentType,
        isUnsecuredSchemeApplied: checkLoan.isUnsecuredSchemeApplied,
        finalLoanAmount: Number(fullSecuredAmount) + Number(fullUnsecuredAmount),
        securedLoanUniqueId: securedLoanUniqueId,
        unsecuredLoanUniqueId: unsecuredLoanUniqueId,
        securedLoanAmount,
        securedLoanId,
        securedSchemeName,
        unsecuredLoanAmount,
        unsecuredLoanId,
        unsecuredSchemeName,
        masterLoanId,
        fullSecuredAmount,
        fullUnsecuredAmount,
        processingCharge: Number(checkLoan.processingCharge),
        bankTransferType,
        loanTransferExtraAmount: checkLoan.loanTransferExtraAmount,
        isLoanTransferExtraAmountAdded: checkLoan.isLoanTransferExtraAmountAdded,
        isLoanTransfer: checkLoan.isLoanTransfer,
    }
    if (checkLoan.isLoanTransfer) {
        data.securedTransactionId = securedTransactionId;
        data.unsecuredTransactionId = unsecuredTransactionId;
        data.otherAmountTransactionId = otherAmountTransactionId;
    }
    return res.status(200).json({ message: 'Success', data: data })

}

//  FUNCTION FOR DISBURSEMENT OF LOAN AMOUNT
exports.disbursementOfLoanAmount = async (req, res, next) => {

    let { masterLoanId, isUnsecuredSchemeApplied, securedLoanUniqueId, unsecuredLoanUniqueId, securedLoanId, unsecuredLoanId, fullSecuredAmount, fullUnsecuredAmount, securedLoanAmount, unsecuredLoanAmount, securedTransactionId, unsecuredTransactionId, date, paymentMode, ifscCode, bankName, bankBranch, accountHolderName, accountNumber, disbursementStatus, otherAmountTransactionId, totalEligibleAmt, bankTransferType } = req.body;
    let createdBy = req.userData.id;
    let modifiedBy = req.userData.id;
    console.log(fullSecuredAmount, fullUnsecuredAmount, isUnsecuredSchemeApplied, securedLoanUniqueId, unsecuredLoanUniqueId)
    let checkIsDisbursed = await models.customerLoanDisbursement.findAll({ where: { masterLoanId: masterLoanId, paymentMode: { [Op.not]: 'Loan transfer' } } });

    if (!check.isEmpty(checkIsDisbursed)) {
        return res.status(400).json({ message: `This loan already disbursed` })
    }

    let loanDetails = await models.customerLoanMaster.findOne({ where: { id: masterLoanId } });
    let matchStageId = await models.loanStage.findOne({ where: { name: 'disbursement pending' } })
    let stageId = await models.loanStage.findOne({ where: { name: 'check out' } })

    let Loan = await models.customerLoanMaster.findOne({
        where: { id: masterLoanId },
        attributes: ['paymentFrequency', 'processingCharge', 'isUnsecuredSchemeApplied', 'tenure', 'isLoanTransfer', 'isLoanTransferExtraAmountAdded', 'loanTransferExtraAmount'],
        include: [{
            model: models.customerLoanInterest,
            as: 'customerLoanInterest',
            where: { isActive: true, loanId: securedLoanId }
        }, {
            model: models.customerLoanTransfer,
            as: "loanTransfer"
        }]
    })

    let processingCharge = Loan.processingCharge

    //for secured interest date change
    let securedInterest = await getInterestTable(masterLoanId, securedLoanId, Loan);

    //for unsecured interest date change
    var unsecuredInterest
    if (Loan.isUnsecuredSchemeApplied == true) {
        unsecuredInterest = await getInterestTable(masterLoanId, unsecuredLoanId, Loan);
    }

    let newStartDate = date
    let newEndDate = securedInterest[securedInterest.length - 1].emiDueDate


    if (loanDetails.loanStageId == matchStageId.id) {

        await sequelize.transaction(async (t) => {
            if (Loan.isLoanTransfer) {
                //this code added in loan transfer
                // let processingDebit = await models.customerTransactionDetail.create({ masterLoanId, loanId: securedLoanId, debit: processingCharge, description: `Processing charges debit`, paymentDate: moment() }, { transaction: t })
                // await models.customerTransactionDetail.update({ referenceId: `${unsecuredLoanUniqueId}-${processingDebit.id}` }, { where: { id: processingDebit.id }, transaction: t })

                // let amountPaid = Loan.loanTransfer.disbursedLoanAmount - processingCharge;
                // let unsecuredDisbursed = await models.customerTransactionDetail.create({ masterLoanId, loanId: securedLoanId, debit: amountPaid, description: `Loan transfer disbursed amount`, paymentDate: moment() }, { transaction: t })
                // await models.customerTransactionDetail.update({ referenceId: `${unsecuredLoanUniqueId}-${unsecuredDisbursed.id}` }, { where: { id: unsecuredDisbursed.id }, transaction: t })
                // await models.customerLoanDisbursement.create({
                //     masterLoanId, loanId: securedLoanId, disbursementAmount: Loan.loanTransfer.disbursedLoanAmount, transactionId: Loan.loanTransfer.transactionId, date: Loan.loanTransfer.updatedAt, paymentMode: 'Loan transfer', createdBy: Loan.loanTransfer.modifiedBy, modifiedBy: Loan.loanTransfer.modifiedBy
                // }, { transaction: t })
                if (Loan.isLoanTransferExtraAmountAdded) {
                    let securedDisbursed = await models.customerTransactionDetail.create({ masterLoanId, loanId: securedLoanId, debit: Loan.loanTransferExtraAmount, description: `Loan transfer extra amount`, paymentDate: moment() }, { transaction: t })
                    await models.customerTransactionDetail.update({ referenceId: `${securedLoanUniqueId}-${securedDisbursed.id}` }, { where: { id: securedDisbursed.id }, transaction: t })

                    await models.customerLoanDisbursement.create({
                        masterLoanId, loanId: securedLoanId, disbursementAmount: Loan.loanTransferExtraAmount, transactionId: otherAmountTransactionId, date, paymentMode, ifscCode, bankName, bankBranch,
                        accountHolderName, accountNumber, disbursementStatus, createdBy, modifiedBy, bankTransferType, isLoanTransferExtraAmountAdded: true
                    }, { transaction: t })
                }
            } else {
                if (isUnsecuredSchemeApplied) {

                    let processingDebit = await models.customerTransactionDetail.create({ masterLoanId, loanId: unsecuredLoanId, debit: processingCharge, description: `Processing charges debit`, paymentDate: moment() }, { transaction: t })
                    await models.customerTransactionDetail.update({ referenceId: `${unsecuredLoanUniqueId}-${processingDebit.id}` }, { where: { id: processingDebit.id }, transaction: t })

                    let amountPaid = fullUnsecuredAmount - processingCharge;
                    let unsecuredDisbursed = await models.customerTransactionDetail.create({ masterLoanId, loanId: unsecuredLoanId, debit: amountPaid, description: `Loan amount disbursed to customer`, paymentDate: moment() }, { transaction: t })
                    await models.customerTransactionDetail.update({ referenceId: `${unsecuredLoanUniqueId}-${unsecuredDisbursed.id}` }, { where: { id: unsecuredDisbursed.id }, transaction: t })

                    let securedDisbursed = await models.customerTransactionDetail.create({ masterLoanId, loanId: securedLoanId, debit: fullSecuredAmount, description: `Loan amount disbursed to customer`, paymentDate: moment() }, { transaction: t })
                    await models.customerTransactionDetail.update({ referenceId: `${securedLoanUniqueId}-${securedDisbursed.id}` }, { where: { id: securedDisbursed.id }, transaction: t })
                } else {

                    let processingDebit = await models.customerTransactionDetail.create({ masterLoanId, loanId: securedLoanId, debit: processingCharge, description: `Processing charges debit`, paymentDate: moment() }, { transaction: t })
                    await models.customerTransactionDetail.update({ referenceId: `${securedLoanUniqueId}-${processingDebit.id}` }, { where: { id: processingDebit.id }, transaction: t })

                    let amountPaid = fullSecuredAmount - processingCharge;
                    let securedDisbursed = await models.customerTransactionDetail.create({ masterLoanId, loanId: securedLoanId, debit: amountPaid, description: `Loan amount disbursed to customer`, paymentDate: moment() }, { transaction: t })
                    await models.customerTransactionDetail.update({ referenceId: `${securedLoanUniqueId}-${securedDisbursed.id}` }, { where: { id: securedDisbursed.id }, transaction: t })


                }
            }

            await models.customerLoanMaster.update({ loanStartDate: newStartDate, loanEndDate: newEndDate, loanStageId: stageId.id }, { where: { id: masterLoanId }, transaction: t })

            //for secured interest date change
            for (let a = 0; a < securedInterest.length; a++) {
                let updateDate = securedInterest[a].emiDueDate
                let emiStartDate = securedInterest[a].emiStartDate
                let emiEndDate = securedInterest[a].emiEndDate
                await models.customerLoanInterest.update({ emiDueDate: updateDate, emiStartDate, emiEndDate }, { where: { id: securedInterest[a].id }, transaction: t })
                await models.customerLoanInitialInterest.update({ emiDueDate: updateDate }, { where: { id: securedInterest[a].id }, transaction: t })
            }
            if (Loan.isLoanTransfer) {
                paymentMode = 'Loan transfer'
            }
            if (Loan.isUnsecuredSchemeApplied == true) {

                //for unsecured interest date change
                for (let a = 0; a < unsecuredInterest.length; a++) {
                    let updateDate = unsecuredInterest[a].emiDueDate
                    let emiStartDate = securedInterest[a].emiStartDate
                    let emiEndDate = securedInterest[a].emiEndDate
                    await models.customerLoanInterest.update({ emiDueDate: updateDate, emiStartDate, emiEndDate }, { where: { id: unsecuredInterest[a].id }, transaction: t })
                    await models.customerLoanInitialInterest.update({ emiDueDate: updateDate }, { where: { id: unsecuredInterest[a].id }, transaction: t })
                }
                if (!Loan.isLoanTransfer) {
                    await models.customerLoanDisbursement.create({
                        masterLoanId, loanId: securedLoanId, disbursementAmount: securedLoanAmount, transactionId: securedTransactionId, date, paymentMode, ifscCode, bankName, bankBranch,
                        accountHolderName, accountNumber, disbursementStatus, createdBy, modifiedBy, bankTransferType
                    }, { transaction: t })

                    await models.customerLoanDisbursement.create({
                        masterLoanId, loanId: unsecuredLoanId, disbursementAmount: unsecuredLoanAmount, transactionId: unsecuredTransactionId, date, paymentMode, ifscCode, bankName, bankBranch,
                        accountHolderName, accountNumber, disbursementStatus, createdBy, modifiedBy, bankTransferType
                    }, { transaction: t })
                }
            } else {
                if (!Loan.isLoanTransfer) {
                    await models.customerLoanDisbursement.create({
                        masterLoanId, loanId: securedLoanId, disbursementAmount: securedLoanAmount, transactionId: securedTransactionId, date, paymentMode, ifscCode, bankName, bankBranch,
                        accountHolderName, accountNumber, disbursementStatus, createdBy, modifiedBy, bankTransferType
                    }, { transaction: t })
                }
            }

            //packet tracking entry
            let packetLocation = await models.packetLocation.findOne({ where: { location: 'amount disbursed' } });

            await models.customerLoanPacketData.create({ masterLoanId: masterLoanId, packetLocationId: packetLocation.id, status: 'in transit' }, { transaction: t });

            await models.customerPacketTracking.create({ masterLoanId, internalBranchId: req.userData.internalBranchId, packetLocationId: packetLocation.id, userSenderId: req.userData.id, userReceiverId: req.userData.id, isDelivered: true, status: 'in transit' }, { transaction: t });

            await models.customerLoanHistory.create({ loanId: securedLoanId, masterLoanId, action: LOAN_DISBURSEMENT, modifiedBy }, { transaction: t });
            if (Loan.isUnsecuredSchemeApplied == true) {
                await models.customerLoanHistory.create({ loanId: unsecuredLoanId, masterLoanId, action: LOAN_DISBURSEMENT, modifiedBy }, { transaction: t });
            }

            let sendLoanMessage = await customerNameNumberLoanId(masterLoanId)

            await sendDisbursalMessage(sendLoanMessage.mobileNumber, sendLoanMessage.customerName, sendLoanMessage.sendLoanUniqueId)

        })
        await intrestCalculationForSelectedLoan(moment(), masterLoanId);
        return res.status(200).json({ message: 'Your loan amount has been disbursed successfully' });
    } else {
        return res.status(404).json({ message: 'Given loan id is not proper' })
    }
}


async function getInterestTable(masterLoanId, loanId, Loan) {

    let startDate = Loan.customerLoanInterest[0].emiDueDate;
    let endDate = Loan.customerLoanInterest[Loan.customerLoanInterest.length - 1].emiDueDate;

    let holidayDate = await models.holidayMaster.findAll({
        attributes: ['holidayDate'],
        where: {
            holidayDate: {
                [Op.between]: [startDate, endDate]
            },
            isActive: true,
        }
    })

    let interestTable = await models.customerLoanInterest.findAll({
        where: { loanId: loanId, isExtraDaysInterest: false },
        order: [['id', 'asc']]
    })

    for (let i = 0; i < interestTable.length; i++) {
         let date;
         let newFrequency;
        if (i == 0) {
            date = new Date()
            newFrequency = Loan.paymentFrequency - 1;
        } else {
            date = new Date(interestTable[interestTable.length - 1].emiDueDate)
            newFrequency = Loan.paymentFrequency;
        }
        let newEmiDueDate = new Date(date.setDate(date.getDate() + (Number(newFrequency))))
        interestTable[i].emiDueDate = moment(newEmiDueDate).format("YYYY-MM-DD")
        interestTable[i].emiEndDate = moment(newEmiDueDate).format("YYYY-MM-DD")

        if (i == 0) {
            console.log(new Date().toISOString(), 'date')
            interestTable[i].emiStartDate = new Date().toISOString()
        }
        else {
            let startDate = new Date(interestTable[i - 1].emiEndDate)
            console.log(startDate, i)
            interestTable[i].emiStartDate = new Date(startDate.setDate(startDate.getDate() + 1))
        }

        if (i == interestTable.length - 1) {
            let newDate = new Date()
            newEmiDueDate = new Date(newDate.setDate(newDate.getDate() + (30 * Loan.tenure)))
            interestTable[i].emiDueDate = moment(newEmiDueDate).format("YYYY-MM-DD")
            interestTable[i].emiEndDate = moment(newEmiDueDate).format("YYYY-MM-DD")
        }
        let x = interestTable.map(ele => ele.emiDueDate)
        console.log(x)

        for (let j = 0; j < holidayDate.length; j++) {
            let momentDate = moment(newEmiDueDate, "DD-MM-YYYY").format('YYYY-MM-DD')
            let sunday = moment(momentDate, 'YYYY-MM-DD').weekday();
            let newDate = new Date(newEmiDueDate);
            if (momentDate == holidayDate[j].holidayDate || sunday == 0) {
                let holidayEmiDueDate = new Date(newDate.setDate(newDate.getDate() + 1))
                interestTable[i].emiDueDate = moment(holidayEmiDueDate).format('YYYY-MM-DD')

                newEmiDueDate = holidayEmiDueDate
                j = 0
            }

        }

        interestTable.loanId = loanId
        interestTable.masterLoanId = masterLoanId
    }
    let y = interestTable.map(ele => ele.emiDueDate)
    console.log(y)
    return interestTable
}

//get single customer loan details DONE
exports.getSingleLoanDetails = async (req, res, next) => {

    let { customerLoanId } = req.query

    let customerLoan = await models.customerLoan.findOne({
        where: { id: customerLoanId },
        order: [
            [models.scheme, 'id', 'asc'],
            [models.scheme, models.schemeInterest, 'days', 'asc'],
            [models.customerLoanInterest, 'id', 'asc'],
            [{ model: models.customerLoan, as: 'unsecuredLoan' }, models.customerLoanInterest, 'id', 'asc']
        ],
        // attributes: { exclude: ['createdAt', 'updatedAt', 'createdBy', 'modifiedBy', 'isActive'] },
        include: [
            {
                model: models.customerLoanMaster,
                as: 'masterLoan',
                include: [{
                    model: models.loanStage,
                    as: 'loanStage',
                    attributes: ['id', 'name']
                },
                {
                    model: models.customerLoanTransfer,
                    as: "loanTransfer",
                    attributes: { exclude: ['createdAt', 'updatedAt', 'createdBy', 'modifiedBy', 'isActive'] },
                }]
            },
            {
                model: models.customerLoanPersonalDetail,
                as: 'loanPersonalDetail',
                // attributes: { exclude: ['createdAt', 'updatedAt', 'createdBy', 'modifiedBy', 'isActive'] }
            },
            {
                model: models.customerLoanBankDetail,
                as: 'loanBankDetail',
                // attributes: { exclude: ['createdAt', 'updatedAt', 'createdBy', 'modifiedBy', 'isActive'] }
            },
            {
                model: models.customerLoanNomineeDetail,
                as: 'loanNomineeDetail',
                // attributes: { exclude: ['createdAt', 'updatedAt', 'createdBy', 'modifiedBy', 'isActive'] }
            },
            {
                model: models.customerLoanOrnamentsDetail,
                as: 'loanOrnamentsDetail',
                include: [
                    {
                        model: models.ornamentType,
                        as: "ornamentType"
                    }
                ]
            },
            {
                model: models.customerLoanInterest,
                as: 'customerLoanInterest',
            },
            {
                model: models.scheme,
                as: 'scheme',
                include: [{
                    model: models.schemeInterest,
                    as: 'schemeInterest',
                    attributes: ['schemeId', 'days']
                }]
            },
            {
                model: models.partner,
                as: 'partner',
                attributes: ['id', 'name']
            },
            {
                model: models.customerLoan,
                as: 'unsecuredLoan',
                include: [{
                    model: models.customerLoanInterest,
                    as: 'customerLoanInterest',
                }, {
                    model: models.scheme,
                    as: 'scheme',
                    include: [{
                        model: models.schemeInterest,
                        as: 'schemeInterest',
                        attributes: ['schemeId', 'days']
                    }]
                }]
            },
            // {
            //     model: models.customerLoanPackageDetails,
            //     as: 'loanPacketDetails',
            //     // attributes: { exclude: ['createdAt', 'updatedAt', 'createdBy', 'modifiedBy', 'isActive'] },
            //     include: [{
            //         model: models.packet,
            //         include: [{
            //             model: models.customerLoanOrnamentsDetail,
            //             include: [{
            //                 model: models.ornamentType,
            //                 as: 'ornamentType'
            //             }]
            //         }]
            //     }]
            // },
            {
                model: models.customer,
                as: 'customer',
                attributes: {
                    exclude: ['createdAt', 'updatedAt', 'createdBy', 'modifiedBy', 'isActive'],
                },
                include: [
                    {
                        model: models.customerKycAddressDetail,
                        as: 'customerKycAddress',
                        attributes: ['id', 'customerKycId', 'customerId', 'addressType', 'address', 'stateId', 'cityId', 'pinCode', 'addressProofTypeId', 'addressProofNumber', 'addressProof'],
                        include: [{
                            model: models.state,
                            as: 'state'
                        }, {
                            model: models.city,
                            as: 'city'
                        }, {
                            model: models.addressProofType,
                            as: 'addressProofType'
                        }],
                    },
                    {
                        model: models.internalBranch,
                        as: 'internalBranch'
                    }
                ]
            },
            {
                model: models.customerLoanInterest,
                as: 'customerLoanInterest',
            }, {
                model: models.customerLoanDocument,
                as: 'customerLoanDocument'
            }]
    });

    let packet = await models.customerLoanPackageDetails.findAll({
        where: { loanId: customerLoanId },
        include: [{
            model: models.packet,
            include: [{
                model: models.customerLoanOrnamentsDetail,
                include: [{
                    model: models.ornamentType,
                    as: 'ornamentType'
                }]
            }]
        }]
    })

    let disbursement = await models.customerLoanDisbursement.findAll({
        where: { masterLoanId: customerLoan.masterLoanId },
        order: [
            ['loanId', 'asc']
        ]
    })


    let partReleaseData;
    if (customerLoan.masterLoan.isNewLoanFromPartRelease) {
        partReleaseData = await models.partRelease.findOne({ where: { newLoanId: customerLoan.masterLoan.id } });
    }
    let newLoanAmount = null;
    if (partReleaseData) {
        newLoanAmount = partReleaseData.newLoanAmount;
    }
    customerLoan.dataValues.newLoanAmount = newLoanAmount

    customerLoan.dataValues.loanPacketDetails = packet
    customerLoan.dataValues.customerLoanDisbursement = disbursement


    for (let index = 0; index < customerLoan.dataValues.customerLoanInterest.length; index++) {
        const element = customerLoan.dataValues.customerLoanInterest
        element[index].dataValues.month = "Month " + ((customerLoan.masterLoan.paymentFrequency / 30) * (index + 1))


        if (Number(customerLoan.masterLoan.paymentFrequency) != 30) {
            if (index == 0) {
                element.month = "Month 1"
            }
            else if (index == customerLoan.dataValues.customerLoanInterest.length - 1) {
                element[index].dataValues.month = "Month " + customerLoan.masterLoan.tenure
            }
        }
    }

    let ornamentType = [];
    if (customerLoan.loanOrnamentsDetail.length != 0) {
        for (let ornamentsDetail of customerLoan.loanOrnamentsDetail) {
            ornamentType.push({ ornamentType: ornamentsDetail.ornamentType.name, id: ornamentsDetail.id })
        }
        customerLoan.dataValues.ornamentType = ornamentType;
    }

    return res.status(200).json({ message: 'Success', data: customerLoan, newLoanAmount })
}

//get function for single loan in CUSTOMER-MANAGMENT
exports.getSingleLoanInCustomerManagment = async (req, res, next) => {
    let { customerLoanId, masterLoanId } = req.query

    let customerLoan = await getSingleLoanDetail(customerLoanId, masterLoanId)

    return res.status(200).json({ message: 'Success', data: customerLoan })
}

//  FUNCTION FOR GET APPLIED LOAN DETAILS
exports.appliedLoanDetails = async (req, res, next) => {
    let { schemeId, appraiserApproval, bmApproval, loanStageId, operatinalTeamApproval } = req.query
    let { search, offset, pageSize } =
        paginationFUNC.paginationWithFromTo(req.query.search, req.query.from, req.query.to);

    let stage = await models.loanStage.findOne({
        where: { name: 'applying' }
    })
    let transfer = await models.loanStage.findOne({
        where: { name: 'loan transfer' }
    })
    let disbursed = await models.loanStage.findOne({
        where: { name: 'disbursed' }
    })
    // let stageId = stage.map(ele => {
    //     if (ele.name != 'applying') {
    //         return ele.id
    //     }
    // })

    // let 
    let query = {};
    // if (schemeId) {
    //     schemeId = req.query.schemeId.split(",");
    //     query["$finalLoan.scheme_id$"] = schemeId;
    // }
    if (appraiserApproval) {
        appraiserApproval = req.query.appraiserApproval.split(",");
        query.loanStatusForAppraiser = appraiserApproval
    }
    if (bmApproval) {
        bmApproval = req.query.bmApproval.split(",");
        query.loanStatusForBM = bmApproval
    }
    if (operatinalTeamApproval) {
        operatinalTeamApproval = req.query.operatinalTeamApproval.split(",");
        query.loanStatusForOperatinalTeam = operatinalTeamApproval
    }
    if (loanStageId) {
        loanStageId = req.query.loanStageId.split(",");
        query.loanStageId = loanStageId;
    }


    let searchQuery = {
        [Op.and]: [query, {
            [Op.or]: {
                "$customer.first_name$": { [Op.iLike]: search + '%' },
                "$customer.last_name$": { [Op.iLike]: search + '%' },
                "$customer.mobile_number$": { [Op.iLike]: search + '%' },
                "$customer.pan_card_number$": { [Op.iLike]: search + '%' },
                "$customer.customer_unique_id$": { [Op.iLike]: search + '%' },
                "$customerLoan.scheme.scheme_name$": { [Op.iLike]: search + '%' },

                appraiser_status: sequelize.where(
                    sequelize.cast(sequelize.col("customerLoanMaster.loan_status_for_appraiser"), "varchar"),
                    {
                        [Op.iLike]: search + "%",
                    }
                ),
                bm_status: sequelize.where(
                    sequelize.cast(sequelize.col("customerLoanMaster.loan_status_for_bm"), "varchar"),
                    {
                        [Op.iLike]: search + "%",
                    }
                ),
                operatinal_team_status: sequelize.where(
                    sequelize.cast(sequelize.col("customerLoanMaster.loan_status_for_operatinal_team"), "varchar"),
                    {
                        [Op.iLike]: search + "%",
                    }
                )
            },
        }],
        loanStageId: { [Op.notIn]: [stage.id, transfer.id, disbursed.id] },
        isLoanCompleted: false,
        isActive: true
    };
    let internalBranchId = req.userData.internalBranchId
    let internalBranchWhere;

    if (!check.isPermissionGive(req.permissionArray, VIEW_ALL_CUSTOMER)) {
        searchQuery.internalBranchId = internalBranchId
    }

    let getPerticularAppraiser;
    if (req.userData.userTypeId == 7) {
        getPerticularAppraiser = { appraiserId: req.userData.id }
    }

    let associateModel = [
        {
            model: models.appraiserRequest,
            as: 'appraiserRequest',
            where: getPerticularAppraiser,
            attributes: ['appraiserId']
        },
        {
            model: models.loanStage,
            as: 'loanStage',
            attributes: ['id', 'name']
        }, {
            model: models.customer,
            as: 'customer',
            // where: internalBranchWhere,
            attributes: ['id', 'firstName', 'lastName', 'panCardNumber', 'customerUniqueId']
        }, {
            model: models.customerLoan,
            as: 'customerLoan',
            where: { isActive: true },
            include: [{
                model: models.scheme,
                as: 'scheme'
            }
                //  {
                //     model: models.customerLoan,
                //     as: 'unsecuredLoan'
                // }
            ]
        }]

    let appliedLoanDetails = await models.customerLoanMaster.findAll({
        where: searchQuery,
        subQuery: false,
        include: associateModel,
        order: [
            [["updatedAt", "desc"]],
            [models.customerLoan, "id", "asc"],

        ],
        // attributes: ['id', 'loanStatusForAppraiser', 'loanStatusForBM', 'loanStatusForOperatinalTeam', 'loanStartDate', 'securedLoanAmount', 'unsecuredLoanAmount', 'finalLoanAmount', 'loanStageId', 'isLoanCompleted', 'isLoanSubmitted', 'commentByAppraiser', 'commentByBM', 'commentByOperatinalTeam'],
        offset: offset,
        limit: pageSize,

    });
    let count = await models.customerLoanMaster.findAll({
        where: searchQuery,
        subQuery: false,
        include: associateModel,
    });

    if (appliedLoanDetails.length === 0) {
        return res.status(200).json({ data: [] });
    } else {
        return res.status(200).json({ message: 'Applied loan details fetch successfully', appliedLoanDetails, count: count.length });
    }
}

//  FUNCTION FOR GET LOAN DETAILS
exports.getLoanDetails = async (req, res, next) => {
    let { search, offset, pageSize } =
        paginationFUNC.paginationWithFromTo(req.query.search, req.query.from, req.query.to);

    let stageId = await models.loanStage.findOne({ where: { name: 'disbursed' } })
    let query = {}
    let searchQuery = {
        [Op.and]: [query, {
            [Op.or]: {
                "$customer.first_name$": { [Op.iLike]: search + '%' },
                "$customer.last_name$": { [Op.iLike]: search + '%' },
                "$customer.mobile_number$": { [Op.iLike]: search + '%' },
                "$customer.pan_card_number$": { [Op.iLike]: search + '%' },
                "$customer.customer_unique_id$": { [Op.iLike]: search + '%' },
                // "$customerLoanMaster.final_loan_amount$": { [Op.iLike]: search + '%' },
                "$customerLoan.loan_unique_id$": { [Op.iLike]: search + '%' },
                "$customerLoan.scheme.scheme_name$": { [Op.iLike]: search + '%' },
                finalLoanAmount: sequelize.where(
                    sequelize.cast(sequelize.col("customerLoanMaster.final_loan_amount"), "varchar"),
                    {
                        [Op.iLike]: search + "%",
                    }
                ),
                tenure: sequelize.where(
                    sequelize.cast(sequelize.col("customerLoanMaster.tenure"), "varchar"),
                    {
                        [Op.iLike]: search + "%",
                    }
                ),
                interestRate: sequelize.where(
                    sequelize.cast(sequelize.col("customerLoan.interest_rate"), "varchar"),
                    {
                        [Op.iLike]: search + "%",
                    }
                )
            },
        }],
        isActive: true,
        // loanStageId: stageId.id
        isLoanCompleted: true
    };
    let internalBranchId = req.userData.internalBranchId
    let internalBranchWhere;

    if (!check.isPermissionGive(req.permissionArray, VIEW_ALL_CUSTOMER)) {
        searchQuery.internalBranchId = internalBranchId
    }

    let associateModel = [
        {
            model: models.customerLoan,
            as: 'customerLoan',
            include: [{
                model: models.scheme,
                as: 'scheme',
                attributes: ['id', 'schemeName']

            }]
        },
        {
            model: models.customer,
            as: 'customer',
            // where: internalBranchWhere,
            attributes: {
                exclude: ['mobileNumber', 'createdAt', 'updatedAt', 'createdBy', 'modifiedBy', 'isActive'],
            },
            include: [{
                model: models.internalBranch,
                as: 'internalBranch'
            }]
        },
        {
            model: models.partRelease,
            as: 'partRelease',
            attributes: ['amountStatus', 'partReleaseStatus']
        },
        {
            model: models.fullRelease,
            as: 'fullRelease',
            attributes: ['amountStatus', 'fullReleaseStatus']
        },
        {
            model: models.customerLoanPackageDetails,
            as: 'loanPacketDetails',
            // include: [{
            //     model: models.packet,
            // }]
        }
    ]

    let loanDetails = await models.customerLoanMaster.findAll({
        where: searchQuery,
        subQuery: false,
        include: associateModel,
        order: [
            ["updatedAt", "DESC"],
            [models.customerLoan, 'id', 'asc'],
        ],
        offset: offset,
        limit: pageSize
    });
    let count = await models.customerLoanMaster.findAll({
        where: searchQuery,
        subQuery: false,
        include: associateModel,
    });
    if (loanDetails.length === 0) {
        return res.status(200).json({ data: [] });
    } else {
        return res.status(200).json({ message: 'Loan details fetch successfully', data: loanDetails, count: count.length });
    }
}

//FUNCTION FOR PRINT DETAILS
exports.getDetailsForPrint = async (req, res, next) => {
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
                }, {
                    model: models.customerLoanSlabRate,
                    as: 'slab'
                }

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
            // [models.customerLoan,models.customerLoanSlabRate, 'id', 'asc'],
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
        var html = fs.readFileSync("./templates/pawnTicket-secure-unsecure-template.html", 'utf8');
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
            interestRate: customerLoanDetail.customerLoan[1].slab[customerLoanDetail.customerLoan[1].slab.length - 1].interestRate,
            processingFee: customerLoanDetail.processingCharge,
            branch: customerLoanDetail.internalBranch.name,
            aadhaarNumber: customerLoanDetail.customer.customerKycPersonal.identityProofNumber
        }]
        //console.log(customerUnsecureLoanData,'unsecure')
    } else {
        var html = fs.readFileSync("./templates/pawnTicket-secure-template.html", 'utf8');
    }
    var options = {
        format: "A4",
        orientation: "portrait",
        border: "5mm",
        "header": {
            "height": "2mm",
        },
        "footer": {
            "height": "2mm",
        },
        "height": "11.69in",
        "width": "8.27in"
    }


    var customerSecureLoanData = await [{
        partnerName: customerLoanDetail.customerLoan[0].partner.name,
        Name: customerLoanDetail.customer.firstName + " " + customerLoanDetail.customer.lastName,
        dob: dateOfBirth,
        contactNumber: customerLoanDetail.customer.mobileNumber,
        nomineeDetails: `${customerLoanDetail.loanNomineeDetail[0].nomineeName}, ${customerLoanDetail.loanNomineeDetail[0].nomineeAge}, ${customerLoanDetail.loanNomineeDetail[0].relationship}`,
        startDate: customerLoanDetail.loanStartDate,
        customerAddress: `${customerLoanDetail.customerAddress[0].address},${customerLoanDetail.customerAddress[0].pinCode},${customerLoanDetail.customerAddress[0].state},${customerLoanDetail.customerAddress[0].city}`,
        interestRate: customerLoanDetail.customerLoan[0].slab[customerLoanDetail.customerLoan[0].slab.length - 1].interestRate,
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

    let fileName = await `AcknowledgeOFPledge${Date.now()}`;
    document = await {
        html: html,
        data: {
            bootstrapCss: `${process.env.URL}/bootstrap.css`,
            jqueryJs: `${process.env.URL}/jquery-slim.min.js`,
            popperJs: `${process.env.URL}/popper.min.js`,
            bootstrapJs: `${process.env.URL}/bootstrap.js`,
            imagePath: `${process.env.URL}/images/augmont_logo.png`,
            imgPath: `${process.env.URL}/images/Finkurve_logo.png`,
            customerLoanDetail: customerSecureLoanData,
            customerUnsecureLoanDetail: customerUnsecureLoanData
        },
        path: `./public/uploads/pdf/${fileName}.pdf`
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


exports.getLoanOrnaments = async (req, res, next) => {
    let { masterLoanId } = req.query;

    let getLoanOrnaments = await models.customerLoanOrnamentsDetail.findAll({
        where: { masterLoanId },
        attributes: ['id'],
        include: [
            {
                model: models.ornamentType,
                as: "ornamentType"
            }
        ]
    })

    return res.status(200).json({ data: getLoanOrnaments })
}

exports.getBankInfo = async (req, res, next) => {
    let { masterLoanId, modeOfPayment, type } = req.query;
    let loan = await models.customerLoanMaster.findOne({
        where: { isActive: true, id: masterLoanId },
        order: [
            [models.customerLoan, 'id', 'asc']
        ],
        include: [{
            model: models.customerLoan,
            as: 'customerLoan',
            where: { isActive: true },

        },
        {
            model: models.customer,
            as: 'customer'
        }, {
            model: models.customerLoanBankDetail,
            as: 'loanBankDetail'

        }, {
            model: models.internalBranch,
            as: 'internalBranch'
        }]
    });
    let customerAccountNumber = loan.loanBankDetail.accountNumber
    // if (modeOfPayment == 'bank') {
    //     customerAccountNumber = loan.loanBankDetail.accountNumber
    // } else if (modeOfPayment == 'cash') {
    //     customerAccountNumber = loan.internalBranch.accountNumber
    // } else {
    //     return res.status(404).json({ message: 'Invalid payment mode' })
    // }
    // Require library
    let customerName = loan.customer.firstName + ' ' + loan.customer.lastName
    let date = moment().format('DD-MM-YYYY')
    // Create a new instance of a Workbook class
    var wb = new xl.Workbook();

    // Add Worksheets to the workbook
    var ws = wb.addWorksheet('Sheet 1');

    // Create a reusable style
    var style = wb.createStyle({
        font: {
            color: '#000000',
            size: 8,
        },
        numberFormat: '$#,##0.00; ($#,##0.00); -',
    });
    if (type == 'NEFT') {
        ws.cell(1, 1).string('Mode of Payment').style(style);
        ws.cell(1, 2).string('Withdrawal Amount').style(style);
        ws.cell(1, 3).string('Payment Date').style(style);
        ws.cell(1, 4).string('Customer Name').style(style);
        ws.cell(1, 5).string('CustomerAccount Number').style(style);
        ws.cell(1, 6).string('Blank').style(style);
        ws.cell(1, 7).string('Blank').style(style);
        ws.cell(1, 8).string('Company Account Number').style(style);
        ws.cell(1, 9).string('Withdrawal ID').style(style);
        ws.cell(1, 10).string('Bank IFSC Code').style(style);
        ws.cell(1, 11).string('Filled in 11').style(style);

        ws.cell(2, 1).string('N').style(style);
        ws.cell(2, 2).string(loan.customerLoan[0].loanAmount).style(style);
        ws.cell(2, 3).string(date).style(style);
        ws.cell(2, 4).string(customerName).style(style);
        ws.cell(2, 5).string(customerAccountNumber).style(style);

        ws.cell(2, 8).string('920020032503725').style(style);
        ws.cell(2, 9).string(loan.customerLoan[0].loanUniqueId).style(style);
        ws.cell(2, 10).string('UTIB0001705').style(style);
        ws.cell(2, 11).string('11').style(style);

        if (loan.customerLoan.length > 1) {
            ws.cell(3, 1).string('N').style(style);
            ws.cell(3, 2).string(loan.customerLoan[1].loanAmount).style(style);
            ws.cell(3, 3).string(date).style(style);
            ws.cell(3, 4).string(customerName).style(style);
            ws.cell(3, 5).string(customerAccountNumber).style(style);

            ws.cell(3, 8).string('920020032503725').style(style);
            ws.cell(3, 9).string(loan.customerLoan[1].loanUniqueId).style(style);
            ws.cell(3, 10).string('UTIB0001705').style(style);
            ws.cell(3, 11).string('11').style(style);
        }
    }
    if (type == 'IMPS') {

        ws.cell(1, 1).string('Mode of Payment').style(style);
        ws.cell(1, 2).string('Withdrawal Amount').style(style);
        ws.cell(1, 3).string('Customer Name').style(style);
        ws.cell(1, 4).string('Blank').style(style);
        ws.cell(1, 5).string('Blank').style(style);
        ws.cell(1, 6).string('Blank').style(style);
        ws.cell(1, 7).string('Blank').style(style);
        ws.cell(1, 8).string('Blank').style(style);
        ws.cell(1, 9).string('Blank').style(style);
        ws.cell(1, 10).string('CustomerAccount Number').style(style);
        ws.cell(1, 11).string('Blank').style(style);
        ws.cell(1, 12).string('Blank').style(style);
        ws.cell(1, 13).string('Company Account Number').style(style);
        ws.cell(1, 14).string('Withdrawal ID').style(style);
        ws.cell(1, 15).string('Bank IFSC Code').style(style);
        ws.cell(1, 16).string('Filled in 11').style(style);
        ws.cell(1, 17).string('Blank').style(style);
        ws.cell(1, 18).string('Blank').style(style);
        ws.cell(1, 19).string('Blank').style(style);
        ws.cell(1, 20).string('Blank').style(style);
        ws.cell(1, 21).string('Blank').style(style);
        ws.cell(1, 22).string('Filled in 11').style(style);


        ws.cell(2, 1).string('IMPS').style(style);
        ws.cell(2, 2).string(loan.customerLoan[0].loanAmount).style(style);
        ws.cell(2, 3).string(customerName).style(style);
        ws.cell(2, 10).string(customerAccountNumber).style(style);

        ws.cell(2, 13).string('920020032503725').style(style);
        ws.cell(2, 14).string(loan.customerLoan[0].loanUniqueId).style(style);
        ws.cell(2, 15).string('UTIB0001705').style(style);
        ws.cell(2, 16).string('11').style(style);
        ws.cell(2, 22).string('11').style(style);

        if (loan.customerLoan.length > 1) {
            ws.cell(3, 1).string('IMPS').style(style);
            ws.cell(3, 2).string(loan.customerLoan[1].loanAmount).style(style);
            ws.cell(3, 3).string(customerName).style(style);
            ws.cell(3, 10).string(customerAccountNumber).style(style);

            ws.cell(3, 13).string('920020032503725').style(style);
            ws.cell(3, 14).string(loan.customerLoan[1].loanUniqueId).style(style);
            ws.cell(3, 15).string('UTIB0001705').style(style);
            ws.cell(3, 16).string('11').style(style);
            ws.cell(3, 22).string('11').style(style);
        }
    }

    if (type == 'RTGS') {
        ws.cell(1, 1).string('Mode of Payment').style(style);
        ws.cell(1, 2).string('Amount').style(style);
        ws.cell(1, 3).string('Date').style(style);
        ws.cell(1, 4).string('Customer Name').style(style);
        ws.cell(1, 5).string('Customer Bank Account Number').style(style);
        ws.cell(1, 6).string('Blank').style(style);
        ws.cell(1, 7).string('Blank').style(style);
        ws.cell(1, 8).string('Debited Account Number').style(style);
        ws.cell(1, 9).string('Loan Number Should be unique').style(style);
        ws.cell(1, 10).string('IFSC Code').style(style);
        ws.cell(1, 11).string('Filled in 11').style(style);

        ws.cell(2, 1).string('R').style(style);
        ws.cell(2, 2).string(loan.customerLoan[0].loanAmount).style(style);
        ws.cell(2, 3).string(date).style(style);
        ws.cell(2, 4).string(customerName).style(style);
        ws.cell(2, 5).string(customerAccountNumber).style(style);

        ws.cell(2, 8).string('920020032503725').style(style);
        ws.cell(2, 9).string(loan.customerLoan[0].loanUniqueId).style(style);
        ws.cell(2, 10).string('UTIB0001705').style(style);
        ws.cell(2, 11).string('11').style(style);

        if (loan.customerLoan.length > 1) {
            ws.cell(3, 1).string('R').style(style);
            ws.cell(3, 2).string(loan.customerLoan[1].loanAmount).style(style);
            ws.cell(3, 3).string(date).style(style);
            ws.cell(3, 4).string(customerName).style(style);
            ws.cell(3, 5).string(customerAccountNumber).style(style);

            ws.cell(3, 8).string('920020032503725').style(style);
            ws.cell(3, 9).string(loan.customerLoan[1].loanUniqueId).style(style);
            ws.cell(3, 10).string('UTIB0001705').style(style);
            ws.cell(3, 11).string('11').style(style);
        }
    }

    return wb.write(`${Date.now()}.xlsx`, res)
}

exports.termsConditions = async (req, res, next) => {
    let { masterLoanId, termsConditions } = req.body;

    await models.customerLoanMaster.update({ termsAndCondition: termsConditions }, { where: { id: masterLoanId } })

    return res.status(200).json({ message: 'Success' })
}

exports.getCustomerBankDetails = async (req, res, next) => {
    let masterLoanId = req.query.masterLoanId;
    let loanData = await models.customerLoanMaster.findOne({
        where: { id: masterLoanId },
        attributes: ['id', 'customerId']
    });
    let customerId;
    if (loanData) {
        customerId = loanData.customerId;
        let loanDetails = await models.customerLoanMaster.findOne({
            attributes: ['id'],
            where: {
                isLoanCompleted: true,
                customerId,
                "$loanBankDetail.payment_type$": { [Op.not]: 'cash' }
            },
            include: [{
                model: models.customerLoanBankDetail,
                as: 'loanBankDetail',
            }],
        });
        if (loanDetails) {
            return res.status(200).json({ data: loanDetails })
        } else {
            return res.status(404).json({ message: "Data not found" })
        }
    } else {
        return res.status(404).json({ message: "Data not found" })
    }

}


exports.getCustomerBankDetailsByCustomerId = async (req, res, next) => {
    let customerId = req.query.customerId;
    let loanDetails = await models.customerLoanMaster.findOne({
        attributes: ['id'],
        where: {
            isLoanCompleted: true,
            customerId,
            "$loanBankDetail.payment_type$": { [Op.not]: 'cash' }
        },
        include: [{
            model: models.customerLoanBankDetail,
            as: 'loanBankDetail',
        }],
    });
    if (loanDetails) {
        return res.status(200).json({ data: loanDetails })
    } else {
        return res.status(404).json({ message: "Data not found" })
    }

}