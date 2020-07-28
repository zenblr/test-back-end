const models = require('../../models');
const sequelize = models.sequelize;
const Sequelize = models.Sequelize;
const Op = Sequelize.Op;
const { paginationWithFromTo } = require("../../utils/pagination");
const check = require("../../lib/checkLib");
const action = require('../../utils/partReleaseHistory');


exports.ornamentsDetails = async (req, res, next) => {

    let masterLoanId = req.params.masterLoanId;

    let customerLoan = await models.customerLoanMaster.findOne({
        where: { id: masterLoanId },
        attributes: ['customerId', 'masterLoanUniqueId', 'finalLoanAmount', 'tenure', 'loanStartDate', 'loanEndDate'],
        include: [
            {
                model: models.customerLoan,
                as: 'customerLoan',
                attributes: ['masterLoanId', 'loanUniqueId', 'loanAmount']
            },
            {
                model: models.customerLoanPersonalDetail,
                as: 'loanPersonalDetail',
                attributes: ['customerUniqueId']
            }, {
                model: models.customerLoanOrnamentsDetail,
                as: 'loanOrnamentsDetail',
                include: [
                    {
                        model: models.ornamentType,
                        as: "ornamentType",
                        attributes: ['name', 'id'],
                        include: [{
                            model: models.packetOrnament,
                            as: 'packetOrnament',
                            attributes: ['packetId', 'id', 'ornamentTypeId'],
                            include: [{
                                model: models.packet,
                                as: "packet"
                            }]
                        }]
                    },
                    {
                        model: models.partRelease,
                        attributes: ['partReleaseStatus', 'releaseDate']
                    }
                ]
            }]
    });
    let lastPayment = await getLoanLastPayment(masterLoanId);
    return res.status(200).json({ message: 'success', customerLoan, lastPayment })
}

async function getLoanLastPayment(masterLoanId) {
    let lastPayment = await models.customerLoanInterest.findOne({
        where: { masterLoanId: masterLoanId, emiStatus: "complete" },
        order: [["updatedAt", "DESC"]],
    });
    return lastPayment;
}

async function getGoldRate() {
    let goldRate = await models.goldRate.findOne({
        order: [["updatedAt", "DESC"]],
        attributes: ['goldRate']
    })
    return goldRate.goldRate;
}

async function getLoanDetails(masterLoanId) {
    let loanData = await models.customerLoanMaster.findOne({
        where: { id: masterLoanId }
    })
    return loanData;
}

async function getGlobalSetting() {
    let globalSettings = await models.globalSetting.getGlobalSetting();
    return globalSettings;
}

async function ornementsDetails(masterLoanId, whereBlock) {
    let ornaments = await models.customerLoanMaster.findOne({
        where: { id: masterLoanId },
        attributes: ['customerId', 'masterLoanUniqueId', 'finalLoanAmount', 'tenure', 'loanStartDate', 'loanEndDate'],
        include: [{
            model: models.customerLoanOrnamentsDetail,
            as: 'loanOrnamentsDetail',
            where: whereBlock,
            include: [
                {
                    model: models.ornamentType,
                    as: "ornamentType",
                    attributes: ['name', 'id'],
                    include: [{
                        model: models.packetOrnament,
                        as: 'packetOrnament',
                        attributes: ['packetId', 'id', 'ornamentTypeId'],
                        include: [{
                            model: models.packet,
                            as: "packet"
                        }]
                    }]
                }
            ]
        }]
    });
    return ornaments;
}

