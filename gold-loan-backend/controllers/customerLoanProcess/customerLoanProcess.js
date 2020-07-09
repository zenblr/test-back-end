// LOAD REQUIRED PACKAGES
const models = require('../../models');
const sequelize = models.sequelize;
const Sequelize = models.Sequelize;
const Op = Sequelize.Op;
const paginationFUNC = require('../../utils/pagination'); // IMPORTING PAGINATION FUNCTION

const check = require("../../lib/checkLib"); // IMPORTING CHECKLIB 
const moment = require('moment')


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

    let customerLoanStage = await models.customerLoanMaster.findOne({ where: { customerId: customerData.id, isLoanSubmitted: false } })
    if (!check.isEmpty(customerLoanStage)) {
        let customerCurrentStage = customerLoanStage.customerLoanCurrentStage
        let loanId = await models.customerLoan.findOne({ where: { masterLoanId: customerLoanStage.id, loanType: 'secured' } })
        if (customerCurrentStage == '2') {
            return res.status(200).json({ message: 'success', loanId: loanId.id, masterLoanId: customerLoanStage.id, loanCurrentStage: customerCurrentStage })
        } else if (customerCurrentStage == '3') {
            return res.status(200).json({ message: 'success', loanId: loanId.id, masterLoanId: customerLoanStage.id, loanCurrentStage: customerCurrentStage })
        } else if (customerCurrentStage == '4') {
            return res.status(200).json({ message: 'success', loanId: loanId.id, masterLoanId: customerLoanStage.id, loanCurrentStage: customerCurrentStage, totalEligibleAmt: customerLoanStage.totalEligibleAmt })
        } else if (customerCurrentStage == '5') {
            return res.status(200).json({ message: 'success', loanId: loanId.id, masterLoanId: customerLoanStage.id, loanCurrentStage: customerCurrentStage, finalLoanAmount: customerLoanStage.finalLoanAmount })
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

    let { customerId, customerUniqueId, kycStatus, startDate, purpose, masterLoanId } = req.body
    let createdBy = req.userData.id;
    let modifiedBy = req.userData.id;
    let stageId = await models.loanStage.findOne({ where: { name: 'applying' } })

    if (masterLoanId != null) {
        let customerLoanMaster = await models.customerLoanMaster.findOne({ where: { id: masterLoanId } })
        let loanId = await models.customerLoan.findOne({ where: { masterLoanId: customerLoanMaster.id, loanType: 'secured' } })
        if (!check.isEmpty(customerLoanMaster)) {
            return res.status(200).json({ message: 'success', loanId: loanId.id, masterLoanId: customerLoanMaster.id, loanCurrentStage: '2' })
        }
    }


    let loanData = await sequelize.transaction(async t => {

        let masterLoan = await models.customerLoanMaster.create({ customerId: customerId, loanStageId: stageId.id, customerLoanCurrentStage: '2', internalBranchId: req.userData.internalBranchId, createdBy, modifiedBy }, { transaction: t })

        let loan = await models.customerLoan.create({ customerId, masterLoanId: masterLoan.id, loanType: 'secured', createdBy, modifiedBy }, { transaction: t })

        await models.customerLoanPersonalDetail.create({ loanId: loan.id, masterLoanId: masterLoan.id, customerUniqueId, startDate, purpose, kycStatus, createdBy, modifiedBy }, { transaction: t })
        return loan
    })
    return res.status(200).json({ message: 'success', loanId: loanData.id, masterLoanId: loanData.masterLoanId, loanCurrentStage: '2' })

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

            await models.customerLoanNomineeDetail.update({ nomineeName, nomineeAge, relationship, nomineeType, guardianName, guardianAge, guardianRelationship, modifiedBy }, { where: { loanId: loanId }, transaction: t })
            return loan
        })
        return res.status(200).json({ message: 'success', masterLoanId, loanId, loanCurrentStage: '3' })

    }

}


