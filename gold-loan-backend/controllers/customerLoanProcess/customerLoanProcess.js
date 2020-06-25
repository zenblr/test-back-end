// LOAD REQUIRED PACKAGES
const models = require('../../models');
const sequelize = models.sequelize;
const Sequelize = models.Sequelize;
const Op = Sequelize.Op;
const paginationFUNC = require('../../utils/pagination'); // IMPORTING PAGINATION FUNCTION

const check = require("../../lib/checkLib"); // IMPORTING CHECKLIB 

//FUNCTION GET ORNAMENT TYPE

exports.getOrnamentType = async (req, res, next) => {
    let ornametData = await models.ornamentType.findAll({
        where: { isActive: true },
        attributes: ['id', 'name']
    })
    return res.status(200).json({ message: 'success', data: ornametData })
}

//  FUNCTION FOR GET CUSTOMER DETAILS AFTER ENTER UNIQUE ID
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
        attributes: ['id', 'customerUniqueId', 'panCardNumber', 'mobileNumber', 'kycStatus', 'panType', 'panImage']
    })

    let customerLoanStage = await models.customerLoan.findOne({ where: { customerId: customerData.id, isLoanSubmitted: false } })
    if (!check.isEmpty(customerLoanStage)) {
        let customerCurrentStage = customerLoanStage.customerLoanCurrentStage
        if (customerCurrentStage == '2') {
            return res.status(200).json({ message: 'success', loanId: customerLoanStage.id, loanCurrentStage: customerCurrentStage })
        } else if (customerCurrentStage == '3') {
            return res.status(200).json({ message: 'success', loanId: customerLoanStage.id, loanCurrentStage: customerCurrentStage })
        } else if (customerCurrentStage == '4') {
            return res.status(200).json({ message: 'success', loanId: customerLoanStage.id, loanCurrentStage: customerCurrentStage, totalEligibleAmt: customerLoanStage.totalEligibleAmt })
        } else if (customerCurrentStage == '5') {
            let { finalLoanAmount } = await models.customerFinalLoan.findOne({ where: { loanId: customerLoanStage.id } })
            return res.status(200).json({ message: 'success', loanId: customerLoanStage.id, loanCurrentStage: customerCurrentStage, finalLoanAmount })
        } else if (customerCurrentStage == '6') {
            return res.status(200).json({ message: 'success', loanId: customerLoanStage.id, loanCurrentStage: customerCurrentStage })
        }
    }

    if (!customerData) {
        res.status(404).json({ message: 'no customer details found' });
    } else {
        res.status(200).json({ message: 'customer details fetch successfully', customerData });
    }
}

//FUNCTION fot submitting basic details 
exports.loanBasicDeatils = async (req, res, next) => {

    let { customerId, customerUniqueId, panCardNumber, mobileNumber, kycStatus, startDate, purpose, loanId } = req.body
    let createdBy = req.userData.id;
    let modifiedBy = req.userData.id;
    let stageId = await models.loanStage.findOne({ where: { name: 'applying' } })

    if (loanId != null) {
        let customerLoanStage = await models.customerLoan.findOne({ where: { id: loanId } })
        if (!check.isEmpty(customerLoanStage)) {
            return res.status(200).json({ message: 'success', loanId: customerLoanStage.id, loanCurrentStage: '2' })
        }
    }


    let loanData = await sequelize.transaction(async t => {

        let loan = await models.customerLoan.create({ customerId: customerId, customerLoanCurrentStage: '2', loanStageId: stageId.id, createdBy, modifiedBy }, { transaction: t })

        await models.customerLoanPersonalDetail.create({ loanId: loan.id, customerUniqueId, mobileNumber, panCardNumber, startDate, purpose, kycStatus, createdBy, modifiedBy }, { transaction: t })
        return loan
    })
    return res.status(200).json({ message: 'success', loanId: loanData.id, loanCurrentStage: '2' })

}