async function getornamentsWeightInfo(requestedOrnaments, otherOrnaments, loanData) {
    let ornamentsWeightInfo = {
        releaseGrossWeight: 0,
        releaseDeductionWeight: 0,
        releaseNetWeight: 0,
        remainingGrossWeight: 0,
        remainingDeductionWeight: 0,
        remainingNetWeight: 0,
        releaseAmount: 0,
        currentLtv: 0,
        previousLtv: 0,
        outstandingAmount: 0
    }
    let globalSettings = await getGlobalSetting();
    let goldRate = await getGoldRate();
    ornamentsWeightInfo.currentLtv = goldRate * (globalSettings.ltvGoldValue / 100);
    ornamentsWeightInfo.previousLtv = requestedOrnaments.loanOrnamentsDetail[0].currentLtvAmount;
    if (requestedOrnaments != null) {
        for (const ornaments of requestedOrnaments.loanOrnamentsDetail) {
            ornamentsWeightInfo.releaseGrossWeight = ornamentsWeightInfo.releaseGrossWeight + parseFloat(ornaments.grossWeight);
            ornamentsWeightInfo.releaseDeductionWeight = ornamentsWeightInfo.releaseDeductionWeight + parseFloat(ornaments.deductionWeight);
            ornamentsWeightInfo.releaseNetWeight = ornamentsWeightInfo.releaseNetWeight + parseFloat(ornaments.netWeight);
            if (otherOrnaments == null) {
                let ltvAmount = ornamentsWeightInfo.currentLtv * (ornaments.ltvPercent / 100)
                ornamentsWeightInfo.outstandingAmount = ornamentsWeightInfo.outstandingAmount + (ltvAmount * parseFloat(ornaments.netWeight));
            }
        }
    }
    if (otherOrnaments != null) {
        for (const ornaments of otherOrnaments.loanOrnamentsDetail) {
            ornamentsWeightInfo.remainingGrossWeight = ornamentsWeightInfo.remainingGrossWeight + parseFloat(ornaments.grossWeight);
            ornamentsWeightInfo.remainingDeductionWeight = ornamentsWeightInfo.remainingDeductionWeight + parseFloat(ornaments.deductionWeight);
            ornamentsWeightInfo.remainingNetWeight = ornamentsWeightInfo.remainingNetWeight + parseFloat(ornaments.netWeight);
            let ltvAmount = ornamentsWeightInfo.currentLtv * (ornaments.ltvPercent / 100)
            ornamentsWeightInfo.releaseAmount = ornamentsWeightInfo.releaseAmount + (ltvAmount * parseFloat(ornaments.netWeight));
        }
        ornamentsWeightInfo.releaseAmount = parseFloat(loanData.finalLoanAmount) - Math.round(ornamentsWeightInfo.releaseAmount)
    }

    ornamentsWeightInfo.outstandingAmount = Math.round(ornamentsWeightInfo.outstandingAmount);
    return ornamentsWeightInfo;
}

async function getornamentLoanInfo(masterLoanId, ornamentWeight) {
    let loanData = await models.customerLoan.findAll({ where: { masterLoanId }, attributes: ['loanUniqueId'] });
    let loanAmountData = await models.customerLoanMaster.findOne({ where: { id: masterLoanId }, attributes: ['finalLoanAmount'] });
    let loanDetails = {
        loanData,
        finalLoanAmount: 0,
        interestAmount: 0,
        penalInterest: 0,
        totalPayableAmount: 0,
    }
    loanDetails.totalPayableAmount = ornamentWeight.releaseAmount;
    loanDetails.finalLoanAmount = loanAmountData.finalLoanAmount;
    return loanDetails;
}

exports.ornamentsAmountDetails = async (req, res, next) => {
    let { masterLoanId, ornamentId } = req.body;
    let whereSelectedOrmenemts = { id: { [Op.in]: ornamentId }, isActive: true };
    let whereOtherOrmenemts = { id: { [Op.notIn]: ornamentId }, isActive: true };
    let loanData = await getLoanDetails(masterLoanId);
    let requestedOrnaments = await ornementsDetails(masterLoanId, whereSelectedOrmenemts);
    let otherOrnaments = await ornementsDetails(masterLoanId, whereOtherOrmenemts);
    let ornamentWeight = await getornamentsWeightInfo(requestedOrnaments, otherOrnaments, loanData);
    let loanInfo = await getornamentLoanInfo(masterLoanId, ornamentWeight);
    return res.status(200).json({ message: 'success', ornamentWeight, loanInfo });
}

