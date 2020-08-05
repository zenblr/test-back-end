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
    let disbursedPendingId = await models.loanStage.findOne({ where: { name: 'disbursement pending' } })
    let bmRatingId = await models.loanStage.findOne({ where: { name: 'bm rating' } })
    let opsRatingId = await models.loanStage.findOne({ where: { name: 'OPS team rating' } })


    let customerLoanStage = await models.customerLoanMaster.findOne({
        where: { customerId: customerData.id, isLoanSubmitted: false, isLoanTransfer: false },
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
        let loanId = await models.customerLoan.findOne({ where: { masterLoanId: customerLoanStage.id, loanType: 'secured' } })
        if (customerCurrentStage == '2') {
            return res.status(200).json({ message: 'success', loanId: loanId.id, masterLoanId: customerLoanStage.id, loanCurrentStage: customerCurrentStage })
        } else if (customerCurrentStage == '3') {
            return res.status(200).json({ message: 'success', loanId: loanId.id, masterLoanId: customerLoanStage.id, loanCurrentStage: customerCurrentStage })
        } else if (customerCurrentStage == '4') {
            return res.status(200).json({ message: 'success', loanId: loanId.id, masterLoanId: customerLoanStage.id, loanCurrentStage: customerCurrentStage, totalEligibleAmt: customerLoanStage.totalEligibleAmt })
        } else if (customerCurrentStage == '5') {
            return res.status(200).json({ message: 'success', loanId: loanId.id, masterLoanId: customerLoanStage.id, loanCurrentStage: customerCurrentStage, finalLoanAmount: customerLoanStage.finalLoanAmount, firstName, lastName })
        } else if (customerCurrentStage == '6') {
            return res.status(200).json({ message: 'success', masterLoanId: customerLoanStage.id, loanId: loanId.id, loanCurrentStage: customerCurrentStage })
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

    let { customerId, customerUniqueId, kycStatus, startDate, purpose, masterLoanId, partReleaseId } = req.body
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
            return res.status(200).json({ message: 'success', loanstage: stageId, loanId: loanId.id, masterLoanId: customerLoanMaster.id, loanCurrentStage: '2' })
        }
    }

    let loanData = await sequelize.transaction(async t => {

        let masterLoan = await models.customerLoanMaster.create({ customerId: customerId, loanStageId: stageId.id, customerLoanCurrentStage: '2', internalBranchId: req.userData.internalBranchId, createdBy, modifiedBy }, { transaction: t })

        let loan = await models.customerLoan.create({ customerId, masterLoanId: masterLoan.id, loanType: 'secured', createdBy, modifiedBy }, { transaction: t })

        await models.customerLoanHistory.create({ loanId: loan.id, masterLoanId: masterLoan.id, action: BASIC_DETAILS_SUBMIT, modifiedBy }, { transaction: t });

        await models.customerLoanPersonalDetail.create({ loanId: loan.id, masterLoanId: masterLoan.id, customerUniqueId, startDate, purpose, kycStatus, createdBy, modifiedBy }, { transaction: t });

        if (partReleaseId) {
            await models.partRelease.update({ isLoanCreated: true, newLoanId: masterLoan.id }, { where: { id: partReleaseId }, transaction: t });
        }
        return loan
    })

    return res.status(200).json({ message: 'success', loanstage: stageId, loanId: loanData.id, masterLoanId: loanData.masterLoanId, loanCurrentStage: '2' })

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
        return res.status(200).json({ message: 'success', masterLoanId, loanId, loanCurrentStage: '3' })
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
        return res.status(200).json({ message: 'success', masterLoanId, loanId, loanCurrentStage: '3' })

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
            attributes: ['disbursedLoanAmount', 'outstandingLoanAmount']
        }]
    })
    let checkOrnaments = await models.customerLoanOrnamentsDetail.findAll({ where: { masterLoanId: masterLoanId } })
    if (checkOrnaments.length == 0) {
        let loanData = await sequelize.transaction(async t => {
            await models.customerLoanMaster.update({ customerLoanCurrentStage: '4', modifiedBy, fullAmount, totalEligibleAmt }, { where: { id: masterLoanId }, transaction: t })

            let createdOrnaments = await models.customerLoanOrnamentsDetail.bulkCreate(allOrnmanets, { transaction: t });

            await models.customerLoanHistory.create({ loanId, masterLoanId, action: ORNAMENTES_DETAILS, modifiedBy }, { transaction: t });

            return createdOrnaments
        })
        return res.status(200).json({ message: 'success', loanId, masterLoanId, loanCurrentStage: '4', totalEligibleAmt, ornaments: loanData, loanTransferData })
    } else {

        let loanSubmitted = await models.customerLoanMaster.findOne({ where: { id: masterLoanId } })
        let loanData = await sequelize.transaction(async t => {
            if (loanSubmitted.isLoanSubmitted == false) {
                await models.customerLoanMaster.update({ customerLoanCurrentStage: '4', modifiedBy, totalEligibleAmt, fullAmount }, { where: { id: masterLoanId }, transaction: t })
            }

            await models.customerLoanHistory.create({ loanId, masterLoanId, action: ORNAMENTES_DETAILS, modifiedBy }, { transaction: t });

            await models.customerLoanOrnamentsDetail.destroy({ where: { masterLoanId: masterLoanId }, transaction: t });
            // let createdOrnaments = await models.customerLoanOrnamentsDetail.bulkCreate(allOrnmanets, { transaction: t });

            let createdOrnaments = []
            for (let purityTestData of allOrnmanets) {
                delete purityTestData.id;
                var ornaments = await models.customerLoanOrnamentsDetail.create(purityTestData, { transaction: t });
                createdOrnaments.push(ornaments)
            }
            return createdOrnaments
        })
        return res.status(200).json({ message: 'success', loanId, masterLoanId, loanCurrentStage: '4', totalEligibleAmt, ornaments: loanData, loanTransferData })
    }

}