//FUNCTION for submitting nominee details 
exports.loanNomineeDetails = async (req, res, next) => {
    let { nomineeName, nomineeAge, relationship, nomineeType, guardianName, guardianAge, guardianRelationship, loanId } = req.body
    let createdBy = req.userData.id;
    let modifiedBy = req.userData.id;

    let checkNominee = await models.customerLoanNomineeDetail.findOne({ where: { loanId: loanId } })

    if (check.isEmpty(checkNominee)) {
        let loanData = await sequelize.transaction(async t => {

            let loan = await models.customerLoan.update({ customerLoanCurrentStage: '3', modifiedBy }, { where: { id: loanId }, transaction: t })

            await models.customerLoanNomineeDetail.create({ loanId: loanId, nomineeName, nomineeAge, relationship, nomineeType, guardianName, guardianAge, guardianRelationship, createdBy, modifiedBy }, { transaction: t })
            return loan
        })
        return res.status(200).json({ message: 'success', loanId: loanId, loanCurrentStage: '3' })
    } else {
        let loanSubmitted = await models.customerLoan.findOne({ where: { id: loanId } })
        let loanData = await sequelize.transaction(async t => {

            if (loanSubmitted.isLoanSubmitted = false) {
                let loan = await models.customerLoan.update({ customerLoanCurrentStage: '3', modifiedBy }, { where: { id: loanId }, transaction: t })
            }

            await models.customerLoanNomineeDetail.update({ nomineeName, nomineeAge, relationship, nomineeType, guardianName, guardianAge, guardianRelationship, createdBy, modifiedBy }, { where: { loanId: loanId }, transaction: t })
            return loan
        })
        return res.status(200).json({ message: 'success', loanId: loanId, loanCurrentStage: '3' })

    }

}


//FUNCTION for submitting ornament details
exports.loanOrnmanetDetails = async (req, res, next) => {

    let { loanOrnaments, totalEligibleAmt, loanId } = req.body
    let allOrnmanets = []
    let createdBy = req.userData.id;
    let modifiedBy = req.userData.id;
    for (let i = 0; i < loanOrnaments.length; i++) {
        loanOrnaments[i]['createdBy'] = createdBy
        loanOrnaments[i]['modifiedBy'] = modifiedBy
        loanOrnaments[i]['loanId'] = loanId
        allOrnmanets.push(loanOrnaments[i])
    }
    let checkOrnaments = await models.customerLoanOrnamentsDetail.findAll({ where: { loanId: loanId } })
    if (checkOrnaments.length == 0) {
        let loanData = await sequelize.transaction(async t => {
            await models.customerLoan.update({ customerLoanCurrentStage: '4', modifiedBy, totalEligibleAmt }, { where: { id: loanId }, transaction: t })

            let ornaments = await models.customerLoanOrnamentsDetail.bulkCreate(allOrnmanets, { transaction: t });
            return ornaments
        })
        return res.status(200).json({ message: 'success', loanId: loanId, loanCurrentStage: '4', totalEligibleAmt, ornaments: loanData })
    } else {

        let loanSubmitted = await models.customerLoan.findOne({ where: { id: loanId } })

        let loanData = await sequelize.transaction(async t => {
            if (loanSubmitted.isLoanSubmitted = false) {
                await models.customerLoan.update({ customerLoanCurrentStage: '4', modifiedBy, totalEligibleAmt }, { where: { id: loanId }, transaction: t })
            }
            let ornaments = await models.customerLoanOrnamentsDetail.bulkCreate(allOrnmanets, {
                updateOnDuplicate: ["loanId", "ornamentType", "quantity", "grossWeight", "netWeight", "deductionWeight", "ornamentImage", "weightMachineZeroWeight", "withOrnamentWeight", "stoneTouch", "acidTest", "karat", "purity", "ltvRange", "purityTest", "ltvPercent", "ltvAmount", "loanAmount", "finalNetWeight", "currentLtvAmount", "modifiedBy"]
            }, { transaction: t })
            return ornaments
        })
        return res.status(200).json({ message: 'success', loanId: loanId, loanCurrentStage: '4', totalEligibleAmt, ornaments: loanData })
    }

}