exports.ornamentsPartRelease = async (req, res, next) => {
    let { paymentType, paidAmount, bankName, chequeNumber, ornamentId, depositDate, branchName, transactionId, masterLoanId, releaseAmount, interestAmount, penalInterest, payableAmount, releaseGrossWeight, releaseDeductionWeight, releaseNetWeight, remainingGrossWeight, remainingDeductionWeight, remainingNetWeight, currentLtv
    } = req.body;
    let createdBy = req.userData.id;
    let modifiedBy = req.userData.id;
    if (paymentType == 'cash') {
        let partRelease = await sequelize.transaction(async t => {
            let addPartRelease = await models.partRelease.create({ paymentType, paidAmount, depositDate, masterLoanId, releaseAmount, interestAmount, penalInterest, payableAmount, releaseGrossWeight, releaseDeductionWeight, releaseNetWeight, remainingGrossWeight, remainingDeductionWeight, remainingNetWeight, currentLtv, amountStatus: 'completed', createdBy, modifiedBy }, { transaction: t });
            for (const ornament of ornamentId) {
                await models.customerLoanOrnamentsDetail.update({ isReleased: true }, { where: { id: ornament }, transaction: t })
                await models.partReleaseOrnaments.create({ partReleaseId: addPartRelease.id, ornamentId: ornament }, { transaction: t });
            }
            await models.partReleaseHistory.create({ partReleaseId: addPartRelease.id, action: action.PART_RELEASE_PAYMENT_CASH, createdBy, modifiedBy }, { transaction: t });
            return addPartRelease
        });
        return res.status(200).json({ message: "success", partRelease });
    } else if (paymentType == 'cheque') {
        let partRelease = await sequelize.transaction(async t => {
            let addPartRelease = await models.partRelease.create({ paymentType, paidAmount, bankName, chequeNumber, branchName, depositDate, masterLoanId, releaseAmount, interestAmount, penalInterest, payableAmount, releaseGrossWeight, releaseDeductionWeight, releaseNetWeight, remainingGrossWeight, remainingDeductionWeight, remainingNetWeight, currentLtv, createdBy, modifiedBy }, { transaction: t });
            for (const ornament of ornamentId) {
                await models.customerLoanOrnamentsDetail.update({ isReleased: true }, { where: { id: ornament }, transaction: t })
                await models.partReleaseOrnaments.create({ partReleaseId: addPartRelease.id, ornamentId: ornament }, { transaction: t });
            }
            await models.partReleaseHistory.create({ partReleaseId: addPartRelease.id, action: action.PART_RELEASE_PAYMENT_CHEQUE, createdBy, modifiedBy }, { transaction: t });
            return addPartRelease
        });
        return res.status(200).json({ message: "success", partRelease });
    } else if (paymentType == 'IMPS') {
        let partRelease = await sequelize.transaction(async t => {
            let addPartRelease = await models.partRelease.create({ paymentType, bankName, branchName, transactionId, paidAmount, depositDate, masterLoanId, releaseAmount, interestAmount, penalInterest, payableAmount, releaseGrossWeight, releaseDeductionWeight, releaseNetWeight, remainingGrossWeight, remainingDeductionWeight, remainingNetWeight, currentLtv, createdBy, modifiedBy }, { transaction: t });
            for (const ornament of ornamentId) {
                await models.customerLoanOrnamentsDetail.update({ isReleased: true }, { where: { id: ornament }, transaction: t })
                await models.partReleaseOrnaments.create({ partReleaseId: addPartRelease.id, ornamentId: ornament }, { transaction: t });
            }
            await models.partReleaseHistory.create({ partReleaseId: addPartRelease.id, action: action.PART_RELEASE_PAYMENT_BANK, createdBy, modifiedBy }, { transaction: t });
            return addPartRelease
        });
        return res.status(200).json({ message: "success", partRelease });
    } else {
        return res.status(400).json({ message: 'invalid paymentType' });
    }
}

exports.getPartReleaseList = async (req, res, next) => {
    const { search, offset, pageSize } = paginationWithFromTo(
        req.query.search,
        req.query.from,
        req.query.to
    );
    const searchQuery = {
        isActive: true
    }
    let includeArray = [{
        model: models.customerLoanMaster,
        as: 'masterLoan',
        attributes: ['customerId', 'masterLoanUniqueId', 'finalLoanAmount', 'tenure', 'loanStartDate', 'loanEndDate'],
        include: [
            {
                model: models.customer,
                as: 'customer',
                attributes: ['customerUniqueId', 'firstName', 'lastName', 'mobileNumber']
            },
            {
                model: models.customerLoan,
                as: 'customerLoan',
                attributes: ['masterLoanId', 'loanUniqueId', 'loanAmount', 'customerId']
            },
            {
                model: models.customerLoanPersonalDetail,
                as: 'loanPersonalDetail',
                attributes: ['customerUniqueId']
            }]
    }, {
        model: models.customerLoanOrnamentsDetail
    }, {
        model: models.partReleaseAppraiser,
        as: 'appraiserData',
        attributes: { exclude: ['createdAt', 'createdBy', 'modifiedBy', 'isActive'] },
        include: [
            {
                model: models.customer,
                as: 'customer',
                attributes: ['customerUniqueId', 'firstName', 'lastName', 'mobileNumber']
            },
            {
                model: models.user,
                as: 'appraiser',
                attributes: ['firstName', 'lastName', 'mobileNumber']
            }
        ]
    }
    ]
    let partRelease = await models.partRelease.findAll({
        where: searchQuery,
        attributes: { exclude: ['createdAt', 'createdBy', 'modifiedBy', 'isActive'] },
        order: [["updatedAt", "DESC"]],
        offset: offset,
        limit: pageSize,
        include: includeArray
    })

    let count = await models.partRelease.findAll({
        where: searchQuery,
        include: includeArray
    })

    return res.status(200).json({ data: partRelease, count: count.length });
}