// amount validation and check its a secured scheme aur unsecured scheme
exports.checkForLoanType = async (req, res, next) => {
    let { loanAmount, securedSchemeId, fullAmount, partnerId } = req.body
    let processingCharge = 0;
    let unsecuredScheme

    let securedScheme = await models.scheme.findOne({
        where: { id: securedSchemeId },
        // attributes: ['id'],
        order: [
            [models.schemeInterest, 'days', 'asc']
        ],
        include: [{
            model: models.schemeInterest,
            as: 'schemeInterest',
            attributes: ['days', 'interestRate']
        }]
    })

    if (securedScheme.isSplitAtBeginning) {

        fullAmount = loanAmount       //During split at the beginning consider loan amount as full amount 
    }

    let secureSchemeMaximumAmtAllowed = (securedScheme.maximumPercentageAllowed / 100)

    let securedLoanAmount = Math.round(fullAmount * secureSchemeMaximumAmtAllowed)


    if (loanAmount > securedLoanAmount) {
        var unsecuredAmount = Math.round(loanAmount - securedLoanAmount)

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
                            schemeAmountStart: { [Op.lte]: unsecuredAmount },
                            schemeAmountEnd: { [Op.gte]: unsecuredAmount },
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
        let unsecured = unsecuredScheme.schemes
        var unsecuredSchemeApplied;

        var defaultUnsecuredScheme = unsecuredScheme.schemes.filter(scheme => { return scheme.default })
        let defaultFind = await selectScheme(defaultUnsecuredScheme, securedScheme)

        if (!check.isEmpty(defaultFind)) {
            unsecuredSchemeApplied = defaultFind[0]
        } else {
            let checkScheme = await selectScheme(unsecured, securedScheme)
            unsecuredSchemeApplied = checkScheme[0]
        }


        if (unsecuredSchemeApplied && (securedScheme.isSplitAtBeginning ||
            Number(loanAmount) <= Math.round(fullAmount * (securedLoanAmount + (unsecuredSchemeApplied.maximumPercentageAllowed / 100))))) {

            processingCharge = await processingChargeSecuredScheme(securedLoanAmount, securedScheme, unsecuredSchemeApplied, unsecuredAmount)

            return res.status(200).json({ data: { unsecuredScheme, unsecuredAmount, securedLoanAmount, processingCharge, unsecuredSchemeApplied, securedScheme,isUnsecuredSchemeApplied:true } })

        } else {
            return res.status(400).json({ message: "No Unsecured Scheme Availabe" })
        }
    }
    else {

        processingCharge = await processingChargeSecuredScheme(loanAmount, securedScheme, undefined, undefined)
        return res.status(200).json({ data: { securedScheme, processingCharge,isUnsecuredSchemeApplied:false } })

    }
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
    let { securedLoanAmount, interestRate, unsecuredLoanAmount, unsecuredInterestRate, paymentFrequency, isUnsecuredSchemeApplied, tenure, unsecuredSchemeId, schemeId } = req.body
    let interestTable = []
    let totalInterestAmount = 0;

    // secure interest calculation
    let securedInterestAmount = await interestCalcultaion(securedLoanAmount, interestRate, paymentFrequency)
    let securedScheme = await models.scheme.findOne({
        where: { id: schemeId }
    })


    // unsecure interest calculation
    if (isUnsecuredSchemeApplied) {
        var unsecuredInterestAmount = await interestCalcultaion(unsecuredLoanAmount, unsecuredInterestRate, paymentFrequency)
        var unsecuredScheme = await models.scheme.findOne({
            where: { id: unsecuredSchemeId }
        })
    
    }

    // generate Table
    let length = (tenure * 30) / paymentFrequency
    console.log(length)
    for (let index = 0; index < Number(length); index++) {
        let date = new Date()
        let data = {
            emiDueDate: moment(new Date(date.setDate(date.getDate() + (paymentFrequency * (index + 1)))), "DD-MM-YYYY").format('YYYY-MM-DD'),
            paymentType: paymentFrequency,
            securedInterestAmount: securedInterestAmount,
            unsecuredInterestAmount: unsecuredInterestAmount,
            totalAmount: Number(securedInterestAmount) + Number(unsecuredInterestAmount)
        }
        interestTable.push(data)
    }

    if (!Number.isInteger(length)) {
        const lastElementOfTable = interestTable[interestTable.length - 1]
        let secure = (securedInterestAmount / Math.ceil(length)).toFixed(2)
        lastElementOfTable.securedInterestAmount = secure

        if (isUnsecuredSchemeApplied) {
            let unsecure = (unsecuredInterestAmount / Math.ceil(length)).toFixed(2)
            lastElementOfTable.unsecuredInterestAmount = unsecure
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

    return res.status(200).json({ data: { interestTable, totalInterestAmount, securedScheme,unsecuredScheme } })
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
            paymentType: paymentFrequency,
            unsecuredInterestAmount: unsecuredInterestAmount,
        }
        interestTable.push(data)
    }

    if (!Number.isInteger(length)) {
        const lastElementOfTable = interestTable[interestTable.length - 1]

        let unsecure = (unsecuredInterestAmount / Math.ceil(length)).toFixed(2)
        lastElementOfTable.unsecuredInterestAmount = unsecure


    }

    return res.status(200).json({ data: { interestTable } })

}


// interest calculation
async function interestCalcultaion(amount, interestRate, paymentFrequency) {
    let interest = ((Number(amount) * (Number(interestRate) * 12 / 100)) * Number(paymentFrequency)
        / 360).toFixed(2)
    return interest
}