//FUNCTION for final loan calculator
exports.loanFinalLoan = async (req, res, next) => {
    let { loanFinalCalculator, loanId, intrestTable } = req.body
    let { partnerId, schemeId, finalLoanAmount, loanStartDate, tenure, loanEndDate, paymentFrequency, processingCharge, processingChargeFixed, processingChargePercent, interestRate, unsecuredSchemeId, securedLoanAmount, unsecuredLoanAmount, totalFinalInterestAmt } = loanFinalCalculator

    let createdBy = req.userData.id;
    let modifiedBy = req.userData.id;

    let intrestData = [];
    for (let i = 0; i < intrestTable.length; i++) {
        intrestTable[i]['createdBy'] = createdBy
        intrestTable[i]['modifiedBy'] = modifiedBy
        intrestTable[i]['loanId'] = loanId
        intrestData.push(intrestTable[i])
    }
    let checkFinalLoan = await models.customerFinalLoan.findOne({ where: { loanId: loanId } })

    if (check.isEmpty(checkFinalLoan)) {
        let loanData = await sequelize.transaction(async t => {

            await models.customerLoanIntrestCalculator.bulkCreate(intrestData, { transaction: t });

            await models.customerLoan.update({ customerLoanCurrentStage: '5', modifiedBy, totalFinalInterestAmt: totalFinalInterestAmt }, { where: { id: loanId }, transaction: t })

            let loan = await models.customerFinalLoan.create({ loanId, partnerId, schemeId, finalLoanAmount, loanStartDate, tenure, loanEndDate, paymentFrequency, processingCharge, processingChargeFixed, processingChargePercent, interestRate, unsecuredSchemeId, securedLoanAmount, unsecuredLoanAmount, createdBy, modifiedBy }, { transaction: t });
            return loan
        })
        return res.status(200).json({ message: 'success', loanId: loanId, loanCurrentStage: '5', finalLoanAmount })
    } else {

        let loanSubmitted = await models.customerLoan.findOne({ where: { id: loanId } })

        let loanData = await sequelize.transaction(async t => {

            await models.customerLoanIntrestCalculator.destroy({ where: { loanId: loanId }, transaction: t });

            await models.customerLoanIntrestCalculator.bulkCreate(intrestData, { transaction: t });

            if (loanSubmitted.isLoanSubmitted = false) {
                await models.customerLoan.update({ customerLoanCurrentStage: '5', modifiedBy, totalFinalInterestAmt: totalFinalInterestAmt }, { where: { id: loanId }, transaction: t })
            }

            let loan = await models.customerFinalLoan.update({ partnerId, schemeId, finalLoanAmount, loanStartDate, tenure, loanEndDate, paymentFrequency, processingCharge, processingChargeFixed, processingChargePercent, interestRate, unsecuredSchemeId, securedLoanAmount, unsecuredLoanAmount, createdBy, modifiedBy }, { where: { loanId: loanId }, transaction: t });
            return loan
        })
        return res.status(200).json({ message: 'success', loanId: loanId, loanCurrentStage: '5', finalLoanAmount })
    }


}

//FUNCTION for loan bank details 
exports.loanBankDetails = async (req, res, next) => {
    let { loanId, paymentType, bankName, accountNumber, ifscCode, bankBranchName, accountHolderName, passbookProof } = req.body
    let createdBy = req.userData.id;
    let modifiedBy = req.userData.id;

    let checkBank = await models.customerLoanBankDetail.findOne({ where: { loanId: loanId } })

    if (check.isEmpty(checkBank)) {
        let loanData = await sequelize.transaction(async t => {
            await models.customerLoan.update({ customerLoanCurrentStage: '6', modifiedBy }, { where: { id: loanId }, transaction: t })

            let loan = await models.customerLoanBankDetail.create({ loanId, paymentType, bankName, accountNumber, ifscCode, bankBranchName, accountHolderName, passbookProof, createdBy, modifiedBy }, { transaction: t });
            return loan
        })
        return res.status(200).json({ message: 'success', loanId: loanId, loanCurrentStage: '6' })
    } else {

        let loanSubmitted = await models.customerLoan.findOne({ where: { id: loanId } })

        let loanData = await sequelize.transaction(async t => {
            if (loanSubmitted.isLoanSubmitted = false) {
                await models.customerLoan.update({ customerLoanCurrentStage: '6', modifiedBy }, { where: { id: loanId }, transaction: t })
            }
            let loan = await models.customerLoanBankDetail.update({ paymentType, bankName, accountNumber, ifscCode, bankBranchName, accountHolderName, passbookProof, createdBy, modifiedBy }, { where: { loanId: loanId }, transaction: t });
            return loan
        })
        return res.status(200).json({ message: 'success', loanId: loanId, loanCurrentStage: '6' })
    }

}