exports.updateAmountStatus = async (req, res, next) => {
    let { amountStatus, partReleaseId } = req.body;
    let modifiedBy = req.userData.id;
    let createdBy = req.userData.id;
    let partReleaseData = await models.partRelease.findOne({ where: { id: partReleaseId }, attributes: ['amountStatus'] });
    if (partReleaseData) {
        if (partReleaseData.amountStatus == 'pending' || partReleaseData.amountStatus == 'rejected') {
            if (amountStatus == 'completed') {
                await sequelize.transaction(async t => {
                    await models.partRelease.update({ amountStatus: 'completed', modifiedBy }, { where: { id: partReleaseId }, transaction: t });
                    await models.partReleaseHistory.create({ partReleaseId: partReleaseId, action: action.PART_RELEASE_AMOUNT_STATUS_C, createdBy, modifiedBy }, { transaction: t });
                });
                return res.status(200).json({ message: "success" });
            } else if (amountStatus == 'rejected') {
                await sequelize.transaction(async t => {
                    await models.partRelease.update({ amountStatus: 'rejected', modifiedBy }, { where: { id: partReleaseId }, transaction: t });
                    await models.partReleaseHistory.create({ partReleaseId: partReleaseId, action: action.PART_RELEASE_AMOUNT_STATUS_R, createdBy, modifiedBy }, { transaction: t });
                });
                return res.status(200).json({ message: "success" });
            }
        } else { return res.status(400).json({ message: "you can't change status as it's already updated" }); }
    } else {
        return res.status(404).json({ message: "Data not found" });
    }

}

exports.getCustomerDetails = async (req, res, next) => {
    let customerId = req.params.customerId;
    let customerData = await models.customer.findOne({ where: { id: customerId }, attributes: ['customerUniqueId', 'firstName', 'lastName', 'mobileNumber'] });
    return res.status(200).json({ customerData });
}

exports.partReleaseAssignAppraiser = async (req, res, next) => {

    let { partReleaseId, appraiserId, customerId, appoinmentDate, startTime, endTime } = req.body;
    let createdBy = req.userData.id;
    let modifiedBy = req.userData.id;
    let existAssign = await models.partReleaseAppraiser.findOne({ where: { partReleaseId, isActive: true } });
    if (!check.isEmpty(existAssign)) {
        return res.status(400).json({ message: `Already assigned appraiser to this part release process.` });
    }
    await sequelize.transaction(async t => {
        await models.partReleaseAppraiser.create({ partReleaseId, customerId, appraiserId, createdBy, modifiedBy, appoinmentDate, startTime, endTime }, { transaction: t });
        await models.partRelease.update({ isAppraiserAssigned: true }, { where: { id: partReleaseId }, transaction: t });
        await models.partReleaseHistory.create({ partReleaseId: partReleaseId, action: action.PART_RELEASE_ASSIGNED_APPRAISER, createdBy, modifiedBy }, { transaction: t });
    });
    // send sms
    // let customerInfo = await models.customer.findOne({ where: { id: customerId } })
    // let { mobileNumber, firstName, userUniqueId } = await models.user.findOne({ where: { id: appraiserId } });
    // request(`${CONSTANT.SMSURL}username=${CONSTANT.SMSUSERNAME}&password=${CONSTANT.SMSPASSWORD}&type=0&dlr=1&destination=${mobileNumber}&source=nicalc&message=${customerInfo.firstName} is assign for you`);
    return res.status(200).json({ message: 'success' });
}