//FUNCTION for submitting ornament details  DONE
exports.loanOrnmanetDetails = async (req, res, next) => {

    let { loanOrnaments, totalEligibleAmt, loanId, masterLoanId } = req.body
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
    let checkOrnaments = await models.customerLoanOrnamentsDetail.findAll({ where: { masterLoanId: masterLoanId } })
    if (checkOrnaments.length == 0) {
        let loanData = await sequelize.transaction(async t => {
            await models.customerLoanMaster.update({ customerLoanCurrentStage: '4', modifiedBy, totalEligibleAmt }, { where: { id: masterLoanId }, transaction: t })

            let createdOrnaments = await models.customerLoanOrnamentsDetail.bulkCreate(allOrnmanets, { transaction: t });


            return createdOrnaments
        })
        return res.status(200).json({ message: 'success', loanId, masterLoanId, loanCurrentStage: '4', totalEligibleAmt, ornaments: loanData })
    } else {

        let loanSubmitted = await models.customerLoanMaster.findOne({ where: { id: masterLoanId } })
        let loanData = await sequelize.transaction(async t => {
            if (loanSubmitted.isLoanSubmitted == false) {
                await models.customerLoanMaster.update({ customerLoanCurrentStage: '4', modifiedBy, totalEligibleAmt }, { where: { id: masterLoanId }, transaction: t })
            }

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
        return res.status(200).json({ message: 'success', loanId, masterLoanId, loanCurrentStage: '4', totalEligibleAmt, ornaments: loanData })
    }

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
        interestTable[i]['masterLoanId'] = masterLoanId
        interestData.push(interestTable[i])
    }

    let checkFinalLoan = await models.customerLoanMaster.findOne({ where: { id: masterLoanId } })

    if (check.isEmpty(checkFinalLoan.finalLoanAmount)) {
        let loanData = await sequelize.transaction(async t => {

            await models.customerLoanInterest.bulkCreate(interestData, { transaction: t });

            if (isUnsecuredSchemeApplied == true) {
                await models.customerLoanMaster.update({ customerLoanCurrentStage: '5', totalFinalInterestAmt, finalLoanAmount, securedLoanAmount, unsecuredLoanAmount, tenure, loanStartDate, loanEndDate, paymentFrequency, processingCharge }, { where: { id: masterLoanId }, transaction: t })

                var unsecuredLoan = await models.customerLoan.create({ customerId: checkFinalLoan.customerId, masterLoanId, partnerId, loanAmount: unsecuredLoanAmount, schemeId: unsecuredSchemeId, interestRate: unsecuredInterestRate, loanType: "unsecured", createdBy, modifiedBy }, { transaction: t })
                let newUnsecuredInterestData = []
                for (let i = 0; i < interestTable.length; i++) {
                    interestTable[i]['createdBy'] = createdBy
                    interestTable[i]['modifiedBy'] = modifiedBy
                    interestTable[i]['loanId'] = unsecuredLoan.id
                    interestTable[i]['interestAmount'] = interestTable[i].unsecuredInterestAmount
                    interestTable[i]['masterLoanId'] = masterLoanId
                    newUnsecuredInterestData.push(interestTable[i])
                }

                await models.customerLoanInterest.bulkCreate(newUnsecuredInterestData, { transaction: t });

                await models.customerLoan.update({ partnerId, schemeId, loanAmount: securedLoanAmount, interestRate, unsecuredLoanId: unsecuredLoan.id, modifiedBy }, { where: { id: loanId }, transaction: t })

            } else {
                await models.customerLoanMaster.update({ customerLoanCurrentStage: '5', totalFinalInterestAmt, finalLoanAmount, securedLoanAmount, unsecuredLoanAmount, tenure, loanStartDate, loanEndDate, paymentFrequency, processingCharge }, { where: { id: masterLoanId }, transaction: t })

                await models.customerLoan.update({ partnerId, schemeId, loanAmount: securedLoanAmount, interestRate, createdBy, modifiedBy }, { where: { id: loanId }, transaction: t })

            }

        })
        return res.status(200).json({ message: 'success', loanId: loanId, loanCurrentStage: '5', finalLoanAmount })
    } else {

        let loanSubmitted = await models.customerLoanMaster.findOne({ where: { id: masterLoanId } })
        let getUnsecuredLoanId = await models.customerLoan.findOne({ where: { id: loanId } });



        let loanData = await sequelize.transaction(async t => {

            await models.customerLoanInterest.destroy({ where: { loanId: loanId }, transaction: t });
            await models.customerLoanInterest.bulkCreate(interestData, { transaction: t });
            let unsecuredInterestData = [];
            if (isUnsecuredSchemeApplied == true) {
                for (let i = 0; i < interestTable.length; i++) {
                    interestTable[i]['createdBy'] = createdBy
                    interestTable[i]['modifiedBy'] = modifiedBy
                    interestTable[i]['loanId'] = getUnsecuredLoanId.unsecuredLoanId
                    interestTable[i]['interestAmount'] = interestTable[i].unsecuredInterestAmount
                    interestTable[i]['masterLoanId'] = masterLoanId
                    unsecuredInterestData.push(interestTable[i])
                }
            }

            if (isUnsecuredSchemeApplied == true) {

                if (getUnsecuredLoanId.unsecuredLoanId == null) {

                    await models.customerLoanMaster.update({ customerLoanCurrentStage: '5', totalFinalInterestAmt, finalLoanAmount, securedLoanAmount, unsecuredLoanAmount, tenure, loanStartDate, loanEndDate, paymentFrequency, processingCharge }, { where: { id: masterLoanId }, transaction: t })

                    var unsecuredLoan = await models.customerLoan.create({ customerId: loanSubmitted.customerId, masterLoanId, partnerId, schemeId: unsecuredSchemeId, loanAmount: unsecuredLoanAmount, unsecuredSchemeId, interestRate: unsecuredInterestRate, loanType: "unsecured", createdBy, modifiedBy }, { transaction: t })

                    await models.customerLoan.update({ partnerId, schemeId, loanAmount: securedLoanAmount, interestRate, loanType: "secured", unsecuredLoanId: unsecuredLoan.id, createdBy, modifiedBy }, { where: { id: loanId }, transaction: t })

                    let newUnsecuredInterestData = []
                    for (let i = 0; i < interestTable.length; i++) {
                        interestTable[i]['createdBy'] = createdBy
                        interestTable[i]['modifiedBy'] = modifiedBy
                        interestTable[i]['loanId'] = unsecuredLoan.id
                        interestTable[i]['interestAmount'] = interestTable[i].unsecuredInterestAmount
                        interestTable[i]['masterLoanId'] = masterLoanId
                        newUnsecuredInterestData.push(interestTable[i])
                    }

                    await models.customerLoanInterest.bulkCreate(newUnsecuredInterestData, { transaction: t });

                } else {

                    await models.customerLoanMaster.update({ customerLoanCurrentStage: '5', totalFinalInterestAmt, finalLoanAmount, securedLoanAmount, unsecuredLoanAmount, tenure, loanStartDate, loanEndDate, paymentFrequency, processingCharge }, { where: { id: masterLoanId }, transaction: t })

                    await models.customerLoan.update({ partnerId, schemeId, loanAmount: securedLoanAmount, interestRate, modifiedBy }, { where: { id: loanId }, transaction: t })

                    await models.customerLoan.update({ partnerId, schemeId: unsecuredSchemeId, loanAmount: unsecuredLoanAmount, interestRate: unsecuredInterestRate, modifiedBy, isActive: true }, { where: { id: getUnsecuredLoanId.unsecuredLoanId }, transaction: t })

                    await models.customerLoanInterest.destroy({ where: { loanId: getUnsecuredLoanId.unsecuredLoanId }, transaction: t })
                    await models.customerLoanInterest.bulkCreate(unsecuredInterestData, { transaction: t });
                }

            } else {
                await models.customerLoanMaster.update({ customerLoanCurrentStage: '5', totalFinalInterestAmt, finalLoanAmount, securedLoanAmount, unsecuredLoanAmount, tenure, loanStartDate, loanEndDate, paymentFrequency, processingCharge }, { where: { id: masterLoanId }, transaction: t })

                await models.customerLoan.update({ partnerId, schemeId, loanAmount: securedLoanAmount, unsecuredSchemeId, interestRate, unsecuredInterestRate, modifiedBy }, { where: { id: loanId }, transaction: t })

                await models.customerLoan.update({ partnerId, schemeId: unsecuredSchemeId, loanAmount: unsecuredLoanAmount, interestRate: unsecuredInterestRate, isActive: false, modifiedBy }, { where: { id: getUnsecuredLoanId.unsecuredLoanId }, transaction: t })

                await models.customerLoanInterest.update({ isActive: false }, { where: { loanId: getUnsecuredLoanId.unsecuredLoanId }, transaction: t })
            }

        })
        return res.status(200).json({ message: 'success', loanId, masterLoanId, loanCurrentStage: '5', finalLoanAmount })
    }


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

            let loan = await models.customerLoanBankDetail.create({ loanId, masterLoanId, paymentType, bankName, accountNumber, ifscCode, bankBranchName, accountHolderName, passbookProof, createdBy, modifiedBy }, { transaction: t });

            return loan
        })
        return res.status(200).json({ message: 'success', loanId, masterLoanId, loanCurrentStage: '6' })
    } else {

        let loanSubmitted = await models.customerLoanMaster.findOne({ where: { id: masterLoanId } })

        let loanData = await sequelize.transaction(async t => {
            if (loanSubmitted.isLoanSubmitted == false) {
                await models.customerLoan.update({ customerLoanCurrentStage: '6', modifiedBy }, { where: { id: masterLoanId }, transaction: t })
            }
            let loan = await models.customerLoanBankDetail.update({ paymentType, bankName, accountNumber, ifscCode, bankBranchName, accountHolderName, passbookProof, createdBy, modifiedBy }, { where: { loanId: loanId }, transaction: t });

            return loan
        })
        return res.status(200).json({ message: 'success', loanId, masterLoanId, loanCurrentStage: '6' })
    }

}