//FUNCTION for final loan calculator
exports.loanFinalLoan = async (req, res, next) => {
    let { loanFinalCalculator, loanId, masterLoanId, interestTable } = req.body
    let { partnerId, schemeId, finalLoanAmount, loanStartDate, tenure, loanEndDate, paymentFrequency, processingCharge, interestRate, unsecuredInterestRate, unsecuredSchemeId, securedLoanAmount, unsecuredLoanAmount, totalFinalInterestAmt, isUnsecuredSchemeApplied } = loanFinalCalculator

    let createdBy = req.userData.id;
    let modifiedBy = req.userData.id;
    // unsecuredLoanId
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

    let checkFinalLoan = await models.customerLoanMaster.findOne({
        where: { id: masterLoanId },
        include: [{
            model: models.customer,
            as: 'customer'
        }]
    })

    //get slab rate
    let securedSlab = await getSchemeSlab(schemeId, loanId)

    const firstName = checkFinalLoan.customer.firstName
    const lastName = checkFinalLoan.customer.lastName

    if (check.isEmpty(checkFinalLoan.finalLoanAmount)) {
        let loanData = await sequelize.transaction(async t => {

            await models.customerLoanInterest.bulkCreate(interestData, { transaction: t });
            await models.customerLoanInitialInterest.bulkCreate(interestData, { transaction: t });

            await models.customerLoanSlabRate.bulkCreate(securedSlab, { transaction: t })

            if (isUnsecuredSchemeApplied == true) {
                await models.customerLoanMaster.update({ customerLoanCurrentStage: '5', totalFinalInterestAmt, finalLoanAmount, outstandingAmount: finalLoanAmount, securedLoanAmount, unsecuredLoanAmount, tenure, loanStartDate, loanEndDate, paymentFrequency, processingCharge, isUnsecuredSchemeApplied }, { where: { id: masterLoanId }, transaction: t })

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
                await models.customerLoanMaster.update({ customerLoanCurrentStage: '5', totalFinalInterestAmt, finalLoanAmount, outstandingAmount: finalLoanAmount, securedLoanAmount, unsecuredLoanAmount, tenure, loanStartDate, loanEndDate, paymentFrequency, processingCharge, isUnsecuredSchemeApplied }, { where: { id: masterLoanId }, transaction: t })

                await models.customerLoan.update({ partnerId, schemeId, loanAmount: securedLoanAmount, outstandingAmount: securedLoanAmount, interestRate, createdBy, modifiedBy }, { where: { id: loanId }, transaction: t })

                await models.customerLoanHistory.create({ loanId, masterLoanId, action: FINAL_INTEREST_LOAN, modifiedBy }, { transaction: t });

            }

        })
        return res.status(200).json({ message: 'success', loanId: loanId, loanCurrentStage: '5', finalLoanAmount, firstName, lastName })
    } else {

        let loanSubmitted = await models.customerLoanMaster.findOne({ where: { id: masterLoanId } })
        let getUnsecuredLoanId = await models.customerLoan.findOne({ where: { id: loanId } });



        let loanData = await sequelize.transaction(async t => {

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
                    unsecuredInterestData.push(interestTable[i])
                }

                unsecuredSlab = await getSchemeSlab(unsecuredSchemeId, getUnsecuredLoanId.unsecuredLoanId)
            }

            if (isUnsecuredSchemeApplied == true) {

                if (getUnsecuredLoanId.unsecuredLoanId == null) {

                    await models.customerLoanMaster.update({ customerLoanCurrentStage: '5', totalFinalInterestAmt, finalLoanAmount, outstandingAmount: finalLoanAmount, securedLoanAmount, unsecuredLoanAmount, tenure, loanStartDate, loanEndDate, paymentFrequency, processingCharge, isUnsecuredSchemeApplied }, { where: { id: masterLoanId }, transaction: t })

                    var unsecuredLoan = await models.customerLoan.create({ customerId: loanSubmitted.customerId, masterLoanId, partnerId, schemeId: unsecuredSchemeId, loanAmount: unsecuredLoanAmount, outstandingAmount: unsecuredLoanAmount, interestRate: unsecuredInterestRate, loanType: "unsecured", createdBy, modifiedBy }, { transaction: t })

                    await models.customerLoan.update({ partnerId, schemeId, loanAmount: securedLoanAmount, outstandingAmount: securedLoanAmount, interestRate, loanType: "secured", unsecuredLoanId: unsecuredLoan.id, createdBy, modifiedBy }, { where: { id: loanId }, transaction: t })

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

                    let newUnsecuredSlab = await getSchemeSlab(unsecuredSchemeId, unsecuredLoan.id)

                    await models.customerLoanInterest.bulkCreate(newUnsecuredInterestData, { transaction: t });
                    await models.customerLoanInitialInterest.bulkCreate(newUnsecuredInterestData, { transaction: t });
                    await models.customerLoanSlabRate.bulkCreate(newUnsecuredSlab, { transaction: t })



                    await models.customerLoanHistory.create({ loanId, masterLoanId, action: FINAL_INTEREST_LOAN, modifiedBy }, { transaction: t });

                } else {

                    await models.customerLoanMaster.update({ customerLoanCurrentStage: '5', totalFinalInterestAmt, finalLoanAmount, outstandingAmount: finalLoanAmount, securedLoanAmount, unsecuredLoanAmount, tenure, loanStartDate, loanEndDate, paymentFrequency, processingCharge, isUnsecuredSchemeApplied }, { where: { id: masterLoanId }, transaction: t })

                    await models.customerLoan.update({ partnerId, schemeId, loanAmount: securedLoanAmount, outstandingAmount: securedLoanAmount, interestRate, modifiedBy }, { where: { id: loanId }, transaction: t })

                    await models.customerLoan.update({ partnerId, schemeId: unsecuredSchemeId, loanAmount: unsecuredLoanAmount, outstandingAmount: unsecuredLoanAmount, interestRate: unsecuredInterestRate, modifiedBy, isActive: true }, { where: { id: getUnsecuredLoanId.unsecuredLoanId }, transaction: t })

                    await models.customerLoanInterest.destroy({ where: { loanId: getUnsecuredLoanId.unsecuredLoanId }, transaction: t })
                    await models.customerLoanInitialInterest.destroy({ where: { loanId: getUnsecuredLoanId.unsecuredLoanId }, transaction: t });
                    await models.customerLoanSlabRate.destroy({ where: { loanId: getUnsecuredLoanId.unsecuredLoanId }, transaction: t })


                    await models.customerLoanInterest.bulkCreate(unsecuredInterestData, { transaction: t });
                    await models.customerLoanInitialInterest.bulkCreate(unsecuredInterestData, { transaction: t });
                    await models.customerLoanSlabRate.bulkCreate(unsecuredSlab, { transaction: t })

                    await models.customerLoanHistory.create({ loanId, masterLoanId, action: FINAL_INTEREST_LOAN, modifiedBy }, { transaction: t });

                }

            } else {
                await models.customerLoanMaster.update({ customerLoanCurrentStage: '5', totalFinalInterestAmt, finalLoanAmount, outstandingAmount: finalLoanAmount, securedLoanAmount, unsecuredLoanAmount, tenure, loanStartDate, loanEndDate, paymentFrequency, processingCharge, isUnsecuredSchemeApplied }, { where: { id: masterLoanId }, transaction: t })


                await models.customerLoanInterest.destroy({ where: { loanId: getUnsecuredLoanId.unsecuredLoanId }, transaction: t })
                await models.customerLoanInitialInterest.destroy({ where: { loanId: getUnsecuredLoanId.unsecuredLoanId }, transaction: t });
                await models.customerLoanSlabRate.destroy({ where: { loanId: getUnsecuredLoanId.unsecuredLoanId }, transaction: t })
                await models.customerLoanHistory.destroy({ where: { loanId: getUnsecuredLoanId.unsecuredLoanId }, transaction: t })
                await models.customerLoan.update({ partnerId, schemeId, unsecuredLoanId: null, loanAmount: securedLoanAmount, outstandingAmount: securedLoanAmount, interestRate, modifiedBy }, { where: { id: loanId }, transaction: t })

                await models.customerLoan.destroy({ where: { id: getUnsecuredLoanId.unsecuredLoanId }, transaction: t })



                await models.customerLoanHistory.create({ loanId, masterLoanId, action: FINAL_INTEREST_LOAN, modifiedBy }, { transaction: t });

            }

        })
        return res.status(200).json({ message: 'success', loanId, masterLoanId, loanCurrentStage: '5', finalLoanAmount, firstName, lastName })
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
        return res.status(200).json({ message: 'success', loanId, masterLoanId, loanCurrentStage: '6' })
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
        return res.status(200).json({ message: 'success', loanId, masterLoanId, loanCurrentStage: '6' })
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

    let loanData = await sequelize.transaction(async t => {
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
    })

    let ornamentType = [];
    if (ornament.loanOrnamentsDetail.length != 0) {
        for (let ornamentsDetail of ornament.loanOrnamentsDetail) {
            ornamentType.push({ ornamentType: ornamentsDetail.ornamentType, id: ornamentsDetail.id })
        }
    }
    return res.status(200).json({ message: 'success', ornamentType })

}