exports.partReleaseApprovedList = async (req, res, next) => {
    const { search, offset, pageSize } = paginationWithFromTo(
        req.query.search,
        req.query.from,
        req.query.to
    );
    let userId = req.userData.id;
    const searchQuery = {
        isActive: true,
        amountStatus: "completed"
    }
    let appriserSearch = { isActive: true }
    if (req.userData.userTypeId != 4) {
        appriserSearch.appraiserId = userId;
    }
    let includeArray = [{
        model: models.customerLoanMaster,
        as: 'masterLoan',
        subQuery: false,
        attributes: ['id', 'customerId', 'masterLoanUniqueId', 'finalLoanAmount', 'tenure', 'loanStartDate', 'loanEndDate'],
        include: [
            {
                model: models.customer,
                as: 'customer',
                attributes: ['customerUniqueId', 'firstName', 'lastName', 'mobileNumber']
            },
            {
                model: models.customerLoan,
                as: 'customerLoan',
                attributes: ['masterLoanId', 'loanUniqueId', 'loanAmount', 'customerId']
            },
            {
                model: models.customerLoanPersonalDetail,
                as: 'loanPersonalDetail',
                attributes: ['customerUniqueId']
            }
        ]
    }, {
        model: models.customerLoanOrnamentsDetail
    }, {
        model: models.partReleaseAppraiser,
        as: 'appraiserData',
        attributes: { exclude: ['createdAt', 'createdBy', 'modifiedBy', 'isActive'] },
        include: [
            {
                model: models.customer,
                as: 'customer',
                attributes: ['customerUniqueId', 'firstName', 'lastName', 'mobileNumber']
            },
            {
                model: models.user,
                as: 'appraiser',
                attributes: ['firstName', 'lastName', 'mobileNumber']
            }
        ]
    }]
    let partRelease = await models.partRelease.findAll({
        where: searchQuery,
        attributes: { exclude: ['createdAt', 'createdBy', 'modifiedBy', 'isActive'] },
        order: [["updatedAt", "DESC"]],
        offset: offset,
        subQuery: false,
        limit: pageSize,
        include: includeArray
    })

    let count = await models.partRelease.findAll({
        where: searchQuery,
        include: includeArray
    })

    return res.status(200).json({ data: partRelease, count: count.length });
}

exports.updatePartReleaseStatus = async (req, res, next) => {
    let { partReleaseStatus, appraiserReason, partReleaseId } = req.body;
    let modifiedBy = req.userData.id;
    let createdBy = req.userData.id;
    let userId = req.userData.id;
    let appriserSearch = { isActive: true }
    let releaseDate = Date.now();
    if (req.userData.userTypeId != 4) {
        appriserSearch.appraiserId = userId;
    }
    let partReleaseData = await models.partRelease.findOne({
        where: { id: partReleaseId },
        attributes: ['amountStatus', 'partReleaseStatus', 'masterLoanId'],
        include: [{
            model: models.partReleaseAppraiser,
            as: 'appraiserData',
            subQuery: false,
            where: appriserSearch,
            attributes: ['appraiserId']
        }]
    });
    if (partReleaseData) {
        if (partReleaseData.partReleaseStatus == "pending") {
            if (partReleaseStatus == "pending") {
                await sequelize.transaction(async t => {
                    await models.partRelease.update({ partReleaseStatus, appraiserReason, modifiedBy }, { where: { id: partReleaseId }, transaction: t });
                    await models.partReleaseHistory.create({ partReleaseId: partReleaseId, action: action.PART_RELEASE_STATUS_P, createdBy, modifiedBy }, { transaction: t });
                });
                return res.status(200).json({ message: "success" });
            } else if (partReleaseStatus == "released") {
                await sequelize.transaction(async t => {
                    await models.partRelease.update({ partReleaseStatus, modifiedBy, releaseDate }, { where: { id: partReleaseId }, transaction: t });
                    await models.customerLoanMaster.update({ isOrnamentsReleased: true, modifiedBy }, { where: { id: partReleaseData.masterLoanId }, transaction: t });
                    await models.partReleaseHistory.create({ partReleaseId: partReleaseId, action: action.PART_RELEASE_STATUS_R, createdBy, modifiedBy }, { transaction: t });
                });
                return res.status(200).json({ message: "success" });
            }
        } else {
            return res.status(400).json({ message: "Now you can't change status as it's Already released!" });
        }
    } else {
        return res.status(400).json({ message: "This part release process is not assigned to you!" })
    }
}