//FUNCTION for loan bank details DONE
exports.loanAppraiserRating = async (req, res, next) => {
    let { loanId, masterLoanId,
        applicationFormForAppraiser, goldValuationForAppraiser, loanStatusForAppraiser, commentByAppraiser,
        applicationFormForBM, goldValuationForBM, loanStatusForBM, commentByBM,
        applicationFormForOperatinalTeam, goldValuationForOperatinalTeam, loanStatusForOperatinalTeam, commentByOperatinalTeam } = req.body
    let createdBy = req.userData.id;
    let modifiedBy = req.userData.id;
    if (req.userData.userTypeId == 7) {
        let appraiserId = req.userData.id
        let loanData = await sequelize.transaction(async t => {
            if (loanStatusForAppraiser == "approved") {
                let stageId = await models.loanStage.findOne({ where: { name: 'bm rating' }, transaction: t })
                await models.customerLoanMaster.update({
                    applicationFormForAppraiser, goldValuationForAppraiser, loanStatusForAppraiser, commentByAppraiser, modifiedBy, appraiserId, isLoanSubmitted: true, loanStageId: stageId.id
                }, { where: { id: masterLoanId }, transaction: t })
            } else {
                let stageId = await models.loanStage.findOne({ where: { name: 'appraiser rating' }, transaction: t })

                if (loanStatusForAppraiser === 'approved') {
                    if (applicationFormForAppraiser == false || goldValuationForAppraiser == false) {
                        return res.status(400).json({ message: `One of field is not verified` })
                    }
                }

                await models.customerLoanMaster.update({
                    applicationFormForAppraiser, goldValuationForAppraiser, loanStatusForAppraiser, commentByAppraiser, modifiedBy, appraiserId, isLoanSubmitted: true, loanStageId: stageId.id
                }, { where: { id: masterLoanId }, transaction: t })
            }
        })
        return res.status(200).json({ message: 'success' })

    }

    if (req.userData.userTypeId == 5) {
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

                })
                return res.status(200).json({ message: 'success' })
            } else {
                let rejectedStageId = await models.loanStage.findOne({ where: { name: 'bm rating' } })

                await sequelize.transaction(async (t) => {
                    await models.customerLoanMaster.update(
                        { applicationFormForBM, goldValuationForBM, loanStatusForBM, commentByBM, loanStageId: rejectedStageId.id, bmId, modifiedBy },
                        { where: { id: masterLoanId }, transaction: t })
                })
                return res.status(200).json({ message: 'success' })
            }
        } else {
            let approvedStageId = await models.loanStage.findOne({ where: { name: 'operational team rating' } })

            if (loanStatusForBM === 'approved') {
                if (applicationFormForBM == false || goldValuationForBM == false) {
                    return res.status(400).json({ message: `One of field is not verified` })
                }
            }

            await sequelize.transaction(async (t) => {
                await models.customerLoanMaster.update(
                    { applicationFormForBM, goldValuationForBM, loanStatusForBM, commentByBM, loanStageId: approvedStageId.id, bmId, modifiedBy },
                    { where: { id: masterLoanId }, transaction: t })
            })
            return res.status(200).json({ message: 'success' })
        }
        return res.status(200).json({ message: 'success' })
    }

    if (req.userData.userTypeId == 8) {

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

                })
                return res.status(200).json({ message: 'success' })
            } else {
                let rejectedStageId = await models.loanStage.findOne({ where: { name: 'operational team rating' } })

                await sequelize.transaction(async (t) => {
                    await models.customerLoanMaster.update(
                        { applicationFormForOperatinalTeam, goldValuationForOperatinalTeam, loanStatusForOperatinalTeam, commentByOperatinalTeam, loanStageId: rejectedStageId.id, operatinalTeamId, modifiedBy },
                        { where: { id: masterLoanId }, transaction: t })
                })
                return res.status(200).json({ message: 'success' })
            }
        } else {
            let approvedStageId = await models.loanStage.findOne({ where: { name: 'assign packet' } })

            let checkUnsecuredLoan = await models.customerLoan.findOne({ where: { id: loanId, isActive: true } })

            var loanUniqueId = null;
            var unsecuredLoanUniqueId = null;
            if (loanStatusForOperatinalTeam == 'approved') {
                if (applicationFormForOperatinalTeam == true && goldValuationForOperatinalTeam == true) {
                    loanUniqueId = `LOAN${Math.floor(1000 + Math.random() * 9000)}`;
                    if (!check.isEmpty(checkUnsecuredLoan)) {
                        unsecuredLoanUniqueId = `LOAN${Math.floor(1000 + Math.random() * 9000)}`;
                    }
                } else {
                    return res.status(400).json({ message: `One of field is not verified` })
                }
            }
            await sequelize.transaction(async (t) => {

                await models.customerLoanMaster.update({ applicationFormForOperatinalTeam, goldValuationForOperatinalTeam, loanStatusForOperatinalTeam, commentByOperatinalTeam, loanStageId: approvedStageId.id, operatinalTeamId, modifiedBy }, { where: { id: loanId }, transaction: t })
                //securedLoanIdUpdate
                await models.customerLoan.update({ loanUniqueId: loanUniqueId }, { where: { id: loanId }, transaction: t })
                if (!check.isEmpty(checkUnsecuredLoan)) {
                    //unsecuredLoanIdUpdate
                    await models.customerLoan.update({ loanUniqueId: unsecuredLoanUniqueId }, { where: { id: checkUnsecuredLoan.unsecuredLoanId }, transaction: t })
                }
            })
            return res.status(200).json({ message: 'success' })
        }
    }
}