//  FUNCTION FOR ADD PACKAGE IMAGES
exports.addPackageImagesForLoan = async (req, res, next) => {

    let { loanId, masterLoanId, emptyPacketWithNoOrnament, sealingPacketWithWeight, sealingPacketWithCustomer, packetOrnamentArray } = req.body;
    let createdBy = req.userData.id;
    let modifiedBy = req.userData.id;
    let loanDetails = await models.customerLoanMaster.findOne({ where: { id: masterLoanId } });

    let getPackets = await models.customerLoanPackageDetails.findAll({ where: { masterLoanId: masterLoanId } })
    if (!check.isEmpty(getPackets)) {
        return res.status(400).json({ message: `Packets has been already assign` })
    }

    if (loanDetails !== null && loanDetails.loanStatusForAppraiser === 'approved') {

        //FOR PACKET UPDATE
        let packetArray = await packetOrnamentArray.map(ele => {
            return ele.packetId
        })
        let packetUpdateArray = await packetArray.map(ele => {
            let obj = {}
            obj.id = ele;
            obj.customerId = loanDetails.customerId;
            obj.loanId = loanId;
            obj.masterLoanId = masterLoanId;
            obj.modifiedBy = modifiedBy
            obj.packetAssigned = true;
            return obj
        })

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
                    pushData['ornamentTypeId'] = Number(singleOrnamentId)
                    ornamentPacketData.push(pushData)
                }
            }
            console.log(ornamentPacketData)
            await models.packetOrnament.bulkCreate(ornamentPacketData, { transaction: t })

            await models.packet.bulkCreate(packetUpdateArray, {
                updateOnDuplicate: ["customerId", "loanId", "masterLoanId", "modifiedBy", "packetAssigned"]
            }, { transaction: t })

            await models.customerLoanHistory.create({ loanId, masterLoanId, action: PACKET_IMAGES, modifiedBy }, { transaction: t });

        })

        return res.status(200).json({ message: `Packets added successfully` })

    } else {
        res.status(404).json({ message: 'Given loan id is not proper' })
    }
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

            return res.status(200).json({ message: 'success' })
        } else {
            let rejectedStageId = await models.loanStage.findOne({ where: { name: 'bm rating' } })

            await sequelize.transaction(async (t) => {
                await models.customerLoanMaster.update(
                    { applicationFormForBM, goldValuationForBM, loanStatusForBM, commentByBM, loanStageId: rejectedStageId.id, bmId, modifiedBy },
                    { where: { id: masterLoanId }, transaction: t })

                await models.customerLoanHistory.create({ loanId, masterLoanId, action: BM_RATING, modifiedBy }, { transaction: t });
            })
            return res.status(200).json({ message: 'success' })
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
        return res.status(200).json({ message: 'success' })
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

        return res.status(200).json({ message: 'success', masterLoanId, loanId })
    } else {
        let loanData = await sequelize.transaction(async t => {

            await models.customerLoanDocument.update({ loanAgreementCopy, pawnCopy, schemeConfirmationCopy, modifiedBy }, { where: { masterLoanId: masterLoanId }, transaction: t })

            await models.customerLoanHistory.create({ loanId, masterLoanId, action: LOAN_DOCUMENTS, modifiedBy }, { transaction: t });

            return loan
        })
        return res.status(200).json({ message: 'success', masterLoanId, loanId })

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


            return res.status(200).json({ message: 'success' })
        } else {
            let rejectedStageId = await models.loanStage.findOne({ where: { name: 'OPS team rating' } })

            await sequelize.transaction(async (t) => {
                await models.customerLoanMaster.update(
                    { applicationFormForOperatinalTeam, goldValuationForOperatinalTeam, loanStatusForOperatinalTeam, commentByOperatinalTeam, loanStageId: rejectedStageId.id, operatinalTeamId, modifiedBy },
                    { where: { id: masterLoanId }, transaction: t })

                await models.customerLoanHistory.create({ loanId, masterLoanId, action: OPERATIONAL_TEAM_RATING, modifiedBy }, { transaction: t });

            })


            return res.status(200).json({ message: 'success' })
        }
    } else {
        let approvedStageId = await models.loanStage.findOne({ where: { name: 'disbursement pending' } })

        let checkUnsecuredLoan = await models.customerLoan.findOne({ where: { id: loanId, isActive: true } })

        let loanMaster = await models.customerLoanMaster.findOne(
            {
                where: { id: masterLoanId },
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
            if (loanMaster.isLoanTransfer == true) {
                let stageIdTransfer = await models.loanStage.findOne({ where: { name: 'disbursed' }, transaction: t })
                let dateChnage = await disbursementOfLoanTransfer(masterLoanId);
                for (let a = 0; a < dateChnage.securedInterest.length; a++) {
                    let updateDate = dateChnage.securedInterest[a].emiDueDate
                    await models.customerLoanInterest.update({ emiDueDate: updateDate }, { where: { id: dateChnage.securedInterest[a].id }, transaction: t });
                    await models.customerLoanInitialInterest.update({ emiDueDate: updateDate }, { where: { id: dateChnage.securedInterest[a].id }, transaction: t })
                }
                if (dateChnage.isUnSecured == true) {
                    for (let a = 0; a < dateChnage.unsecuredInterest.length; a++) {
                        let updateDate = dateChnage.unsecuredInterest[a].emiDueDate
                        await models.customerLoanInterest.update({ emiDueDate: updateDate }, { where: { id: dateChnage.unsecuredInterest[a].id }, transaction: t })
                        await models.customerLoanInitialInterest.update({ emiDueDate: updateDate }, { where: { id: dateChnage.unsecuredInterest[a].id }, transaction: t })
                    }
                }
                let customerLoanId = [];
                for (const loan of loanMaster.customerLoan) {
                    customerLoanId.push(loan.id);
                    await models.customerLoanDisbursement.create({
                        loanId: loan.id, masterLoanId, loanAmount: loanMaster.loanTransfer.disbursedLoanAmount, transactionId: loanMaster.loanTransfer.transactionId, date: loanMaster.loanTransfer.updatedAt, paymentMode: 'Loan transfer', createdBy: loanMaster.loanTransfer.modifiedBy, modifiedBy: loanMaster.loanTransfer.modifiedBy
                    }, { transaction: t })
                }
                // await models.customerLoan.update({ disbursed: true }, { where: { id: { [Op.in]: customerLoanId } }, transaction: t })
                await models.customerLoanMaster.update({ applicationFormForOperatinalTeam, goldValuationForOperatinalTeam, loanStatusForOperatinalTeam, commentByOperatinalTeam, loanStageId: stageIdTransfer.id, modifiedBy, operatinalTeamId, isLoanSubmitted: true, }, { where: { id: masterLoanId }, transaction: t })
            } else {
                // loan transfer changes complete

                await models.customerLoanMaster.update({ applicationFormForOperatinalTeam, goldValuationForOperatinalTeam, loanStatusForOperatinalTeam, commentByOperatinalTeam, loanStageId: approvedStageId.id, operatinalTeamId, modifiedBy, isLoanSubmitted: true, }, { where: { id: masterLoanId }, transaction: t })

            }

            await models.customerLoanHistory.create({ loanId, masterLoanId, action: OPERATIONAL_TEAM_RATING, modifiedBy }, { transaction: t });

        })

        return res.status(200).json({ message: 'success' })
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
        attributes: ['paymentFrequency', 'processingCharge', 'isUnsecuredSchemeApplied'],
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
        }]
    })
    let securedLoanAmount;
    let unsecuredLoanAmount;
    let securedLoanId;
    let unsecuredLoanId;
    let securedSchemeName;
    let unsecuredSchemeName;
    if (checkLoan.isUnsecuredSchemeApplied == true) {
        securedLoanId = checkLoan.customerLoan[0].id
        securedSchemeName = checkLoan.customerLoan[0].scheme.schemeName
        securedLoanAmount = Number(checkLoan.securedLoanAmount)

        unsecuredLoanId = checkLoan.customerLoan[1].id
        unsecuredSchemeName = checkLoan.customerLoan[1].scheme.schemeName
        unsecuredLoanAmount = Number(checkLoan.unsecuredLoanAmount) - Number(checkLoan.processingCharge)
    } else {
        securedLoanId = checkLoan.customerLoan[0].id
        securedSchemeName = checkLoan.customerLoan[0].scheme.schemeName
        securedLoanAmount = Number(checkLoan.securedLoanAmount) - Number(checkLoan.processingCharge);
    }

    let data = {
        userBankDetail: userBankDetails,
        branchBankDetail: brokerBankDetails,
        paymentType: userBankDetails.paymentType,
        isUnsecuredSchemeApplied: checkLoan.isUnsecuredSchemeApplied,
        finalLoanAmount: securedLoanAmount + unsecuredLoanAmount,
        securedLoanAmount,
        securedLoanId,
        securedSchemeName,
        unsecuredLoanAmount,
        unsecuredLoanId,
        unsecuredSchemeName,
        masterLoanId
    }
    return res.status(200).json({ message: 'success', data: data })

}