//FUNCTION for loan bank details 
exports.loanAppraiserRating = async (req, res, next) => {
    let { loanId,
        applicationFormForAppraiser, goldValuationForAppraiser, loanStatusForAppraiser, commentByAppraiser,
        applicationFormForBM, goldValuationForBM, loanStatusForBM, commentByBM } = req.body
    let createdBy = req.userData.id;
    let modifiedBy = req.userData.id;
    if (req.userData.userTypeId == 7) {
        let loanData = await sequelize.transaction(async t => {
            if (loanStatusForAppraiser == "approved") {
                let stageId = await models.loanStage.findOne({ where: { name: 'bm rating' }, transaction: t })
                await models.customerLoan.update({
                    applicationFormForAppraiser, goldValuationForAppraiser, loanStatusForAppraiser, commentByAppraiser, modifiedBy, appraiserId: modifiedBy, isLoanSubmitted: true, loanStageId: stageId.id
                }, { where: { id: loanId }, transaction: t })
            } else {
                let stageId = await models.loanStage.findOne({ where: { name: 'appraiser rating' }, transaction: t })
                await models.customerLoan.update({
                    applicationFormForAppraiser, goldValuationForAppraiser, loanStatusForAppraiser, commentByAppraiser, modifiedBy, appraiserId: modifiedBy, isLoanSubmitted: true, loanStageId: stageId.id
                }, { where: { id: loanId }, transaction: t })
            }
        })
        return res.status(200).json({ message: 'success' })

    }

    if (req.userData.userTypeId == 5) {

        let checkAppraiserVerified = await models.customerLoan.findOne({ where: { loanStatusForAppraiser: "approved", id: loanId } })
        if (check.isEmpty(checkAppraiserVerified)) {
            return res.status(400).json({ message: `Appraiser rating not verified` })
        }
        if (checkAppraiserVerified.loanStatusForBM == "approved" || checkAppraiserVerified.loanStatusForBM == "rejected") {
            return res.status(400).json({ message: `You cannot change status for this customer` })
        }
        let bmId = req.userData.id
        var loanUniqueId = null;
        if (loanStatusForBM === 'approved') {
            if (applicationFormForBM == true && goldValuationForBM == true) {
                loanUniqueId = `LOAN${Math.floor(1000 + Math.random() * 9000)}`;
            } else {
                return res.status(400).json({ message: `One of field is not verified` })
            }
        }

        if (loanStatusForBM !== "approved") {
            if (loanStatusForBM == 'incomplete') {
                let incompleteStageId = await models.loanStage.findOne({ where: { name: 'appraiser rating' } })
                await sequelize.transaction(async (t) => {
                    await models.customerLoan.update(
                        { loanStatusForAppraiser: "pending", applicationFormForBM, goldValuationForBM, loanStatusForBM, loanStageId: incompleteStageId.id, bmId, commentByBM, modifiedBy },
                        { where: { id: loanId }, transaction: t })

                })
                return res.status(200).json({ message: 'success' })
            } else {
                let rejectedStageId = await models.loanStage.findOne({ where: { name: 'bm rating' } })

                await sequelize.transaction(async (t) => {
                    await models.customerLoan.update(
                        { applicationFormForBM, goldValuationForBM, loanStageId: rejectedStageId.id, bmId, loanStatusForBM, commentByBM, modifiedBy },
                        { where: { id: loanId }, transaction: t })
                })
                return res.status(200).json({ message: 'success' })
            }
        } else {
            let approvedStageId = await models.loanStage.findOne({ where: { name: 'assign packet' } })

            await sequelize.transaction(async (t) => {
                await models.customerLoan.update({ loanUniqueId, applicationFormForBM, loanStageId: approvedStageId.id, goldValuationForBM, loanStatusForBM, bmId, commentByBM, modifiedBy }, { where: { id: loanId }, transaction: t })
            })
            return res.status(200).json({ message: 'success' })
        }
    }
}

//get single customer loan details
exports.getSingleLoanDetails = async (req, res, next) => {

    let { customerLoanId } = req.query

    let customerLoan = await models.customerLoan.findOne({
        where: { id: customerLoanId },
        // attributes: { exclude: ['createdAt', 'updatedAt', 'createdBy', 'modifiedBy', 'isActive'] },
        include: [{
            model: models.loanStage,
            as: 'loanStage',
            attributes: ['id', 'name']
        }, {
            model: models.customerLoanPersonalDetail,
            as: 'loanPersonalDetail',
            // attributes: { exclude: ['createdAt', 'updatedAt', 'createdBy', 'modifiedBy', 'isActive'] }
        }, {
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
            // attributes: { exclude: ['createdAt', 'updatedAt', 'createdBy', 'modifiedBy', 'isActive'] }
        },
        {
            model: models.customerLoanIntrestCalculator,
            as: 'customerLoanIntrestCalculator',
        },
        {
            model: models.customerFinalLoan,
            as: 'finalLoan',
            // attributes: { exclude: ['createdAt', 'updatedAt', 'createdBy', 'modifiedBy', 'isActive'] },
            include: [
                {
                    model: models.scheme,
                    as: 'scheme'
                }, {
                    model: models.scheme,
                    as: 'unsecuredScheme'
                }
            ]
        },
        {
            model: models.customerLoanPackageDetails,
            as: 'loanPacketDetails',
            // attributes: { exclude: ['createdAt', 'updatedAt', 'createdBy', 'modifiedBy', 'isActive'] },
            include: [{
                model: models.packet,
                as: 'packet',
                attributes: ['id', 'packetUniqueId'],
            }]
        }, {
            model: models.customer,
            as: 'customer',
            attributes: ['id', 'firstName', 'lastName', 'panType', 'panImage']
        },
        {
            model: models.customerLoanIntrestCalculator,
            as: 'customerLoanIntrestCalculator',
        }]
    });

    let ornamentType = [];
    for (let ornamentsDetail of customerLoan.loanOrnamentsDetail) {
        ornamentType.push({ ornamentType: ornamentsDetail.ornamentType, id: ornamentsDetail.id })
    }
    customerLoan.dataValues.ornamentType = ornamentType;
    return res.status(200).json({ message: 'success', data: customerLoan })
}