//get single customer loan details DONE
exports.getSingleLoanDetails = async (req, res, next) => {

    let { customerLoanId } = req.query

    let { masterLoanId } = await models.customerLoan.findOne({ where: { id: customerLoanId } })

    let customerLoan = await models.customerLoan.findOne({
        where: { id: customerLoanId },
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
                    model: models.customerLoanPersonalDetail,
                    as: 'loanPersonalDetail',
                }, {
                    model: models.customerLoanBankDetail,
                    as: 'loanBankDetail',
                }, {
                    model: models.customerLoanNomineeDetail,
                    as: 'loanNomineeDetail',
                }, {
                    model: models.customerLoanOrnamentsDetail,
                    as: 'loanOrnamentsDetail',
                    include: [
                        {
                            model: models.ornamentType,
                            as: "ornamentType"
                        }
                    ]
                }, {
                    model: models.customerLoanPackageDetails,
                    as: 'loanPacketDetails',
                    // attributes: { exclude: ['createdAt', 'updatedAt', 'createdBy', 'modifiedBy', 'isActive'] },
                    include: [{
                        model: models.packet,
                        include: [{
                            model: models.ornamentType
                        }]
                    }]
                }, {
                    model: models.customerLoanDocument,
                    as: 'customerLoanDocument'
                }, {
                    model: models.customerLoanInterest,
                    as: 'customerLoanInterest',
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
                as: 'scheme'
            },
            {
                model: models.customerLoan,
                as: 'unsecuredLoan',
                include: [{
                    model: models.customerLoanInterest,
                    as: 'customerLoanInterest',
                }]
            },
            {
                model: models.customerLoanPackageDetails,
                as: 'loanPacketDetails',
                // attributes: { exclude: ['createdAt', 'updatedAt', 'createdBy', 'modifiedBy', 'isActive'] },
                include: [{
                    model: models.packet,
                    include: [{
                        model: models.ornamentType
                    }]
                }]
            },
            {
                model: models.customer,
                as: 'customer',
                attributes: ['id', 'firstName', 'lastName', 'panType', 'panImage', 'mobileNumber'],
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
    if (customerLoan.unsecuredLoan == null) {
        customerLoan.dataValues['isUnsecuredSchemeApplied'] = false;
    } else {
        if (customerLoan.unsecuredLoan.isActive) {
            customerLoan.dataValues['isUnsecuredSchemeApplied'] = false
        } else {
            customerLoan.dataValues['isUnsecuredSchemeApplied'] = customerLoan.unsecuredLoan.isActive
        }
    }


    return res.status(200).json({ message: 'success', data: customerLoan })
}

//  FUNCTION FOR GET APPLIED LOAN DETAILS
exports.appliedLoanDetails = async (req, res, next) => {
    let { schemeId, appraiserApproval, bmApproval, loanStageId, operatinalTeamApproval } = req.query
    let { search, offset, pageSize } =
        paginationFUNC.paginationWithFromTo(req.query.search, req.query.from, req.query.to);

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
        isLoanSubmitted: true,
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
            ['id', 'DESC']
        ],
        attributes: ['id', 'loanStatusForAppraiser', 'loanStatusForBM', 'loanStatusForOperatinalTeam', 'loanStartDate', 'securedLoanAmount', 'unsecuredLoanAmount', 'finalLoanAmount', 'loanStageId'],
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

    if (loanDetails !== null && loanDetails.loanStatusForOperatinalTeam === 'approved') {

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
            let stageId = await models.loanStage.findOne({ where: { name: 'upload documents' }, transaction: t })

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
                    pushData['packetId'] = x.packetId
                    pushData['ornamentTypeId'] = singleOrnamentId
                    ornamentPacketData.push(pushData)
                }
            }
            await models.packetOrnament.bulkCreate(ornamentPacketData, { transaction: t })

            await models.packet.bulkCreate(packetUpdateArray, {
                updateOnDuplicate: ["customerId", "loanId", "masterLoanId", "modifiedBy", "packetAssigned"]
            }, { transaction: t })

        })

        return res.status(200).json({ message: `Packets added successfully` })

    } else {
        res.status(404).json({ message: 'Given loan id is not proper' })
    }
}