//  FUNCTION FOR DISBURSEMENT OF LOAN AMOUNT
exports.disbursementOfLoanAmount = async (req, res, next) => {

    let { masterLoanId, securedLoanId, unsecuredLoanId, securedLoanAmount, unsecuredLoanAmount, securedTransactionId, unsecuredTransactionId, date, paymentMode, ifscCode, bankName, bankBranch, accountHolderName, accountNumber, disbursementStatus } = req.body;
    let createdBy = req.userData.id;
    let modifiedBy = req.userData.id;

    let checkIsDisbursed = await models.customerLoanDisbursement.findAll({ where: { masterLoanId: masterLoanId } });

    if (!check.isEmpty(checkIsDisbursed)) {
        return res.status(400).json({ message: `This loan already disbursed` })
    }

    let loanDetails = await models.customerLoanMaster.findOne({ where: { id: masterLoanId } });
    let matchStageId = await models.loanStage.findOne({ where: { name: 'disbursement pending' } })
    let stageId = await models.loanStage.findOne({ where: { name: 'disbursed' } })

    let Loan = await models.customerLoanMaster.findOne({
        where: { id: masterLoanId },
        attributes: ['paymentFrequency', 'processingCharge', 'isUnsecuredSchemeApplied'],
        include: [{
            model: models.customerLoanInterest,
            as: 'customerLoanInterest',
            where: { isActive: true, loanId: securedLoanId }
        }]
    })

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

            await models.customerLoanMaster.update({ loanStartDate: newStartDate, loanEndDate: newEndDate, loanStageId: stageId.id }, { where: { id: masterLoanId }, transaction: t })

            //for secured interest date change
            for (let a = 0; a < securedInterest.length; a++) {
                let updateDate = securedInterest[a].emiDueDate
                await models.customerLoanInterest.update({ emiDueDate: updateDate }, { where: { id: securedInterest[a].id }, transaction: t })
                await models.customerLoanInitialInterest.update({ emiDueDate: updateDate }, { where: { id: securedInterest[a].id }, transaction: t })
            }

            if (Loan.isUnsecuredSchemeApplied == true) {

                //for unsecured interest date change
                for (let a = 0; a < unsecuredInterest.length; a++) {
                    let updateDate = unsecuredInterest[a].emiDueDate
                    await models.customerLoanInterest.update({ emiDueDate: updateDate }, { where: { id: unsecuredInterest[a].id }, transaction: t })
                    await models.customerLoanInitialInterest.update({ emiDueDate: updateDate }, { where: { id: unsecuredInterest[a].id }, transaction: t })
                }

                await models.customerLoanDisbursement.create({
                    masterLoanId, loanId: securedLoanId, disbursementAmount: securedLoanAmount, transactionId: securedTransactionId, date, paymentMode, ifscCode, bankName, bankBranch,
                    accountHolderName, accountNumber, disbursementStatus, createdBy, modifiedBy
                }, { transaction: t })

                await models.customerLoanDisbursement.create({
                    masterLoanId, loanId: unsecuredLoanId, disbursementAmount: unsecuredLoanAmount, transactionId: unsecuredTransactionId, date, paymentMode, ifscCode, bankName, bankBranch,
                    accountHolderName, accountNumber, disbursementStatus, createdBy, modifiedBy
                }, { transaction: t })
            } else {
                await models.customerLoanDisbursement.create({
                    masterLoanId, loanId: securedLoanId, disbursementAmount: securedLoanAmount, transactionId: securedTransactionId, date, paymentMode, ifscCode, bankName, bankBranch,
                    accountHolderName, accountNumber, disbursementStatus, createdBy, modifiedBy
                }, { transaction: t })
            }

            await models.customerLoanHistory.create({ loanId: securedLoanId, masterLoanId, action: LOAN_DISBURSEMENT, modifiedBy }, { transaction: t });
            if (Loan.isUnsecuredSchemeApplied == true) {
                await models.customerLoanHistory.create({ loanId: unsecuredLoanId, masterLoanId, action: LOAN_DISBURSEMENT, modifiedBy }, { transaction: t });
            }

        })
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
            }
        }
    })

    let interestTable = await models.customerLoanInterest.findAll({
        where: { loanId: loanId },
        order: [['id', 'asc']]
    })

    for (let i = 0; i < interestTable.length; i++) {
        let date = new Date();
        let newEmiDueDate = new Date(date.setDate(date.getDate() + (Number(Loan.paymentFrequency) * (i + 1))))
        interestTable[i].emiDueDate = newEmiDueDate
        for (let j = 0; j < holidayDate.length; j++) {
            let momentDate = moment(newEmiDueDate, "DD-MM-YYYY").format('YYYY-MM-DD')
            if (momentDate == holidayDate[j].holidayDate) {
                let newDate = new Date(newEmiDueDate);
                let holidayEmiDueDate = new Date(newDate.setDate(newDate.getDate() + 1))
                interestTable[i].emiDueDate = holidayEmiDueDate
                newEmiDueDate = holidayEmiDueDate
                j = 0
            }
        }
        interestTable.loanId = loanId
        interestTable.masterLoanId = masterLoanId
    }

    return interestTable
}