//  FUNCTION FOR GET APPLIED LOAN DETAILS
exports.appliedLoanDetails = async (req, res, next) => {
    let { schemeId, appraiserApproval, bmApproval, loanStageId } = req.query
    let { search, offset, pageSize } =
        paginationFUNC.paginationWithFromTo(req.query.search, req.query.from, req.query.to);

    let query = {};
    if (schemeId) {
        schemeId = req.query.schemeId.split(",");
        query["$finalLoan.scheme_id$"] = schemeId;
    }
    if (appraiserApproval) {
        appraiserApproval = req.query.appraiserApproval.split(",");
        query.loanStatusForAppraiser = appraiserApproval
    }
    if (bmApproval) {
        appraiserApproval = req.query.bmApproval.split(",");
        query.loanStatusForBM = bmApproval
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
                appraiser_status: sequelize.where(
                    sequelize.cast(sequelize.col("customerLoan.loan_status_for_appraiser"), "varchar"),
                    {
                        [Op.iLike]: search + "%",
                    }
                ),
                bm_status: sequelize.where(
                    sequelize.cast(sequelize.col("customerLoan.loan_status_for_bm"), "varchar"),
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
    },
    {
        model: models.customerFinalLoan,
        as: 'finalLoan',
        where: { isActive: true },
        attributes: ['loanStartDate', 'finalLoanAmount', 'schemeId'],
        include: [{
            model: models.scheme,
            as: 'scheme',
            attributes: ['id', 'schemeName']
        }]
    }]

    let appliedLoanDetails = await models.customerLoan.findAll({
        where: searchQuery,
        include: associateModel,
        attributes: ['id', 'loanStatusForAppraiser', 'loanStatusForBM', 'loanStageId'],
        order: [
            ['id', 'DESC']
        ],
        offset: offset,
        limit: pageSize,

    });
    let count = await models.customerLoan.findAll({
        where: searchQuery,
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

    let { loanId, packageImageData } = req.body;
    let createdBy = req.userData.id;
    let modifiedBy = req.userData.id;
    let loanDetails = await models.customerLoan.getLoanDetailById(loanId);

    let getPackets = await models.customerLoanPackageDetails.findAll({ where: { loanId: loanId } })
    if (!check.isEmpty(getPackets)) {
        return res.status(400).json({ message: `Packets has been already assign` })
    }

    if (loanDetails !== null && loanDetails.loanUniqueId !== null && loanDetails.loanStatusForBM === 'approved') {
        //FOR PACKETS DETAILES 
        let finalPackageData = await packageImageData.map(function (ele) {
            let obj = Object.assign({}, ele);
            obj.isActive = true;
            obj.loanId = loanId;
            obj.createdBy = createdBy;
            obj.modifiedBy = modifiedBy;
            return obj;
        })

        //FOR PACKET UPDATE
        let packetArray = await packageImageData.map(ele => {
            return ele.packetId
        })
        let packetUpdateArray = await packetArray.map(ele => {
            let obj = {}
            obj.id = ele;
            obj.customerId = loanDetails.customerId;
            obj.loanId = loanId;
            obj.modifiedBy = modifiedBy
            obj.packetAssigned = true;
            return obj
        })

        await sequelize.transaction(async (t) => {
            let stageId = await models.loanStage.findOne({ where: { name: 'disbursement pending' }, transaction: t })

            await models.customerLoan.update({ loanStageId: stageId.id }, { where: { id: loanId }, transaction: t })

            await models.customerLoanPackageDetails.bulkCreate(finalPackageData, { returning: true, transaction: t })

            let d = await models.packet.bulkCreate(packetUpdateArray, {
                updateOnDuplicate: ["customerId", "loanId", "modifiedBy", "packetAssigned"]
            }, { transaction: t })
        })

        return res.status(200).json({ message: `Packets added successfully` })

    } else {
        res.status(404).json({ message: 'Given loan id is not proper' })
    }
}

exports.disbursementOfLoanBankDetails = async (req, res,next) => {
    let { loanId } = req.query;
    let createdBy =  req.userData.id; 
    let userBankDetails = await models.customerLoanBankDetail.findOne({
         where: { loanId: loanId },
        attributes: ['paymentType','bankName', 'bankBranchName', 'accountType', 'accountHolderName',
         'accountNumber','ifscCode'] 
    });
    let loanbrokerId = await models.userInternalBranch.findOne({ where: { userId: createdBy } });
    let brokerBankDetails = await models.internalBranch.findOne({
        where: { id: loanbrokerId.internalBranchId },
        attributes: ['bankName','bankBranch', 'accountHolderName', 'accountNumber','ifscCode']
        });
        
    let checkFinalLoan = await models.customerFinalLoan.findOne({ where: { loanId: loanId } })
    let data = {
        userBankDetail: userBankDetails,
        branchBankDetail: brokerBankDetails,
        paymentType: userBankDetails.paymentType,
        finalLoanAmount: checkFinalLoan.finalLoanAmount
    }
    return res.status(200).json({ message: 'success', data: data})

}


//  FUNCTION FOR DISBURSEMENT OF LOAN AMOUNT
exports.disbursementOfLoanAmount = async (req, res, next) => {

    let { loanId, transactionId, date, paymentMode, ifscCode,bankName, bankBranch, 
        accountHolderName,accountNumber,disbursementStatus } = req.body;
    let createdBy = req.userData.id;
    let modifiedBy = req.userData.id;
    let loanDetails = await models.customerLoan.getLoanDetailById(loanId);
    let matchStageId = await models.loanStage.findOne({ where: { name: 'disbursement pending' } })

    if (loanDetails.loanStageId == matchStageId.id) {
        let stageId = await models.loanStage.findOne({ where: { name: 'disbursed' } })

        await sequelize.transaction(async (t) => {
            await models.customerLoan.update({ loanStageId: stageId.id }, { where: { id: loanId }, transaction: t })
            await models.customerLoanDisbursement.create({ loanId, transactionId, date, paymentMode, ifscCode,bankName, bankBranch, 
                accountHolderName,accountNumber,disbursementStatus, createdBy, modifiedBy }, { transaction: t })
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
                "$finalLoan.final_loan_amount$": { [Op.iLike]: search + '%' },
                "$finalLoan.interest_rate$": { [Op.iLike]: search + '%' },
                tenure: sequelize.where(
                    sequelize.cast(sequelize.col("finalLoan.tenure"), "varchar"),
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

    let associateModel = [{
        model: models.customer,
        as: 'customer',
        where: internalBranchWhere,
        attributes: { exclude: ['mobileNumber', 'createdAt', 'updatedAt', 'createdBy', 'modifiedBy', 'isActive'] }
    },
    {
        model: models.customerFinalLoan,
        as: 'finalLoan',
        where: { isActive: true },
        attributes: { exclude: ['createdAt', 'updatedAt', 'createdBy', 'modifiedBy', 'isActive'] },
        include: [{
            model: models.scheme,
            as: 'scheme',
            attributes: ['id', 'schemeName']
        }]
    }]

    let loanDetails = await models.customerLoan.findAll({
        where: searchQuery,
        include: associateModel,
        attributes: ['id', 'loanUniqueId'],
        order: [
            ['id', 'DESC']
        ],
        offset: offset,
        limit: pageSize
    });
    let count = await models.customerLoan.findAll({
        where: searchQuery,
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

//  FUNCTION FOR LOAN APPLICATION FORM
exports.applyForLoanApplication = async (req, res, next) => {

    let { customerId, totalEligibleAmt, totalFinalInterestAmt, loanApproval, loanBank, loanOrnmanets, loanFinalCalculator, loanPersonal, loanKyc, loanNominee } = req.body

    let checkKycStatus = await models.customer.findOne({ where: { id: customerId, kycStatus: "approved" } })
    if (check.isEmpty(checkKycStatus)) {
        return res.status(400).json({ message: `customer Kyc status is not approved` })
    }
    let createdBy = req.userData.id;
    let modifiedBy = req.userData.id;
    //customerLoan
    let { applicationFormForAppraiser,
        goldValuationForAppraiser, loanStatusForAppraiser, commentByAppraiser } = loanApproval

    // customerLoanBank
    let { bankName, accountNumber, ifscCode, bankBranchName, accountType, accountHolderName, passbookProof } = loanBank

    // customerLoanKycAddress
    let { identityTypeId, identityProof, idCardNumber, permanentAddProofTypeId, permanentAddress, permanentAddStateId, permanentAddCityId, permanentAddPin, permanentAddProof, permanentAddCardNumber, residentialAddProofTypeId, residentialAddress, residentialAddStateId, residentialAddCityId, residentialAddPin, residentialAddProof, residentialAddCardNumber } = loanKyc

    //customerLoanNominee
    let { nomineeName, nomineeAge, relationship, nomineeType, guardianName, guardianAge, guardianRelationship } = loanNominee

    //customerFinalLoan
    let { partnerId, schemeId, finalLoanAmount, loanStartDate, tenure, loanEndDate, paymentFrequency, processingCharge, processingChargeFixed, processingChargePercent, interestRate } = loanFinalCalculator

    //customerPersonal
    let { customerUniqueId, mobileNumber, panCardNumber, startDate } = loanPersonal

    //customerLoanOrnamanetsDetails
    // console.log(loanOrnmanets)

    let appliedForLoanApplication = await sequelize.transaction(async t => {
        // customerLoan
        let customerLoanCreated;
        if (loanStatusForAppraiser == "approved") {
            let stageId = await models.loanStage.findOne({ where: { name: 'bm rating' }, transaction: t })

            customerLoanCreated = await models.customerLoan.create({
                customerId, applicationFormForAppraiser,
                goldValuationForAppraiser, loanStatusForAppraiser, commentByAppraiser, totalEligibleAmt, totalFinalInterestAmt, createdBy, modifiedBy, loanStageId: stageId.id
            }, { transaction: t })
        } else {
            let stageId = await models.loanStage.findOne({ where: { name: 'appraiser rating' }, transaction: t })

            customerLoanCreated = await models.customerLoan.create({
                customerId, applicationFormForAppraiser,
                goldValuationForAppraiser, loanStatusForAppraiser, commentByAppraiser, totalEligibleAmt, totalFinalInterestAmt, createdBy, modifiedBy, loanStageId: stageId.id
            }, { transaction: t })
        }

        let loanId = customerLoanCreated.id;

        // customerLoanBank
        await models.customerLoanBankDetail.create({
            loanId, bankName, accountNumber, ifscCode, bankBranchName, accountType, accountHolderName, passbookProof, createdBy, modifiedBy
        }, { transaction: t });

        //customerLoanKycAddress
        await models.customerLoanKycDetail.create({
            loanId, identityTypeId, identityProof, idCardNumber, permanentAddProofTypeId, permanentAddress, permanentAddStateId, permanentAddCityId, permanentAddPin, permanentAddProof,
            permanentAddCardNumber, residentialAddProofTypeId, residentialAddress, residentialAddStateId, residentialAddCityId, residentialAddPin, residentialAddProof,
            residentialAddCardNumber, createdBy, modifiedBy
        }, { transaction: t });

        //customerLoanNominee
        await models.customerLoanNomineeDetail.create({
            loanId, nomineeName, nomineeAge, relationship, nomineeType, guardianName, guardianAge, guardianRelationship, createdBy, modifiedBy
        }, { transaction: t });

        //customerPersonalData
        await models.customerLoanPersonalDetail.create({
            loanId, customerUniqueId, mobileNumber, panCardNumber, startDate, createdBy, modifiedBy
        }, { transaction: t });

        //customerFinalLoan
        await models.customerFinalLoan.create({
            loanId, partnerId, schemeId, finalLoanAmount, loanStartDate, tenure, loanEndDate, paymentFrequency, processingCharge, processingChargeFixed, processingChargePercent, interestRate, createdBy, modifiedBy
        }, { transaction: t })

        let allOrnmanets = []
        for (let i = 0; i < loanOrnmanets.length; i++) {
            loanOrnmanets[i]['createdBy'] = createdBy
            loanOrnmanets[i]['modifiedBy'] = modifiedBy
            loanOrnmanets[i]['loanId'] = loanId
            allOrnmanets.push(loanOrnmanets[i])
        }

        //customerOrnamentDetails
        await models.customerLoanOrnamentsDetail.bulkCreate(allOrnmanets, { transaction: t });

    })


    return res.status(201).json({ message: 'you have successfully applied for the loan' });
}

//  FUNCTION TO UPDATE CUSTOMER ORNAMENTS DETAILS
exports.updateCustomerLoanDetail = async (req, res, next) => {
    let { totalEligibleAmt, totalFinalInterestAmt, loanApproval, loanOrnmanets, loanFinalCalculator, loanNominee } = req.body;
    let loanId = req.params.loanId;
    let modifiedBy = req.userData.id;

    //customerFinalLoan
    let { partnerId, schemeId, finalLoanAmount, loanStartDate, tenure, loanEndDate, paymentFrequency, processingCharge, processingChargeFixed, processingChargePercent, interestRate } = loanFinalCalculator

    //customerLoanNominee
    let { nomineeName, nomineeAge, relationship, nomineeType, guardianName, guardianAge, guardianRelationship } = loanNominee

    //customerLoan
    let { applicationFormForAppraiser,
        goldValuationForAppraiser, loanStatusForAppraiser, commentByAppraiser, applicationFormForBM, goldValuationForBM, loanStatusForBM, commentByBM } = loanApproval
    let cutomerLoanApproval = {}

    let user = await models.user.findOne({ where: { id: req.userData.id } });

    if (user.userTypeId == 7) {
        let stageId;
        if (loanStatusForAppraiser == 'approved') {
            stageId = await models.loanStage.findOne({ where: { name: 'bm rating' } })
        } else {
            stageId = await models.loanStage.findOne({ where: { name: 'appraiser rating' } })
        }

        cutomerLoanApproval['loanStageId'] = stageId.id
        cutomerLoanApproval['applicationFormForAppraiser'] = applicationFormForAppraiser
        cutomerLoanApproval['goldValuationForAppraiser'] = goldValuationForAppraiser
        cutomerLoanApproval['loanStatusForAppraiser'] = loanStatusForAppraiser
        cutomerLoanApproval['commentByAppraiser'] = commentByAppraiser
        cutomerLoanApproval['totalEligibleAmt'] = totalEligibleAmt
        cutomerLoanApproval['totalFinalInterestAmt'] = totalFinalInterestAmt
        cutomerLoanApproval['modifiedBy'] = modifiedBy
    }

    if (user.userTypeId == 5) {
        var loanUniqueId = null;
        if (loanStatusForBM === 'approved') {
            if (applicationFormForBM == true && goldValuationForBM == true) {
                loanUniqueId = `LOAN${Math.floor(1000 + Math.random() * 9000)}`;
            } else {
                return res.status(400).json({ message: `One of field is not verified` })
            }
        }

        let stageId;
        if (loanStatusForBM == 'approved') {
            stageId = await models.loanStage.findOne({ where: { name: 'assign packet' } })
        } else {
            stageId = await models.loanStage.findOne({ where: { name: 'bm rating' } })
        }

        cutomerLoanApproval['loanStageId'] = stageId.id
        cutomerLoanApproval['applicationFormForBM'] = applicationFormForBM
        cutomerLoanApproval['goldValuationForBM'] = goldValuationForBM
        cutomerLoanApproval['loanStatusForBM'] = loanStatusForBM
        cutomerLoanApproval['commentByBM'] = commentByBM
        cutomerLoanApproval['totalEligibleAmt'] = totalEligibleAmt
        cutomerLoanApproval['totalFinalInterestAmt'] = totalFinalInterestAmt
        cutomerLoanApproval['modifiedBy'] = modifiedBy
        cutomerLoanApproval['loanUniqueId'] = loanUniqueId
    }

    let updateLoanApplication = await sequelize.transaction(async t => {

        // customerLoan
        await models.customerLoan.update(cutomerLoanApproval, { where: { id: loanId }, transaction: t })
        //customerLoanNominee
        await models.customerLoanNomineeDetail.update({
            nomineeName, nomineeAge, relationship, nomineeType, guardianName, guardianAge, guardianRelationship, modifiedBy
        }, { where: { loanId }, transaction: t });

        //customerFinalLoan
        await models.customerFinalLoan.update({
            partnerId, schemeId, finalLoanAmount, loanStartDate, tenure, loanEndDate, paymentFrequency, processingCharge, processingChargeFixed, processingChargePercent, interestRate, modifiedBy
        }, { where: { loanId }, transaction: t })


        let allOrnmanets = []
        for (let i = 0; i < loanOrnmanets.length; i++) {
            loanOrnmanets[i]['modifiedBy'] = modifiedBy
            loanOrnmanets[i]['loanId'] = loanId
            allOrnmanets.push(loanOrnmanets[i])
        }

        let d = await models.customerLoanOrnamentsDetail.bulkCreate(allOrnmanets, {
            updateOnDuplicate: ["loanId", "ornamentType", "quantity", "grossWeight", "netWeight", "deductionWeight", "ornamentImage", "weightMachineZeroWeight", "withOrnamentWeight", "stoneTouch", "acidTest", "karat", "purity", "ltvRange", "purityTest", "ltvPercent", "ltvAmount", "loanAmount", "finalNetWeight", "currentLtvAmount"]
        }, { transaction: t })

    })
    return res.status(200).json({ message: 'success' });

}