//function of loan documents
exports.loanDocuments = async (req, res, next) => {

    let { loanAgreementCopy, pawnCopy, schemeConfirmationCopy, loanId, masterLoanId } = req.body
    let createdBy = req.userData.id;
    let modifiedBy = req.userData.id;

    let checkDocument = await models.customerLoanDocument.findOne({ where: { masterLoanId: masterLoanId } })

    if (check.isEmpty(checkDocument)) {
        let loanData = await sequelize.transaction(async t => {
            let stageId = await models.loanStage.findOne({ where: { name: 'disbursement pending' }, transaction: t })

            await models.customerLoanMaster.update({ loanStageId: stageId.id, modifiedBy }, { where: { id: masterLoanId }, transaction: t })

            await models.customerLoanDocument.create({ loanId, masterLoanId, loanAgreementCopy, pawnCopy, schemeConfirmationCopy, createdBy, modifiedBy }, { transaction: t })
            // return loan
        })
        return res.status(200).json({ message: 'success', masterLoanId, loanId })
    } else {
        let loanData = await sequelize.transaction(async t => {

            await models.customerLoanDocument.update({ loanAgreementCopy, pawnCopy, schemeConfirmationCopy, modifiedBy }, { where: { masterLoanId: masterLoanId }, transaction: t })
            return loan
        })
        return res.status(200).json({ message: 'success', masterLoanId, loanId })

    }

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
    let loan = await models.customerLoan.findOne({
        where: { id: loanId },
    })

    let checkLoan = await models.customerLoanMaster.findOne({
        where: { id: masterLoanId },
    })
    let amount;
    if (loan.loanType == 'secured') {
        amount = checkLoan.securedLoanAmount
    } else if (loan.loanType == 'unsecured') {
        amount = checkLoan.unsecuredLoanAmount
    }

    // return res.status(200).json({ checkFinalLoan, loan })

    let data = {
        userBankDetail: userBankDetails,
        branchBankDetail: brokerBankDetails,
        paymentType: userBankDetails.paymentType,
        finalLoanAmount: amount,
        loanId,
        masterLoanId
    }
    return res.status(200).json({ message: 'success', data: data })

}