//get single customer loan details DONE
exports.getSingleLoanDetails = async (req, res, next) => {

    let { customerLoanId } = req.query

    let customerLoan = await models.customerLoan.findOne({
        where: { id: customerLoanId },
        order: [
            [models.scheme, 'id', 'asc'],
            [models.scheme, models.schemeInterest, 'days', 'asc']
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
                model: models.customerLoan,
                as: 'unsecuredLoan',
                include: [{
                    model: models.customerLoanInterest,
                    as: 'customerLoanInterest',
                }, {
                    model: models.scheme,
                    as: 'scheme',
                }]
            },
            {
                model: models.customerLoanPackageDetails,
                as: 'loanPacketDetails',
                // attributes: { exclude: ['createdAt', 'updatedAt', 'createdBy', 'modifiedBy', 'isActive'] },
                include: [{
                    model: models.packet,
                    include: [{
                        model: models.packetOrnament,
                        as: 'packetOrnament',
                        include: [{
                            model: models.ornamentType,
                            as: 'ornamentType'
                        }]
                    }]
                }]
            },
            {
                model: models.customer,
                as: 'customer',
                attributes: ['id', 'customerUniqueId', 'firstName', 'lastName', 'panType', 'panImage', 'mobileNumber'],
            },
            {
                model: models.customerLoanInterest,
                as: 'customerLoanInterest',
            }, {
                model: models.customerLoanDocument,
                as: 'customerLoanDocument'
            }]
    });

    let ornamentType = [];
    if (customerLoan.loanOrnamentsDetail.length != 0) {
        for (let ornamentsDetail of customerLoan.loanOrnamentsDetail) {
            ornamentType.push({ ornamentType: ornamentsDetail.ornamentType, id: ornamentsDetail.id })
        }
        customerLoan.dataValues.ornamentType = ornamentType;
    }
    // if (customerLoan.unsecuredLoan == null) {
    //     customerLoan.dataValues['isUnsecuredSchemeApplied'] = false;
    // } else {
    //     if (customerLoan.unsecuredLoan.isActive) {
    //         customerLoan.dataValues['isUnsecuredSchemeApplied'] = true
    //     } else {
    //         customerLoan.dataValues['isUnsecuredSchemeApplied'] = customerLoan.unsecuredLoan.isActive
    //     }
    // }

    return res.status(200).json({ message: 'success', data: customerLoan })
}