exports.uploadDocument = async (req, res, next) => {
    let { documents, partReleaseId } = req.body;
    let modifiedBy = req.userData.id;
    let createdBy = req.userData.id;
    let userId = req.userData.id;
    let appriserSearch = { isActive: true }
    if (req.userData.userTypeId != 4) {
        appriserSearch.appraiserId = userId;
    }
    let partReleaseData = await models.partRelease.findOne({
        where: { id: partReleaseId },
        attributes: ['amountStatus', 'partReleaseStatus', 'masterLoanId'],
        include: [{
            model: models.partReleaseAppraiser,
            as: 'appraiserData',
            subQuery: false,
            where: appriserSearch,
            attributes: ['appraiserId']
        }]
    });
    if (partReleaseData) {
        await sequelize.transaction(async t => {
            await models.partRelease.update({ documents, modifiedBy }, { where: { id: partReleaseId }, transaction: t });
            await models.partReleaseHistory.create({ partReleaseId: partReleaseId, action: action.PART_RELEASE_DOCUMENT, createdBy, modifiedBy }, { transaction: t });
        });
        return res.status(200).json({ message: 'success' });
    } else {
        return res.status(400).json({ message: "This part release process is not assigned to you!" })
    }
}

exports.updateAppraiser = async (req, res, next) => {
    let { partReleaseId, appraiserId, customerId, appoinmentDate, startTime, endTime } = req.body;
    let createdBy = req.userData.id;
    let modifiedBy = req.userData.id;
    await sequelize.transaction(async t => {
        await models.partReleaseAppraiser.update({ customerId, appraiserId, modifiedBy, appoinmentDate, startTime, endTime }, { where: { partReleaseId }, transaction: t });
        await models.partReleaseHistory.create({ partReleaseId: partReleaseId, action: action.PART_RELEASE_UPDATED_APPRAISER, createdBy, modifiedBy }, { transaction: t });
    });
    return res.status(200).json({ message: 'success' });
}

exports.partReleaseApplyLoan = async (req, res, next) => {
    let customerUniqueId = req.params.customerUniqueId;
    let partReleaseId = req.query.partReleaseId;
    let userId = req.userData.id;
    let appriserSearch = { isActive: true }
    if (req.userData.userTypeId != 4) {
        appriserSearch.appraiserId = userId;
    }
    let partReleaseData = await models.partRelease.findOne({
        where: { id: partReleaseId },
        attributes: ['amountStatus', 'partReleaseStatus', 'masterLoanId'],
        include: [{
            model: models.partReleaseAppraiser,
            as: 'appraiserData',
            subQuery: false,
            where: appriserSearch,
            attributes: ['appraiserId']
        }]
    });
    if (!partReleaseData) {
        return res.status(400).json({ message: `This customer is not assign to you` })
    }

    let customerData = await models.customer.findOne({
        where: { customerUniqueId, isActive: true, kycStatus: 'approved' },
        attributes: ['id', 'customerUniqueId', 'panCardNumber', 'mobileNumber', 'kycStatus', 'panType', 'panImage'],
    })
    let bmRatingId = await models.loanStage.findOne({ where: { name: 'bm rating' } });
    let opsRatingId = await models.loanStage.findOne({ where: { name: 'OPS team rating' } });
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
        }
        const firstName = customerLoanStage.customer.firstName
        const lastName = customerLoanStage.customer.lastName

        let customerCurrentStage = customerLoanStage.customerLoanCurrentStage
        let loanId = await models.customerLoan.findOne({ where: { masterLoanId: customerLoanStage.id, loanType: 'secured' } })
        if (customerCurrentStage == '2') {
            return res.status(200).json({ message: 'success', loanId: loanId.id, masterLoanId: customerLoanStage.id, loanCurrentStage: customerCurrentStage,partReleaseId })
        } else if (customerCurrentStage == '3') {
            return res.status(200).json({ message: 'success', loanId: loanId.id, masterLoanId: customerLoanStage.id, loanCurrentStage: customerCurrentStage,partReleaseId })
        } else if (customerCurrentStage == '4') {
            return res.status(200).json({ message: 'success', loanId: loanId.id, masterLoanId: customerLoanStage.id, loanCurrentStage: customerCurrentStage, totalEligibleAmt: customerLoanStage.totalEligibleAmt,partReleaseId })
        } else if (customerCurrentStage == '5') {
            return res.status(200).json({ message: 'success', loanId: loanId.id, masterLoanId: customerLoanStage.id, loanCurrentStage: customerCurrentStage, finalLoanAmount: customerLoanStage.finalLoanAmount, firstName, lastName, partReleaseId })
        } else if (customerCurrentStage == '6') {
            return res.status(200).json({ message: 'success', masterLoanId: customerLoanStage.id, loanId: loanId.id, loanCurrentStage: customerCurrentStage,partReleaseId })
        }
    }
    if (!customerData) {
        res.status(404).json({ message: 'no customer details found' });
    } else {
        res.status(200).json({ message: 'customer details fetch successfully', customerData,partReleaseId });
    }
}