//  FUNCTION FOR DISBURSEMENT OF LOAN AMOUNT
exports.disbursementOfLoanAmount = async (req, res, next) => {

    let { loanId, masterLoanId, loanAmount, transactionId, date, paymentMode, ifscCode, bankName, bankBranch,
        accountHolderName, accountNumber, disbursementStatus } = req.body;
    let createdBy = req.userData.id;
    let modifiedBy = req.userData.id;
    let loanDetails = await models.customerLoanMaster.findOne({ where: { id: masterLoanId } });
    let matchStageId = await models.loanStage.findOne({ where: { name: 'disbursement pending' } })
    let stageId = await models.loanStage.findOne({ where: { name: 'disbursed' } })

    let Loan = await models.customerLoanMaster.findOne({
        where: { id: masterLoanId },
        attributes: ['paymentFrequency'],
        order: [
            [models.customerLoanInterest, "id", "asc"],
        ],
        include: [{
            model: models.customerLoanInterest,
            as: 'customerLoanInterest',
            where: { isActive: true, loanId: loanId }
        }]
    })
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

    let table = Loan.customerLoanInterest;

    for (let i = 0; i < table.length; i++) {
        let date = new Date();
        let newEmiDueDate = new Date(date.setDate(date.getDate() + (Number(Loan.paymentFrequency) * (i + 1))))
        table[i].emiDueDate = newEmiDueDate
        for (let j = 0; j < holidayDate.length; j++) {
            let momentDate = moment(newEmiDueDate, "DD-MM-YYYY").format('YYYY-MM-DD')
            if (momentDate == holidayDate[j].holidayDate) {
                let newDate = new Date(newEmiDueDate);
                let holidayEmiDueDate = new Date(newDate.setDate(newDate.getDate() + 1))
                table[i].emiDueDate = holidayEmiDueDate
                newEmiDueDate = holidayEmiDueDate
                j = 0
            }
        }
        table.loanId = loanId
        table.masterLoanId = masterLoanId
    }

    let newStartDate = date
    let newEndDate = table[table.length - 1].emiDueDate



    if (loanDetails.loanStageId == matchStageId.id) {

        await sequelize.transaction(async (t) => {

            await models.customerLoanMaster.update({ loanStartDate: newStartDate, loanEndDate: newEndDate }, { where: { id: masterLoanId }, transaction: t })

            for (let a = 0; a < table.length; a++) {
                let updateDate = table[a].emiDueDate
                await models.customerLoanInterest.update({ emiDueDate: updateDate }, { where: { id: table[a].id }, transaction: t })
            }
            await models.customerLoan.update({ disbursed: true }, { where: { id: loanId }, transaction: t })

            await models.customerLoanDisbursement.create({
                loanId, masterLoanId, loanAmount, transactionId, date, paymentMode, ifscCode, bankName, bankBranch,
                accountHolderName, accountNumber, disbursementStatus, createdBy, modifiedBy
            }, { transaction: t })

            let masterLoan = await models.customerLoanMaster.findOne({
                where: { id: masterLoanId },
                include: [{
                    model: models.customerLoan,
                    as: 'customerLoan',
                    where: { isActive: true }
                }],
                transaction: t
            })
            let approved = [];
            for (let ele of masterLoan.customerLoan) {
                approved.push(ele.disbursed)
            }

            if (!approved.includes(false)) {
                await models.customerLoanMaster.update({ loanStageId: stageId.id }, { where: { id: masterLoanId }, transaction: t })
            }
        })
        return res.status(200).json({ message: 'Your loan amount has been disbursed successfully' });
    } else {
        return res.status(404).json({ message: 'Given loan id is not proper' })
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
        }]

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
        attributes: ['id', 'firstName', 'lastName']
    }]

    let data = await models.customerAssignAppraiser.findAll({
        where: searchQuery,
        include: includeArray,
        order: [
            ['id', 'DESC']
        ],
        offset: offset,
        limit: pageSize
    })

    let count = await models.customerAssignAppraiser.findAll({
        where: searchQuery,
        include: includeArray,
    });
    if (data.length === 0) {
        return res.status(200).json([]);
    } else {
        return res.status(200).json({ message: 'success', data: data, count: count.length })
    }
}