//get function for single loan in CUSTOMER-MANAGMENT
exports.getSingleLoanInCustomerManagment = async (req, res, next) => {
    let { customerLoanId } = req.query
    let customerLoan = await models.customerLoan.findOne({
        where: { id: customerLoanId },
        attributes: { exclude: ['createdAt', 'updatedAt', 'createdBy', 'modifiedBy', 'isActive'] },
        include: [
            {
                model: models.customerLoanMaster,
                as: 'masterLoan',
                attributes: ['id'],
                include: [{
                    model: models.loanStage,
                    as: 'loanStage',
                    attributes: ['id', 'name']
                },
                {
                    model: models.customerLoanTransfer,
                    as: "loanTransfer",
                    attributes: { exclude: ['createdAt', 'updatedAt', 'createdBy', 'modifiedBy', 'isActive'] },
                },
                {
                    model: models.customerLoanPersonalDetail,
                    as: 'loanPersonalDetail',
                }, {
                    model: models.customerLoanBankDetail,
                    as: 'loanBankDetail',
                }, {
                    model: models.customerLoanNomineeDetail,
                    as: 'loanNomineeDetail',
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
                    model: models.customerLoanPackageDetails,
                    as: 'loanPacketDetails',
                    attributes: { exclude: ['createdAt', 'updatedAt', 'createdBy', 'modifiedBy', 'isActive'] },
                    include: [{
                        model: models.packet,
                        as: 'packets',
                        attributes: { exclude: ['createdAt', 'updatedAt', 'createdBy', 'modifiedBy', 'isActive'] },
                        include: [
                            {
                                model: models.packetOrnament,
                                as: 'packetOrnament',
                                include: [{
                                    model: models.ornamentType,
                                    as: 'ornamentType'
                                }]
                            }
                        ]
                    }]
                },
                {
                    model: models.customerLoanDocument,
                    as: 'customerLoanDocument'
                }
                ]
            },
            {
                model: models.customer,
                as: 'customer',
                attributes: ['id', 'customerUniqueId', 'firstName', 'lastName', 'panType', 'panImage', 'mobileNumber'],
            }
        ]
    });
    return res.status(200).json({ message: 'success', data: customerLoan })
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
        loanStageId: { [Op.notIn]: [stage.id, transfer.id] },
        isActive: true
    };
    let internalBranchId = req.userData.internalBranchId
    let internalBranchWhere;
    if (req.userData.userTypeId != 4) {
        internalBranchWhere = { isActive: true, internalBranchId: internalBranchId }
    } else {
        internalBranchWhere = { isActive: true }
    }

    let associateModel = [{
        model: models.loanStage,
        as: 'loanStage',
        attributes: ['id', 'name']
    }, {
        model: models.customer,
        as: 'customer',
        where: internalBranchWhere,
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
            [models.customerLoan, "id", "asc"],
            ["updatedAt", "DESC"]
        ],
        attributes: ['id', 'loanStatusForAppraiser', 'loanStatusForBM', 'loanStatusForOperatinalTeam', 'loanStartDate', 'securedLoanAmount', 'unsecuredLoanAmount', 'finalLoanAmount', 'loanStageId', 'isLoanSubmitted'],
        offset: offset,
        limit: pageSize,

    });
    let count = await models.customerLoanMaster.findAll({
        where: searchQuery,
        subQuery: false,
        include: associateModel,
    });



    if (appliedLoanDetails.length === 0) {
        return res.status(200).json([]);
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
                "$customerLoanMaster.final_loan_amount$": { [Op.iLike]: search + '%' },
                "$customerLoan.loan_unique_id$": { [Op.iLike]: search + '%' },
                "$customerLoan.scheme.scheme_name$": { [Op.iLike]: search + '%' },

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
        loanStageId: stageId.id
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
            model: models.customerLoan,
            as: 'customerLoan',
            include: [{
                model: models.scheme,
                as: 'scheme',
                attributes: ['id', 'schemeName']

            },
            ]
        },
        {
            model: models.customer,
            as: 'customer',
            where: internalBranchWhere,
            attributes: { exclude: ['mobileNumber', 'createdAt', 'updatedAt', 'createdBy', 'modifiedBy', 'isActive'] }
        },
        {
            model: models.partRelease,
            as: 'partRelease',
            attributes: ['amountStatus', 'partReleaseStatus']
        },
    ]

    let loanDetails = await models.customerLoanMaster.findAll({
        where: searchQuery,
        subQuery: false,
        include: associateModel,
        order: [
            [models.customerLoan, 'id', 'asc'],
            ['id', 'DESC']
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
        return res.status(200).json([]);
    } else {
        return res.status(200).json({ message: 'Loan details fetch successfully', data: loanDetails, count: count.length });
    }
}

//FUNCTION FOR GET ASSIGN APPRAISER CUSTOMER LIST 
exports.getAssignAppraiserCustomer = async (req, res, next) => {
    try {
        let { search, offset, pageSize } = paginationFUNC.paginationWithFromTo(req.query.search, req.query.from, req.query.to);
        let id = req.userData.id;

        let query = {}
        let searchQuery = {
            [Op.and]: [query, {
                [Op.or]: {
                    "$customer.first_name$": { [Op.iLike]: search + '%' },
                    "$customer.last_name$": { [Op.iLike]: search + '%' },
                    "$customer.customer_unique_id$": { [Op.iLike]: search + '%' },
                },
            }],
            appraiserId: id
        };

        let includeArray = [{
            model: models.customer,
            as: 'customer',
            // attributes: ['id', 'firstName', 'lastName'],
            // required:false,
            subQuery: false,
            // include: {
            //     model: models.customerLoanMaster,
            //     as: "masterLoan",
            // }
        }]



        let data = await models.customerAssignAppraiser.findAll({
            where: searchQuery,
            include: includeArray,
            order: [
                ['id', 'DESC']
            ],
            // offset: offset,
            // limit: pageSize
        })

        let customerId = data.map(el => el.customerId)
        console.log(customerId)
        let customerLoan = await models.customer.findOne({
            where: { id: { [Op.in]: customerId } },
            include:[{
                model: models.customerLoanMaster,
                as: "masterLoan",
            }]
        })
        // let count = await models.customerAssignAppraiser.findAll({
        //     where: searchQuery,
        //     include: includeArray,
        // });
        if (data.length === 0) {
            return res.status(200).json([]);
        } else {
            return res.status(200).json({ message: 'success', data: customerLoan })
        }
    }
    catch (err) {
        console.log(err)
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
                    attributes: ['dateOfBirth']
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
        }

    ]

    let customerLoanDetail = await models.customerLoanMaster.findOne({
        where: { id: customerLoanId },
        order: [
            [models.customerLoan, 'id', 'asc'],
        ],
        attributes: ['id', 'tenure', 'loanStartDate', 'loanEndDate', 'isUnsecuredSchemeApplied'],
        include: includeArray
    });

    let ornaments = [];
    if (customerLoanDetail.loanOrnamentsDetail.length != 0) {
        for (let ornamentsDetail of customerLoanDetail.loanOrnamentsDetail) {
            ornaments.push({
                name: ornamentsDetail.ornamentType.name,
                quantity: ornamentsDetail.quantity,
                grossWeight: ornamentsDetail.grossWeight,
                netWeight: ornamentsDetail.netWeight,
                deductionWeight: ornamentsDetail.deductionWeight
            })
        }
        customerLoanDetail.ornamentType = ornaments;
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
    dateOfBirth = d.getDate() + "-" + d.getMonth() + 1 + "-" + d.getFullYear();
    //console.log(customerLoanDetail.customerLoan[1])
    let customerUnsecureLoanData = [];
    if (customerLoanDetail.isUnsecuredSchemeApplied) {
        var html = fs.readFileSync("./templates/acknowledge-unsecure-template.html", 'utf8');
        customerUnsecureLoanData = await [{
            Name: customerLoanDetail.customer.firstName + " " + customerLoanDetail.customer.lastName,
            dob: dateOfBirth,
            contactNumber: customerLoanDetail.customer.mobileNumber,
            start_Date: customerLoanDetail.loanStartDate,
            customerAddress: `${customerLoanDetail.customerAddress[0].address},${customerLoanDetail.customerAddress[0].pinCode},${customerLoanDetail.customerAddress[0].state},${customerLoanDetail.customerAddress[0].city}`,
            customerId: customerLoanDetail.customer.customerUniqueId,
            loanTenure: customerLoanDetail.tenure,
            end_Date: customerLoanDetail.loanEndDate,
            //accountNumber: customerLoan.loanBankDetail.accountNumber,
            //bankName: customerLoan.loanBankDetail.accountHolderName,
            //ifscCode: customerLoan.loanBankDetail.ifscCode,
            loanNumber: customerLoanDetail.customerLoan[1].loanUniqueId,
            loanAmount: customerLoanDetail.customerLoan[1].loanAmount,
            loanScheme: customerLoanDetail.customerLoan[1].scheme.schemeName,
            penalCharges: customerLoanDetail.customerLoan[1].scheme.penalInterest,
            interestRate: customerLoanDetail.customerLoan[1].interestRate,
        }]
        //console.log(customerUnsecureLoanData)
    } else {
        var html = fs.readFileSync("./templates/acknowledge-template.html", 'utf8');
    }
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



    var customerSecureLoanData = await [{
        partnerName: customerLoanDetail.customerLoan[0].partner.name,
        Name: customerLoanDetail.customer.firstName + " " + customerLoanDetail.customer.lastName,
        dob: dateOfBirth,
        contactNumber: customerLoanDetail.customer.mobileNumber,
        nomineeDetails: `${customerLoanDetail.loanNomineeDetail[0].nomineeName}, ${customerLoanDetail.loanNomineeDetail[0].nomineeAge}, ${customerLoanDetail.loanNomineeDetail[0].relationship}`,
        start_Date: customerLoanDetail.loanStartDate,
        customerAddress: `${customerLoanDetail.customerAddress[0].address},${customerLoanDetail.customerAddress[0].pinCode},${customerLoanDetail.customerAddress[0].state},${customerLoanDetail.customerAddress[0].city}`,
        interestRate: customerLoanDetail.customerLoan[0].interestRate,
        customerId: customerLoanDetail.customer.customerUniqueId,
        loanNumber: customerLoanDetail.customerLoan[0].loanUniqueId,
        loanAmount: customerLoanDetail.customerLoan[0].loanAmount,
        loanTenure: customerLoanDetail.tenure,
        end_Date: customerLoanDetail.loanEndDate,
        loanScheme: customerLoanDetail.customerLoan[0].scheme.schemeName,
        penalCharges: customerLoanDetail.customerLoan[0].scheme.penalInterest,
        accountNumber: customerLoanDetail.loanBankDetail.accountNumber,
        bankName: customerLoanDetail.loanBankDetail.accountHolderName,
        ifscCode: customerLoanDetail.loanBankDetail.ifscCode,
        ornamentTypes: customerLoanDetail.ornamentType[0].name,
        quantity: customerLoanDetail.ornamentType[0].quantity,
        grossWeight: customerLoanDetail.ornamentType[0].grossWeight,
        deduction: customerLoanDetail.ornamentType[0].deductionWeight,
        netWeight: customerLoanDetail.ornamentType[0].netWeight,

    }];
    //console.log(customerSecureLoanData)

    let fileName = await `AcknowledgeOFPledge${Date.now()}`;
    document = await {
        html: html,
        data: {
            bootstrapCss: `${process.env.URL}/bootstrap.css`,
            jqueryJs: `${process.env.URL}/jquery-slim.min.js`,
            popperJs: `${process.env.URL}/popper.min.js`,
            bootstrapJs: `${process.env.URL}/bootstrap.js`,
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
