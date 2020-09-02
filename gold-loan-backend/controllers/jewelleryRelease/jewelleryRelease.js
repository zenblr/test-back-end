const models = require('../../models');
const sequelize = models.sequelize;
const Sequelize = models.Sequelize;
const Op = Sequelize.Op;
const { paginationWithFromTo } = require("../../utils/pagination");
const check = require("../../lib/checkLib");
const action = require('../../utils/partReleaseHistory');
const actionFullRelease = require('../../utils/fullReleaseHistory');
const loanFunction = require('../../utils/loanFunction');
const { getCustomerInterestAmount, customerLoanDetailsByMasterLoanDetails, getGlobalSetting, getLoanDetails, allInterestPayment, getAmountLoanSplitUpData, getTransactionPrincipalAmount } = require('../../utils/loanFunction');
const moment = require('moment')
const uniqid = require('uniqid');
const _ = require('lodash');

exports.ornamentsDetails = async (req, res, next) => {

    let masterLoanId = req.params.masterLoanId;

    let customerLoan = await models.customerLoanMaster.findOne({
        where: { id: masterLoanId },
        attributes: ['customerId', 'masterLoanUniqueId', 'finalLoanAmount', 'tenure', 'loanStartDate', 'loanEndDate', 'outstandingAmount'],
        include: [
            {
                model: models.customerLoan,
                as: 'customerLoan',
                attributes: ['masterLoanId', 'loanUniqueId', 'outstandingAmount', 'loanAmount']
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
                    },
                    {
                        model: models.packet,
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
    let lastPaymentData = await models.customerLoanInterest.findOne({
        where: { masterLoanId: masterLoanId, emiStatus: "paid" },
        order: [["updatedAt", "DESC"]],
    });
    let lastPayment;
    if (lastPaymentData) {
        lastPayment = lastPaymentData.emiReceivedDate;
    }
    return lastPayment;
}

async function getGoldRate() {
    let goldRate = await models.goldRate.findOne({
        order: [["updatedAt", "DESC"]],
        attributes: ['goldRate']
    })
    return goldRate.goldRate;
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
                },
                {
                    model: models.packet,
                }
            ]
        }]
    });
    return ornaments;
}

async function allOrnamentsDetails(masterLoanId) {
    let ornaments = await models.customerLoanMaster.findOne({
        where: { id: masterLoanId },
        attributes: ['customerId', 'masterLoanUniqueId', 'finalLoanAmount', 'tenure', 'loanStartDate', 'loanEndDate'],
        include: [{
            model: models.customerLoanOrnamentsDetail,
            as: 'loanOrnamentsDetail',
            where: { isActive: true, isReleased: false },
            include: [
                {
                    model: models.ornamentType,
                    as: "ornamentType",
                    attributes: ['name', 'id'],
                },
                {
                    model: models.packet,
                }
            ]
        }]
    });
    return ornaments;
}

async function getornamentsWeightInfo(requestedOrnaments, otherOrnaments, loanData, allOrnaments) {
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
        currentOutstandingAmount: 0,
        allOrnamentsGrossWeight: 0,
        allOrnamentsDeductionWeight: 0,
        allOrnamentsNetWeight: 0,
        totalOfReleaseOrnaments: 0,
        totalOfRemainingOrnaments: 0,
        previousOutstandingAmount: 0,
        remainingOrnamentAmount: 0,//remning ornament
        newLoanAmount: 0,//new loan amount
    }
    if (requestedOrnaments || allOrnaments) {
        let globalSettings = await getGlobalSetting();
        let goldRate = await getGoldRate();
        ornamentsWeightInfo.currentLtv = goldRate * (globalSettings.ltvGoldValue / 100);
        ornamentsWeightInfo.previousLtv = requestedOrnaments.loanOrnamentsDetail[0].currentLtvAmount;
        ornamentsWeightInfo.previousOutstandingAmount = loanData.outstandingAmount;

        //current outstanding amount
        if (allOrnaments != null) {
            for (const ornaments of allOrnaments.loanOrnamentsDetail) {
                ornamentsWeightInfo.allOrnamentsGrossWeight = ornamentsWeightInfo.allOrnamentsGrossWeight + parseFloat(ornaments.grossWeight);
                ornamentsWeightInfo.allOrnamentsDeductionWeight = ornamentsWeightInfo.allOrnamentsDeductionWeight + parseFloat(ornaments.deductionWeight);
                ornamentsWeightInfo.allOrnamentsNetWeight = ornamentsWeightInfo.allOrnamentsNetWeight + parseFloat(ornaments.netWeight);
                let ltvAmount = ornamentsWeightInfo.currentLtv * (ornaments.ltvPercent / 100)
                ornamentsWeightInfo.currentOutstandingAmount = ornamentsWeightInfo.currentOutstandingAmount + (ltvAmount * parseFloat(ornaments.netWeight));
                console.log((ltvAmount * parseFloat(ornaments.netWeight)))
            }
        }


        if (requestedOrnaments != null) {
            for (const ornaments of requestedOrnaments.loanOrnamentsDetail) {
                ornamentsWeightInfo.releaseGrossWeight = ornamentsWeightInfo.releaseGrossWeight + parseFloat(ornaments.grossWeight);
                ornamentsWeightInfo.releaseDeductionWeight = ornamentsWeightInfo.releaseDeductionWeight + parseFloat(ornaments.deductionWeight);
                ornamentsWeightInfo.releaseNetWeight = ornamentsWeightInfo.releaseNetWeight + parseFloat(ornaments.netWeight);
                let ltvAmount = ornamentsWeightInfo.currentLtv * (ornaments.ltvPercent / 100)
                ornamentsWeightInfo.totalOfReleaseOrnaments = ornamentsWeightInfo.totalOfReleaseOrnaments + (ltvAmount * parseFloat(ornaments.netWeight));
            }
        }

        if (otherOrnaments != null) {
            for (const ornaments of otherOrnaments.loanOrnamentsDetail) {
                ornamentsWeightInfo.remainingGrossWeight = ornamentsWeightInfo.remainingGrossWeight + parseFloat(ornaments.grossWeight);
                ornamentsWeightInfo.remainingDeductionWeight = ornamentsWeightInfo.remainingDeductionWeight + parseFloat(ornaments.deductionWeight);
                ornamentsWeightInfo.remainingNetWeight = ornamentsWeightInfo.remainingNetWeight + parseFloat(ornaments.netWeight);
                let ltvAmount = ornamentsWeightInfo.currentLtv * (ornaments.ltvPercent / 100)
                ornamentsWeightInfo.totalOfRemainingOrnaments = ornamentsWeightInfo.totalOfRemainingOrnaments + (ltvAmount * parseFloat(ornaments.netWeight));
            }
        }


        ornamentsWeightInfo.currentOutstandingAmount = Math.round(ornamentsWeightInfo.currentOutstandingAmount);
        ornamentsWeightInfo.totalOfReleaseOrnaments = Math.round(ornamentsWeightInfo.totalOfReleaseOrnaments);
        ornamentsWeightInfo.totalOfRemainingOrnaments = Math.round(ornamentsWeightInfo.totalOfRemainingOrnaments);
        ornamentsWeightInfo.releaseAmount = ornamentsWeightInfo.currentOutstandingAmount - ornamentsWeightInfo.previousOutstandingAmount - ornamentsWeightInfo.totalOfReleaseOrnaments;
        if (ornamentsWeightInfo.releaseAmount > 0) {
            ornamentsWeightInfo.releaseAmount = 0
        } else {
            ornamentsWeightInfo.releaseAmount = Math.round(Math.abs(ornamentsWeightInfo.releaseAmount));
        }
        ornamentsWeightInfo.remainingOrnamentAmount = Math.round(ornamentsWeightInfo.currentOutstandingAmount - ornamentsWeightInfo.previousOutstandingAmount - ornamentsWeightInfo.totalOfRemainingOrnaments);
        ornamentsWeightInfo.newLoanAmount = ornamentsWeightInfo.currentOutstandingAmount - ornamentsWeightInfo.previousOutstandingAmount - ornamentsWeightInfo.remainingOrnamentAmount;
    }
    return ornamentsWeightInfo;
}

async function getornamentLoanInfo(masterLoanId, ornamentWeight, amount) {
    let loanData = await models.customerLoan.findAll({ where: { masterLoanId }, attributes: ['loanUniqueId'] });
    let loanAmountData = await models.customerLoanMaster.findOne({ where: { id: masterLoanId }, attributes: ['finalLoanAmount', 'outstandingAmount'] });
    let loanDetails = {
        loanData,
        finalLoanAmount: 0,
        interestAmount: 0,
        penalInterest: 0,
        totalPayableAmount: 0,
        securedInterest: 0,
        securedPenalInterest: 0,
        unsecuredInterest: 0,
        unsecuredPenalInterest: 0
    }
    loanDetails.interestAmount = amount.secured.interest;
    loanDetails.penalInterest = amount.secured.penalInterest;
    loanDetails.securedInterest = amount.secured.interest;
    loanDetails.securedPenalInterest = amount.secured.penalInterest;
    if (amount.unsecured) {
        loanDetails.interestAmount = loanDetails.interestAmount + amount.unsecured.interest;
        loanDetails.penalInterest = loanDetails.penalInterest + amount.unsecured.penalInterest;
        loanDetails.unsecuredInterest = amount.unsecured.interest;
        loanDetails.unsecuredPenalInterest = amount.unsecured.penalInterest;
    }
    //calculate value here
    loanDetails.totalPayableAmount = Number((ornamentWeight.releaseAmount + loanDetails.penalInterest + loanDetails.interestAmount).toFixed(2));
    loanDetails.interestAmount = Number(loanDetails.interestAmount.toFixed(2));
    loanDetails.penalInterest = Number(loanDetails.penalInterest.toFixed(2));
    loanDetails.finalLoanAmount = loanAmountData.finalLoanAmount;
    return loanDetails;
}

async function getAllPartAndFullReleaseData(masterLoanId, ornamentId) {
    let whereSelectedOrmenemts = { id: { [Op.in]: ornamentId }, isActive: true, isReleased: false };
    let whereOtherOrmenemts = { id: { [Op.notIn]: ornamentId }, isActive: true, isReleased: false };
    let loanData = await getLoanDetails(masterLoanId);
    let amount = await getCustomerInterestAmount(masterLoanId);
    let requestedOrnaments = await ornementsDetails(masterLoanId, whereSelectedOrmenemts);
    let otherOrnaments = await ornementsDetails(masterLoanId, whereOtherOrmenemts);
    let allOrnaments = await allOrnamentsDetails(masterLoanId);
    let ornamentWeight = await getornamentsWeightInfo(requestedOrnaments, otherOrnaments, loanData, allOrnaments);
    let loanInfo = await getornamentLoanInfo(masterLoanId, ornamentWeight, amount);
    return { ornamentWeight, loanInfo, amount }
}

exports.ornamentsAmountDetails = async (req, res, next) => {
    let { masterLoanId, ornamentId } = req.body;
    let checkOrnament = await models.customerLoanOrnamentsDetail.findAll({
        where: { isReleased: true, masterLoanId: masterLoanId }
    });
    if (checkOrnament.length == 0) {
        let releaseData = await getAllPartAndFullReleaseData(masterLoanId, ornamentId);
        let ornamentWeight = releaseData.ornamentWeight;
        let loanInfo = releaseData.loanInfo;
        let amount = releaseData.amount;
        return res.status(200).json({ message: 'success', ornamentWeight, loanInfo, amount });
    } else {
        return res.status(400).json({ message: "Can't proceed further as you have already applied for pat released or full release" });
    }
}

exports.ornamentsPartRelease = async (req, res, next) => {
    let { paymentType, paidAmount, bankName, chequeNumber, ornamentId, depositDate, branchName, transactionId, masterLoanId } = req.body;
    let createdBy = req.userData.id;
    let modifiedBy = req.userData.id;
    let checkOrnament = await models.customerLoanOrnamentsDetail.findAll({
        where: { isReleased: true, masterLoanId: masterLoanId }
    });
    let releaseData = await getAllPartAndFullReleaseData(masterLoanId, ornamentId);
    let ornamentData = releaseData.ornamentWeight;
    let loanInfo = releaseData.loanInfo;
    let amount = await getCustomerInterestAmount(masterLoanId);
    let { loan } = await customerLoanDetailsByMasterLoanDetails(masterLoanId);
    let { isUnsecuredSchemeApplied, securedRatio, unsecuredRatio, newSecuredOutstandingAmount, newUnsecuredOutstandingAmount, securedPenalInterest, unsecuredPenalInterest, securedInterest, unsecuredInterest, securedLoanId, unsecuredLoanId } = await getAmountLoanSplitUpData(loan, amount, ornamentData.releaseAmount);
    if (checkOrnament.length == 0) {
        let addPartRelease;
        let partRelease = await sequelize.transaction(async t => {
            if (['cash', 'IMPS', 'NEFT', 'RTGS', 'cheque', 'UPI', 'gateway'].includes(paymentType)) {
                let loanTransaction = await models.customerLoanTransaction.create({ masterLoanId, transactionUniqueId: uniqid.time().toUpperCase(), bankTransactionUniqueId: transactionId, paymentType, transactionAmont: paidAmount, chequeNumber, bankName, branchName, paymentFor: "partRelease", depositDate, createdBy, modifiedBy }, { transaction: t });
                await models.customerTransactionSplitUp.create({ customerLoanTransactionId: loanTransaction.id, loanId: securedLoanId, masterLoanId, payableOutstanding: securedRatio, penal: securedPenalInterest, interest: securedInterest, loanOutstanding: newSecuredOutstandingAmount }, { transaction: t });
                if (isUnsecuredSchemeApplied == true) {
                    await models.customerTransactionSplitUp.create({ customerLoanTransactionId: loanTransaction.id, loanId: unsecuredLoanId, masterLoanId, payableOutstanding: unsecuredRatio, penal: unsecuredPenalInterest, interest: unsecuredInterest, loanOutstanding: newUnsecuredOutstandingAmount, isSecured: false }, { transaction: t });
                }
                addPartRelease = await models.partRelease.create({ customerLoanTransactionId: loanTransaction.id, currentOutstandingAmount: ornamentData.currentOutstandingAmount, paidAmount, masterLoanId, releaseAmount: ornamentData.releaseAmount, interestAmount: loanInfo.interestAmount, penalInterest: loanInfo.penalInterest, payableAmount: loanInfo.totalPayableAmount, releaseGrossWeight: ornamentData.releaseGrossWeight, releaseDeductionWeight: ornamentData.releaseDeductionWeight, releaseNetWeight: ornamentData.releaseNetWeight, remainingGrossWeight: ornamentData.remainingGrossWeight, remainingDeductionWeight: ornamentData.remainingDeductionWeight, remainingNetWeight: ornamentData.remainingNetWeight, currentLtv: ornamentData.currentLtv, createdBy, modifiedBy, remainingOrnamentAmount: ornamentData.remainingOrnamentAmount, newLoanAmount: ornamentData.newLoanAmount }, { transaction: t });
            } else {
                return res.status(400).json({ message: 'invalid paymentType' });
            }
            for (const ornament of ornamentId) {
                await models.customerLoanOrnamentsDetail.update({ isReleased: true }, { where: { id: ornament }, transaction: t })
                await models.partReleaseOrnaments.create({ partReleaseId: addPartRelease.id, ornamentId: ornament }, { transaction: t });
            }
            await models.partReleaseHistory.create({ partReleaseId: addPartRelease.id, action: action.PART_RELEASE_APPLIED, createdBy, modifiedBy }, { transaction: t });
            return addPartRelease
        });
        return res.status(200).json({ message: "success", partRelease });
    } else {
        return res.status(400).json({ message: "can't proceed further as you have already applied for pat released or full release" });
    }
}

exports.getPartReleaseList = async (req, res, next) => {
    const { search, offset, pageSize } = paginationWithFromTo(
        req.query.search,
        req.query.from,
        req.query.to
    );
    let query = {};
    const searchQuery = {
        [Op.and]: [query, {
            [Op.or]: {
                release_gross_weight: sequelize.where(
                    sequelize.cast(sequelize.col("release_gross_weight"), "varchar"), { [Op.iLike]: search + "%" }),
                amount_status: sequelize.where(
                    sequelize.cast(sequelize.col("amount_status"), "varchar"), { [Op.iLike]: search + "%" }),
                release_deduction_weight: sequelize.where(
                    sequelize.cast(sequelize.col("release_deduction_weight"), "varchar"), { [Op.iLike]: search + "%" }),
                release_net_weight: sequelize.where(
                    sequelize.cast(sequelize.col("release_net_weight"), "varchar"), { [Op.iLike]: search + "%" }),
                release_amount: sequelize.where(
                    sequelize.cast(sequelize.col("release_amount"), "varchar"), { [Op.iLike]: search + "%" }),
                payable_amount: sequelize.where(
                    sequelize.cast(sequelize.col("payable_amount"), "varchar"), { [Op.iLike]: search + "%" }),
                interest_amount: sequelize.where(
                    sequelize.cast(sequelize.col("interest_amount"), "varchar"), { [Op.iLike]: search + "%" }),
                penal_interest: sequelize.where(
                    sequelize.cast(sequelize.col("penal_interest"), "varchar"), { [Op.iLike]: search + "%" }),
                remaining_net_weight: sequelize.where(
                    sequelize.cast(sequelize.col("remaining_net_weight"), "varchar"), { [Op.iLike]: search + "%" }),
                "$masterLoan.loanPersonalDetail.customer_unique_id$": { [Op.iLike]: search + "%" },
                "$masterLoan.outstanding_amount$": sequelize.where(sequelize.cast(sequelize.col("masterLoan.outstanding_amount"), "varchar"), { [Op.iLike]: search + "%" }),
                "$masterLoan.tenure$": sequelize.where(sequelize.cast(sequelize.col("masterLoan.tenure"), "varchar"), { [Op.iLike]: search + "%" }),
                "$masterLoan.customerLoan.loan_unique_id$": { [Op.iLike]: search + "%" },
                final_loan_amount: sequelize.where(
                    sequelize.cast(sequelize.col("masterLoan.final_loan_amount"), "varchar"), { [Op.iLike]: search + "%" })
            },
        }],
        isActive: true
    }
    let includeArray = [{
        model: models.customerLoanMaster,
        as: 'masterLoan',
        attributes: ['customerId', 'outstandingAmount', 'masterLoanUniqueId', 'finalLoanAmount', 'tenure', 'loanStartDate', 'loanEndDate'],
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
    },
    {
        model: models.customerLoanOrnamentsDetail,
        include: [
            {
                model: models.packet
            }, {
                model: models.ornamentType,
                as: "ornamentType"
            }
        ]
    },
    {
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
        subQuery: false,
        include: includeArray
    })

    let count = await models.partRelease.findAll({
        where: searchQuery,
        subQuery: false,
        include: includeArray
    })

    return res.status(200).json({ data: partRelease, count: count.length });
}


exports.updateAmountStatus = async (req, res, next) => {
    let { amountStatus, partReleaseId } = req.body;
    let modifiedBy = req.userData.id;
    let createdBy = req.userData.id;
    let partReleaseData = await models.partRelease.findOne({ where: { id: partReleaseId }, attributes: ['amountStatus', 'customerLoanTransactionId', 'masterLoanId'] });
    if (partReleaseData) {
        if (partReleaseData.amountStatus == 'pending' || partReleaseData.amountStatus == 'rejected') {
            if (amountStatus == 'completed') {
                let payment = await allInterestPayment(partReleaseData.customerLoanTransactionId);
                let { securedPayableOutstanding, unSecuredPayableOutstanding, transactionDataSecured, transactionDataUnSecured, securedOutstandingAmount, unSecuredOutstandingAmount, outstandingAmount, securedLoanUniqueId, unSecuredLoanUniqueId } = await getTransactionPrincipalAmount(partReleaseData.customerLoanTransactionId);
                await sequelize.transaction(async t => {

                    //update in interest table
                    if (payment.securedLoanDetails) {
                        for (const interest of payment.securedLoanDetails) {
                            await models.customerLoanInterest.update({ paidAmount: interest.paidAmount, interestAccrual: interest.interestAccrual, outstandingInterest: interest.outstandingInterest, emiReceivedDate: moment(), penalAccrual: interest.penalAccrual, penalOutstanding: interest.penalOutstanding, penalPaid: interest.penalPaid, modifiedBy, emiStatus: interest.emiStatus }, { where: { id: interest.id }, transaction: t });
                        }
                    }
                    if (payment.unsecuredLoanDetails) {
                        for (const interest of payment.unsecuredLoanDetails) {
                            await models.customerLoanInterest.update({ paidAmount: interest.paidAmount, interestAccrual: interest.interestAccrual, outstandingInterest: interest.outstandingInterest, emiReceivedDate: moment(), penalAccrual: interest.penalAccrual, penalOutstanding: interest.penalOutstanding, penalPaid: interest.penalPaid, modifiedBy, emiStatus: interest.emiStatus }, { where: { id: interest.id }, transaction: t });
                        }
                    }
                    //update in transaction
                    if (payment.transactionDetails) {
                        for (const amount of payment.transactionDetails) {
                            if (amount.isPenalInterest) {
                                //debit
                                let checkDebitEntry = await models.customerTransactionDetail.findAll({ where: { masterLoanId: amount.masterLoanId, loanId: amount.loanId, loanInterestId: amount.loanInterestId, isPenalInterest: true } });
                                if (checkDebitEntry.length == 0) {
                                    let debit = await models.customerTransactionDetail.create({ masterLoanId: amount.masterLoanId, loanId: amount.loanId, loanInterestId: amount.loanInterestId, isPenalInterest: true, debit: amount.penalInterest, description: `Penal interest` }, { transaction: t });
                                    await models.customerTransactionDetail.update({ referenceId: `${amount.loanUniqueId}-${debit.id}` }, { where: { id: debit.id }, transaction: t });
                                } else {
                                    let debitedAmount = await checkDebitEntry.map((data) => Number(data.debit));
                                    let totalDebitedAmount = _.sum(debitedAmount);
                                    let newDebitAmount = amount.penalInterest - totalDebitedAmount;
                                    if (newDebitAmount > 0) {
                                        let debit = await models.customerTransactionDetail.create({ masterLoanId: amount.masterLoanId, loanId: amount.loanId, loanInterestId: amount.loanInterestId, isPenalInterest: true, debit: newDebitAmount, description: `Penal interest` }, { transaction: t });
                                        await models.customerTransactionDetail.update({ referenceId: `${amount.loanUniqueId}-${debit.id}` }, { where: { id: debit.id }, transaction: t });
                                    }
                                }
                                //credit
                                let description = "penal interest Received"
                                let paid = await models.customerTransactionDetail.create({ customerLoanTransactionId: partReleaseData.customerLoanTransactionId, masterLoanId: amount.masterLoanId, loanId: amount.loanId, isPenalInterest: amount.isPenalInterest, credit: amount.credit, description: description, paymentDate: moment() }, { transaction: t });
                                await models.customerTransactionDetail.update({ referenceId: `${amount.loanUniqueId}-${paid.id}` }, { where: { id: paid.id }, transaction: t });
                            } else {
                                if (amount.isExtraDaysInterest) {
                                    //debit
                                    let checkDebitEntry = await models.customerTransactionDetail.findAll({ where: { masterLoanId: amount.masterLoanId, loanId: amount.loanId, loanInterestId: amount.loanInterestId, isPenalInterest: false } });
                                    if (checkDebitEntry.length == 0) {
                                        let debit = await models.customerTransactionDetail.create({ masterLoanId: amount.masterLoanId, loanId: amount.loanId, loanInterestId: amount.loanInterestId, debit: amount.interestAmount, description: `Extra days interest` }, { transaction: t });
                                        await models.customerTransactionDetail.update({ referenceId: `${amount.loanUniqueId}-${debit.id}` }, { where: { id: debit.id }, transaction: t });
                                    } else {
                                        let debitedAmount = await checkDebitEntry.map((data) => Number(data.debit));
                                        let totalDebitedAmount = _.sum(debitedAmount);
                                        let newDebitAmount = amount.interestAmount - totalDebitedAmount;
                                        if (newDebitAmount > 0) {
                                            let debit = await models.customerTransactionDetail.create({ masterLoanId: amount.masterLoanId, loanId: amount.loanId, loanInterestId: amount.loanInterestId, debit: newDebitAmount, description: `Extra days interest` }, { transaction: t });
                                            await models.customerTransactionDetail.update({ referenceId: `${amount.loanUniqueId}-${debit.id}` }, { where: { id: debit.id }, transaction: t });
                                        }
                                    }
                                    //credit
                                    let paid = await models.customerTransactionDetail.create({ customerLoanTransactionId: partReleaseData.customerLoanTransactionId, masterLoanId: amount.masterLoanId, loanId: amount.loanId, credit: amount.credit, description: `Extra days interest received`, paymentDate: moment(), }, { transaction: t });
                                    await models.customerTransactionDetail.update({ referenceId: `${amount.loanUniqueId}-${paid.id}` }, { where: { id: paid.id }, transaction: t });
                                } else {
                                    let paid = await models.customerTransactionDetail.create({ customerLoanTransactionId: partReleaseData.customerLoanTransactionId, masterLoanId: amount.masterLoanId, loanId: amount.loanId, credit: amount.credit, description: `interest received ${amount.emiDueDate}`, paymentDate: moment(), }, { transaction: t });
                                    await models.customerTransactionDetail.update({ referenceId: `${amount.loanUniqueId}-${paid.id}` }, { where: { id: paid.id }, transaction: t });
                                }

                            }
                        }
                    }


                    //credit part release ornament amount
                    let securedTransaction = await models.customerTransactionDetail.create({ masterLoanId: partReleaseData.masterLoanId, customerLoanTransactionId: partReleaseData.customerLoanTransactionId, loanId: transactionDataSecured.loanId, credit: securedPayableOutstanding, paymentDate: moment(), description: "part release ornament amount" }, { transaction: t });
                    await models.customerTransactionDetail.update({ referenceId: `${securedLoanUniqueId}-${securedTransaction.id}` }, { where: { id: securedTransaction.id }, transaction: t })
                    if (transactionDataUnSecured) {
                        let unSecuredTransaction = await models.customerTransactionDetail.create({ masterLoanId: partReleaseData.masterLoanId, customerLoanTransactionId: partReleaseData.customerLoanTransactionId, loanId: transactionDataUnSecured.loanId, credit: unSecuredPayableOutstanding, paymentDate: moment(), description: "part release ornament amount" }, { transaction: t });
                        await models.customerTransactionDetail.update({ referenceId: `${unSecuredLoanUniqueId}-${unSecuredTransaction.id}` }, { where: { id: unSecuredTransaction.id }, transaction: t })
                    }
                    await models.customerLoanTransaction.update({ depositStatus: "Completed", paymentReceivedDate: moment() }, { where: { id: partReleaseData.customerLoanTransactionId }, transaction: t });
                    await models.customerLoan.update({ outstandingAmount: securedOutstandingAmount }, { where: { id: transactionDataSecured.loanId }, transaction: t });
                    if (transactionDataUnSecured) {
                        await models.customerLoan.update({ outstandingAmount: unSecuredOutstandingAmount }, { where: { id: transactionDataUnSecured.loanId }, transaction: t });
                    }
                    await models.customerLoanMaster.update({ outstandingAmount: outstandingAmount }, { where: { id: partReleaseData.masterLoanId }, transaction: t });
                    await models.partRelease.update({ amountStatus: 'completed', modifiedBy }, { where: { id: partReleaseId }, transaction: t });
                    await models.partReleaseHistory.create({ partReleaseId: partReleaseId, action: action.PART_RELEASE_AMOUNT_STATUS_C, createdBy, modifiedBy }, { transaction: t });
                });
                return res.status(200).json({ message: "success" });
            } else if (amountStatus == 'rejected') {
                await sequelize.transaction(async t => {
                    await models.customerLoanTransaction.update({ depositStatus: "Rejected" }, { where: { id: partReleaseData.customerLoanTransactionId }, transaction: t });
                    await models.partRelease.update({ amountStatus: 'rejected', modifiedBy }, { where: { id: partReleaseId }, transaction: t });
                    await models.partReleaseHistory.create({ partReleaseId: partReleaseId, action: action.PART_RELEASE_AMOUNT_STATUS_R, createdBy, modifiedBy }, { transaction: t });
                });
                return res.status(200).json({ message: "success" });
            } else if (amountStatus == 'pending') {
                await sequelize.transaction(async t => {
                    await models.partRelease.update({ amountStatus: 'pending', modifiedBy }, { where: { id: partReleaseId }, transaction: t });
                    await models.partReleaseHistory.create({ partReleaseId: partReleaseId, action: action.PART_RELEASE_AMOUNT_STATUS_P, createdBy, modifiedBy }, { transaction: t });
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
    let query = {};
    const searchQuery = {
        [Op.and]: [query, {
            [Op.or]: {
                release_gross_weight: sequelize.where(
                    sequelize.cast(sequelize.col("release_gross_weight"), "varchar"), { [Op.iLike]: search + "%" }),
                amount_status: sequelize.where(
                    sequelize.cast(sequelize.col("amount_status"), "varchar"), { [Op.iLike]: search + "%" }),
                release_deduction_weight: sequelize.where(
                    sequelize.cast(sequelize.col("release_deduction_weight"), "varchar"), { [Op.iLike]: search + "%" }),
                release_net_weight: sequelize.where(
                    sequelize.cast(sequelize.col("release_net_weight"), "varchar"), { [Op.iLike]: search + "%" }),
                release_amount: sequelize.where(
                    sequelize.cast(sequelize.col("release_amount"), "varchar"), { [Op.iLike]: search + "%" }),
                payable_amount: sequelize.where(
                    sequelize.cast(sequelize.col("payable_amount"), "varchar"), { [Op.iLike]: search + "%" }),
                interest_amount: sequelize.where(
                    sequelize.cast(sequelize.col("interest_amount"), "varchar"), { [Op.iLike]: search + "%" }),
                penal_interest: sequelize.where(
                    sequelize.cast(sequelize.col("penal_interest"), "varchar"), { [Op.iLike]: search + "%" }),
                remaining_net_weight: sequelize.where(
                    sequelize.cast(sequelize.col("remaining_net_weight"), "varchar"), { [Op.iLike]: search + "%" }),
                "$masterLoan.loanPersonalDetail.customer_unique_id$": { [Op.iLike]: search + "%" },
                "$masterLoan.outstanding_amount$": sequelize.where(sequelize.cast(sequelize.col("masterLoan.outstanding_amount"), "varchar"), { [Op.iLike]: search + "%" }),
                "$masterLoan.tenure$": sequelize.where(sequelize.cast(sequelize.col("masterLoan.tenure"), "varchar"), { [Op.iLike]: search + "%" }),
                "$masterLoan.customerLoan.loan_unique_id$": { [Op.iLike]: search + "%" },
                final_loan_amount: sequelize.where(
                    sequelize.cast(sequelize.col("masterLoan.final_loan_amount"), "varchar"), { [Op.iLike]: search + "%" })
            },
        }],
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
        attributes: ['id', 'outstandingAmount', 'customerId', 'masterLoanUniqueId', 'finalLoanAmount', 'tenure', 'loanStartDate', 'loanEndDate'],
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
        model: models.customerLoanOrnamentsDetail,
        include: [
            {
                model: models.packet
            }, {
                model: models.ornamentType,
                as: "ornamentType"
            }
        ]
    }, {
        model: models.partReleaseAppraiser,
        as: 'appraiserData',
        where: appriserSearch,
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
    }, {
        model: models.customerLoanMaster,
        as: 'newLoan',
        attributes: ['loanStatusForAppraiser'],
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
        subQuery: false,
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
        attributes: ['amountStatus', 'partReleaseStatus', 'masterLoanId', 'newLoanAmount'],
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
    let newLoanAmount = partReleaseData.newLoanAmount;
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
            return res.status(200).json({ message: 'success', loanId: loanId.id, masterLoanId: customerLoanStage.id, loanCurrentStage: customerCurrentStage, partReleaseId, newLoanAmount })
        } else if (customerCurrentStage == '3') {
            return res.status(200).json({ message: 'success', loanId: loanId.id, masterLoanId: customerLoanStage.id, loanCurrentStage: customerCurrentStage, partReleaseId, newLoanAmount })
        } else if (customerCurrentStage == '4') {
            return res.status(200).json({ message: 'success', loanId: loanId.id, masterLoanId: customerLoanStage.id, loanCurrentStage: customerCurrentStage, totalEligibleAmt: customerLoanStage.totalEligibleAmt, partReleaseId, newLoanAmount })
        } else if (customerCurrentStage == '5') {
            return res.status(200).json({ message: 'success', loanId: loanId.id, masterLoanId: customerLoanStage.id, loanCurrentStage: customerCurrentStage, finalLoanAmount: customerLoanStage.finalLoanAmount, firstName, lastName, partReleaseId, newLoanAmount })
        } else if (customerCurrentStage == '6') {
            return res.status(200).json({ message: 'success', masterLoanId: customerLoanStage.id, loanId: loanId.id, loanCurrentStage: customerCurrentStage, partReleaseId, newLoanAmount })
        }
    }
    if (!customerData) {
        res.status(404).json({ message: 'no customer details found' });
    } else {
        res.status(200).json({ message: 'customer details fetch successfully', customerData, partReleaseId, newLoanAmount });
    }
}

//Full release 

exports.ornamentsFullRelease = async (req, res, next) => {
    let { paymentType, paidAmount, bankName, chequeNumber, ornamentId, depositDate, branchName, transactionId, masterLoanId } = req.body;
    let createdBy = req.userData.id;
    let modifiedBy = req.userData.id;
    let releaseData = await getAllPartAndFullReleaseData(masterLoanId, ornamentId);
    let ornamentData = releaseData.ornamentWeight;
    let loanInfo = releaseData.loanInfo;
    let amount = await getCustomerInterestAmount(masterLoanId);
    let { loan } = await customerLoanDetailsByMasterLoanDetails(masterLoanId);
    let { isUnsecuredSchemeApplied, securedRatio, unsecuredRatio, newSecuredOutstandingAmount, newUnsecuredOutstandingAmount, securedPenalInterest, unsecuredPenalInterest, securedInterest, unsecuredInterest, securedLoanId, unsecuredLoanId } = await getAmountLoanSplitUpData(loan, amount, ornamentData.releaseAmount);
    let checkOrnament = await models.customerLoanOrnamentsDetail.findAll({
        where: { isReleased: true, masterLoanId: masterLoanId }
    });
    if (checkOrnament.length == 0) {
        let addFullRelease;
        let fullRelease = await sequelize.transaction(async t => {
            if (['cash', 'IMPS', 'NEFT', 'RTGS', 'cheque', 'UPI', 'gateway'].includes(paymentType)) {
                let loanTransaction = await models.customerLoanTransaction.create({ masterLoanId, transactionUniqueId: uniqid.time().toUpperCase(), bankTransactionUniqueId: transactionId, paymentType, transactionAmont: paidAmount, chequeNumber, bankName, branchName, paymentFor: "fullRelease", depositDate, createdBy, modifiedBy }, { transaction: t });
                await models.customerTransactionSplitUp.create({ customerLoanTransactionId: loanTransaction.id, loanId: securedLoanId, masterLoanId, payableOutstanding: securedRatio, penal: securedPenalInterest, interest: securedInterest, loanOutstanding: newSecuredOutstandingAmount }, { transaction: t });
                if (isUnsecuredSchemeApplied == true) {
                    await models.customerTransactionSplitUp.create({ customerLoanTransactionId: loanTransaction.id, loanId: unsecuredLoanId, masterLoanId, payableOutstanding: unsecuredRatio, penal: unsecuredPenalInterest, interest: unsecuredInterest, loanOutstanding: newUnsecuredOutstandingAmount, isSecured: false }, { transaction: t });
                }
                addFullRelease = await models.fullRelease.create({ customerLoanTransactionId: loanTransaction.id, currentOutstandingAmount: ornamentData.currentOutstandingAmount, paidAmount, masterLoanId, releaseAmount: ornamentData.releaseAmount, interestAmount: loanInfo.interestAmount, penalInterest: loanInfo.penalInterest, payableAmount: loanInfo.totalPayableAmount, releaseGrossWeight: ornamentData.releaseGrossWeight, releaseDeductionWeight: ornamentData.releaseDeductionWeight, releaseNetWeight: ornamentData.releaseNetWeight, remainingGrossWeight: ornamentData.remainingGrossWeight, remainingDeductionWeight: ornamentData.remainingDeductionWeight, remainingNetWeight: ornamentData.remainingNetWeight, currentLtv: ornamentData.currentLtv, createdBy, modifiedBy, remainingOrnamentAmount: ornamentData.remainingOrnamentAmount, newLoanAmount: ornamentData.newLoanAmount }, { transaction: t });
            } else {
                return res.status(400).json({ message: 'Invalid paymentType' });
            }
            for (const ornament of ornamentId) {
                await models.customerLoanOrnamentsDetail.update({ isReleased: true }, { where: { id: ornament }, transaction: t });
            }
            await models.fullReleaseHistory.create({ fullReleaseId: addFullRelease.id, action: actionFullRelease.FULL_RELEASE_APPLIED, createdBy, modifiedBy }, { transaction: t });
            return addFullRelease
        })
        return res.status(200).json({ message: "success", fullRelease });
    } else {
        return res.status(400).json({ message: "can't proceed further as you have already applied for pat released or full release" });
    }
}

exports.getFullReleaseList = async (req, res, next) => {
    const { search, offset, pageSize } = paginationWithFromTo(
        req.query.search,
        req.query.from,
        req.query.to
    );
    let query = {};
    const searchQuery = {
        [Op.and]: [query, {
            [Op.or]: {
                release_gross_weight: sequelize.where(
                    sequelize.cast(sequelize.col("release_gross_weight"), "varchar"), { [Op.iLike]: search + "%" }),
                amount_status: sequelize.where(
                    sequelize.cast(sequelize.col("amount_status"), "varchar"), { [Op.iLike]: search + "%" }),
                release_deduction_weight: sequelize.where(
                    sequelize.cast(sequelize.col("release_deduction_weight"), "varchar"), { [Op.iLike]: search + "%" }),
                release_net_weight: sequelize.where(
                    sequelize.cast(sequelize.col("release_net_weight"), "varchar"), { [Op.iLike]: search + "%" }),
                release_amount: sequelize.where(
                    sequelize.cast(sequelize.col("release_amount"), "varchar"), { [Op.iLike]: search + "%" }),
                payable_amount: sequelize.where(
                    sequelize.cast(sequelize.col("payable_amount"), "varchar"), { [Op.iLike]: search + "%" }),
                interest_amount: sequelize.where(
                    sequelize.cast(sequelize.col("interest_amount"), "varchar"), { [Op.iLike]: search + "%" }),
                penal_interest: sequelize.where(
                    sequelize.cast(sequelize.col("penal_interest"), "varchar"), { [Op.iLike]: search + "%" }),
                remaining_net_weight: sequelize.where(
                    sequelize.cast(sequelize.col("remaining_net_weight"), "varchar"), { [Op.iLike]: search + "%" }),
                "$masterLoan.loanPersonalDetail.customer_unique_id$": { [Op.iLike]: search + "%" },
                "$masterLoan.outstanding_amount$": sequelize.where(sequelize.cast(sequelize.col("masterLoan.outstanding_amount"), "varchar"), { [Op.iLike]: search + "%" }),
                "$masterLoan.tenure$": sequelize.where(sequelize.cast(sequelize.col("masterLoan.tenure"), "varchar"), { [Op.iLike]: search + "%" }),
                "$masterLoan.customerLoan.loan_unique_id$": { [Op.iLike]: search + "%" },
                final_loan_amount: sequelize.where(
                    sequelize.cast(sequelize.col("masterLoan.final_loan_amount"), "varchar"), { [Op.iLike]: search + "%" })
            },
        }],
        isActive: true
    }
    let includeArray = [{
        model: models.customerLoanMaster,
        as: 'masterLoan',
        attributes: ['customerId', 'outstandingAmount', 'masterLoanUniqueId', 'finalLoanAmount', 'tenure', 'loanStartDate', 'loanEndDate'],
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
            }, {
                model: models.customerLoanOrnamentsDetail,
                as: 'loanOrnamentsDetail',
                include: [
                    {
                        model: models.ornamentType,
                        as: "ornamentType"
                    },
                    {
                        model: models.packet
                    }
                ]
            },
        ]
    },
    {
        model: models.fullReleaseReleaser,
        as: 'releaser',
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
    let fullRelease = await models.fullRelease.findAll({
        where: searchQuery,
        attributes: { exclude: ['createdAt', 'createdBy', 'modifiedBy', 'isActive'] },
        order: [["updatedAt", "DESC"]],
        offset: offset,
        limit: pageSize,
        subQuery: false,
        include: includeArray
    })

    let count = await models.fullRelease.findAll({
        where: searchQuery,
        subQuery: false,
        include: includeArray
    })

    return res.status(200).json({ data: fullRelease, count: count.length });
}

exports.updateAmountStatusFullRelease = async (req, res, next) => {
    let { amountStatus, fullReleaseId } = req.body;
    let modifiedBy = req.userData.id;
    let createdBy = req.userData.id;
    let fullReleaseData = await models.fullRelease.findOne({ where: { id: fullReleaseId }, attributes: ['amountStatus', 'customerLoanTransactionId', 'masterLoanId'] });
    if (fullReleaseData) {
        if (fullReleaseData.amountStatus == 'pending' || fullReleaseData.amountStatus == 'rejected') {
            if (amountStatus == 'completed') {
                let payment = await allInterestPayment(fullReleaseData.customerLoanTransactionId);
                let { securedPayableOutstanding, unSecuredPayableOutstanding, transactionDataSecured, transactionDataUnSecured, securedOutstandingAmount, unSecuredOutstandingAmount, outstandingAmount, securedLoanUniqueId, unSecuredLoanUniqueId } = await getTransactionPrincipalAmount(fullReleaseData.customerLoanTransactionId);
                await sequelize.transaction(async t => {

                    //update in interest table
                    if (payment.securedLoanDetails) {
                        for (const interest of payment.securedLoanDetails) {
                            await models.customerLoanInterest.update({ paidAmount: interest.paidAmount, interestAccrual: interest.interestAccrual, outstandingInterest: interest.outstandingInterest, emiReceivedDate: moment(), penalAccrual: interest.penalAccrual, penalOutstanding: interest.penalOutstanding, penalPaid: interest.penalPaid, modifiedBy, emiStatus: interest.emiStatus }, { where: { id: interest.id }, transaction: t });
                        }
                    }
                    if (payment.unsecuredLoanDetails) {
                        for (const interest of payment.unsecuredLoanDetails) {
                            await models.customerLoanInterest.update({ paidAmount: interest.paidAmount, interestAccrual: interest.interestAccrual, outstandingInterest: interest.outstandingInterest, emiReceivedDate: moment(), penalAccrual: interest.penalAccrual, penalOutstanding: interest.penalOutstanding, penalPaid: interest.penalPaid, modifiedBy, emiStatus: interest.emiStatus }, { where: { id: interest.id }, transaction: t });
                        }
                    }
                    //update in transaction
                    if (payment.transactionDetails) {
                        for (const amount of payment.transactionDetails) {
                            if (amount.isPenalInterest) {
                                //debit
                                let checkDebitEntry = await models.customerTransactionDetail.findAll({ where: { masterLoanId: amount.masterLoanId, loanId: amount.loanId, loanInterestId: amount.loanInterestId, isPenalInterest: true } });
                                if (checkDebitEntry.length == 0) {
                                    let debit = await models.customerTransactionDetail.create({ masterLoanId: amount.masterLoanId, loanId: amount.loanId, loanInterestId: amount.loanInterestId, isPenalInterest: true, debit: amount.penalInterest, description: `Penal interest` }, { transaction: t });
                                    await models.customerTransactionDetail.update({ referenceId: `${amount.loanUniqueId}-${debit.id}` }, { where: { id: debit.id }, transaction: t });
                                } else {
                                    let debitedAmount = await checkDebitEntry.map((data) => Number(data.debit));
                                    let totalDebitedAmount = _.sum(debitedAmount);
                                    let newDebitAmount = amount.penalInterest - totalDebitedAmount;
                                    if (newDebitAmount > 0) {
                                        let debit = await models.customerTransactionDetail.create({ masterLoanId: amount.masterLoanId, loanId: amount.loanId, loanInterestId: amount.loanInterestId, isPenalInterest: true, debit: newDebitAmount, description: `Penal interest` }, { transaction: t });
                                        await models.customerTransactionDetail.update({ referenceId: `${amount.loanUniqueId}-${debit.id}` }, { where: { id: debit.id }, transaction: t });
                                    }
                                }
                                //credit
                                let description = "penal interest Received"
                                let paid = await models.customerTransactionDetail.create({ customerLoanTransactionId: fullReleaseData.customerLoanTransactionId, masterLoanId: amount.masterLoanId, loanId: amount.loanId, isPenalInterest: amount.isPenalInterest, credit: amount.credit, description: description, paymentDate: moment() }, { transaction: t });
                                await models.customerTransactionDetail.update({ referenceId: `${amount.loanUniqueId}-${paid.id}` }, { where: { id: paid.id }, transaction: t });
                            } else {
                                if (amount.isExtraDaysInterest) {
                                    //debit
                                    let checkDebitEntry = await models.customerTransactionDetail.findAll({ where: { masterLoanId: amount.masterLoanId, loanId: amount.loanId, loanInterestId: amount.loanInterestId, isPenalInterest: false } });
                                    if (checkDebitEntry.length == 0) {
                                        let debit = await models.customerTransactionDetail.create({ masterLoanId: amount.masterLoanId, loanId: amount.loanId, loanInterestId: amount.loanInterestId, debit: amount.interestAmount, description: `Extra days interest` }, { transaction: t });
                                        await models.customerTransactionDetail.update({ referenceId: `${amount.loanUniqueId}-${debit.id}` }, { where: { id: debit.id }, transaction: t });
                                    } else {
                                        let debitedAmount = await checkDebitEntry.map((data) => Number(data.debit));
                                        let totalDebitedAmount = _.sum(debitedAmount);
                                        let newDebitAmount = amount.interestAmount - totalDebitedAmount;
                                        if (newDebitAmount > 0) {
                                            let debit = await models.customerTransactionDetail.create({ masterLoanId: amount.masterLoanId, loanId: amount.loanId, loanInterestId: amount.loanInterestId, debit: newDebitAmount, description: `Extra days interest` }, { transaction: t });
                                            await models.customerTransactionDetail.update({ referenceId: `${amount.loanUniqueId}-${debit.id}` }, { where: { id: debit.id }, transaction: t });
                                        }
                                    }
                                    //credit
                                    let paid = await models.customerTransactionDetail.create({ customerLoanTransactionId: fullReleaseData.customerLoanTransactionId, masterLoanId: amount.masterLoanId, loanId: amount.loanId, credit: amount.credit, description: `Extra days interest received`, paymentDate: moment(), }, { transaction: t });
                                    await models.customerTransactionDetail.update({ referenceId: `${amount.loanUniqueId}-${paid.id}` }, { where: { id: paid.id }, transaction: t });
                                } else {
                                    let paid = await models.customerTransactionDetail.create({ customerLoanTransactionId: fullReleaseData.customerLoanTransactionId, masterLoanId: amount.masterLoanId, loanId: amount.loanId, credit: amount.credit, description: `interest received ${amount.emiDueDate}`, paymentDate: moment(), }, { transaction: t });
                                    await models.customerTransactionDetail.update({ referenceId: `${amount.loanUniqueId}-${paid.id}` }, { where: { id: paid.id }, transaction: t });
                                }

                            }
                        }
                    }
                    //credit part release ornament amount
                    let securedTransaction = await models.customerTransactionDetail.create({ masterLoanId: fullReleaseData.masterLoanId, customerLoanTransactionId: fullReleaseData.customerLoanTransactionId, loanId: transactionDataSecured.loanId, credit: securedPayableOutstanding, paymentDate: moment(), description: "full release ornament amount" }, { transaction: t });
                    await models.customerTransactionDetail.update({ referenceId: `${securedLoanUniqueId}-${securedTransaction.id}` }, { where: { id: securedTransaction.id }, transaction: t })
                    if (transactionDataUnSecured) {
                        let unSecuredTransaction = await models.customerTransactionDetail.create({ masterLoanId: fullReleaseData.masterLoanId, customerLoanTransactionId: fullReleaseData.customerLoanTransactionId, loanId: transactionDataUnSecured.loanId, credit: unSecuredPayableOutstanding, paymentDate: moment(), description: "full release ornament amount" }, { transaction: t });
                        await models.customerTransactionDetail.update({ referenceId: `${unSecuredLoanUniqueId}-${unSecuredTransaction.id}` }, { where: { id: unSecuredTransaction.id }, transaction: t })
                    }
                    await models.customerLoanTransaction.update({ depositStatus: "Completed", paymentReceivedDate: moment() }, { where: { id: fullReleaseData.customerLoanTransactionId }, transaction: t });
                    await models.customerLoan.update({ outstandingAmount: securedOutstandingAmount }, { where: { id: transactionDataSecured.loanId }, transaction: t });
                    if (transactionDataUnSecured) {
                        await models.customerLoan.update({ outstandingAmount: unSecuredOutstandingAmount }, { where: { id: transactionDataUnSecured.loanId }, transaction: t });
                    }
                    await models.customerLoanMaster.update({ outstandingAmount: outstandingAmount }, { where: { id: fullReleaseData.masterLoanId }, transaction: t });
                    await models.fullRelease.update({ amountStatus: 'completed', modifiedBy }, { where: { id: fullReleaseId }, transaction: t });
                    await models.fullReleaseHistory.create({ fullReleaseId: fullReleaseId, action: actionFullRelease.FULL_RELEASE_AMOUNT_STATUS_C, createdBy, modifiedBy }, { transaction: t });
                });
                return res.status(200).json({ message: "success", payment });
            } else if (amountStatus == 'rejected') {
                await sequelize.transaction(async t => {
                    await models.customerLoanTransaction.update({ depositStatus: "Rejected" }, { where: { id: fullReleaseData.customerLoanTransactionId }, transaction: t });
                    await models.fullRelease.update({ amountStatus: 'rejected', modifiedBy }, { where: { id: fullReleaseId }, transaction: t });
                    await models.fullReleaseHistory.create({ fullReleaseId: fullReleaseId, action: actionFullRelease.FULL_RELEASE_AMOUNT_STATUS_R, createdBy, modifiedBy }, { transaction: t });
                });
                return res.status(200).json({ message: "success" });
            } else if (amountStatus == 'pending') {
                await sequelize.transaction(async t => {
                    await models.fullRelease.update({ amountStatus: 'pending', modifiedBy }, { where: { id: fullReleaseId }, transaction: t });
                    await models.fullReleaseHistory.create({ fullReleaseId: fullReleaseId, action: actionFullRelease.FULL_RELEASE_AMOUNT_STATUS_P, createdBy, modifiedBy }, { transaction: t });
                });
                return res.status(200).json({ message: "success" });
            }
        } else { return res.status(400).json({ message: "you can't change status as it's already updated" }); }
    } else {
        return res.status(404).json({ message: "Data not found" });
    }

}

exports.fullReleaseAssignReleaser = async (req, res, next) => {

    let { fullReleaseId, releaserId, customerId, appoinmentDate, startTime, endTime } = req.body;
    let createdBy = req.userData.id;
    let modifiedBy = req.userData.id;
    let existAssign = await models.fullReleaseReleaser.findOne({ where: { fullReleaseId, isActive: true } });
    if (!check.isEmpty(existAssign)) {
        return res.status(400).json({ message: `Already assigned appraiser to this full release process.` });
    }
    await sequelize.transaction(async t => {
        await models.fullReleaseReleaser.create({ fullReleaseId, customerId, releaserId, createdBy, modifiedBy, appoinmentDate, startTime, endTime }, { transaction: t });
        await models.fullRelease.update({ isReleaserAssigned: true }, { where: { id: fullReleaseId }, transaction: t });
        await models.fullReleaseHistory.create({ fullReleaseId: fullReleaseId, action: actionFullRelease.FULL_RELEASE_ASSIGNED_RELEASER, createdBy, modifiedBy }, { transaction: t });
    });
    // send sms
    // let customerInfo = await models.customer.findOne({ where: { id: customerId } })
    // let { mobileNumber, firstName, userUniqueId } = await models.user.findOne({ where: { id: appraiserId } });
    // request(`${CONSTANT.SMSURL}username=${CONSTANT.SMSUSERNAME}&password=${CONSTANT.SMSPASSWORD}&type=0&dlr=1&destination=${mobileNumber}&source=nicalc&message=${customerInfo.firstName} is assign for you`);
    return res.status(200).json({ message: 'success' });
}

exports.updateReleaser = async (req, res, next) => {
    let { fullReleaseId, releaserId, customerId, appoinmentDate, startTime, endTime } = req.body;
    let createdBy = req.userData.id;
    let modifiedBy = req.userData.id;
    await sequelize.transaction(async t => {
        await models.fullReleaseReleaser.update({ customerId, releaserId, modifiedBy, appoinmentDate, startTime, endTime }, { where: { fullReleaseId }, transaction: t });
        await models.fullReleaseHistory.create({ fullReleaseId: fullReleaseId, action: actionFullRelease.FULL_RELEASE_UPDATED_RELEASER, createdBy, modifiedBy }, { transaction: t });
    });
    return res.status(200).json({ message: 'success' });
}

exports.getFullReleaseApprovedList = async (req, res, next) => {
    const { search, offset, pageSize } = paginationWithFromTo(
        req.query.search,
        req.query.from,
        req.query.to
    );
    let userId = req.userData.id;
    let releaserSearch = { isActive: true }
    if (req.userData.userTypeId != 4) {
        releaserSearch.releaserId = userId;
    }
    let query = {};
    const searchQuery = {
        [Op.and]: [query, {
            [Op.or]: {
                release_gross_weight: sequelize.where(
                    sequelize.cast(sequelize.col("release_gross_weight"), "varchar"), { [Op.iLike]: search + "%" }),
                amount_status: sequelize.where(
                    sequelize.cast(sequelize.col("amount_status"), "varchar"), { [Op.iLike]: search + "%" }),
                release_deduction_weight: sequelize.where(
                    sequelize.cast(sequelize.col("release_deduction_weight"), "varchar"), { [Op.iLike]: search + "%" }),
                release_net_weight: sequelize.where(
                    sequelize.cast(sequelize.col("release_net_weight"), "varchar"), { [Op.iLike]: search + "%" }),
                release_amount: sequelize.where(
                    sequelize.cast(sequelize.col("release_amount"), "varchar"), { [Op.iLike]: search + "%" }),
                payable_amount: sequelize.where(
                    sequelize.cast(sequelize.col("payable_amount"), "varchar"), { [Op.iLike]: search + "%" }),
                interest_amount: sequelize.where(
                    sequelize.cast(sequelize.col("interest_amount"), "varchar"), { [Op.iLike]: search + "%" }),
                penal_interest: sequelize.where(
                    sequelize.cast(sequelize.col("penal_interest"), "varchar"), { [Op.iLike]: search + "%" }),
                remaining_net_weight: sequelize.where(
                    sequelize.cast(sequelize.col("remaining_net_weight"), "varchar"), { [Op.iLike]: search + "%" }),
                "$masterLoan.loanPersonalDetail.customer_unique_id$": { [Op.iLike]: search + "%" },
                "$masterLoan.outstanding_amount$": sequelize.where(sequelize.cast(sequelize.col("masterLoan.outstanding_amount"), "varchar"), { [Op.iLike]: search + "%" }),
                "$masterLoan.tenure$": sequelize.where(sequelize.cast(sequelize.col("masterLoan.tenure"), "varchar"), { [Op.iLike]: search + "%" }),
                "$masterLoan.customerLoan.loan_unique_id$": { [Op.iLike]: search + "%" },
                final_loan_amount: sequelize.where(
                    sequelize.cast(sequelize.col("masterLoan.final_loan_amount"), "varchar"), { [Op.iLike]: search + "%" })
            },
        }],
        isActive: true
    }
    let includeArray = [{
        model: models.customerLoanMaster,
        as: 'masterLoan',
        attributes: ['customerId', 'outstandingAmount', 'masterLoanUniqueId', 'finalLoanAmount', 'tenure', 'loanStartDate', 'loanEndDate'],
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
            }, {
                model: models.customerLoanOrnamentsDetail,
                as: 'loanOrnamentsDetail',
                include: [
                    {
                        model: models.ornamentType,
                        as: "ornamentType"
                    },
                    {
                        model: models.packet
                    }
                ]
            },
        ]
    },
    {
        model: models.fullReleaseReleaser,
        as: 'releaser',
        where: releaserSearch,
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
    let fullRelease = await models.fullRelease.findAll({
        where: searchQuery,
        attributes: { exclude: ['createdAt', 'createdBy', 'modifiedBy', 'isActive'] },
        order: [["updatedAt", "DESC"]],
        offset: offset,
        limit: pageSize,
        subQuery: false,
        include: includeArray
    })

    let count = await models.fullRelease.findAll({
        where: searchQuery,
        subQuery: false,
        include: includeArray
    })

    return res.status(200).json({ data: fullRelease, count: count.length });
}

exports.updatePartReleaseReleaserStatus = async (req, res, next) => {
    let { fullReleaseStatus, releaserReason, fullReleaseId } = req.body;
    let modifiedBy = req.userData.id;
    let createdBy = req.userData.id;
    let userId = req.userData.id;
    let releaserSearch = { isActive: true }
    let releaseDate = Date.now();
    if (req.userData.userTypeId != 4) {
        releaserSearch.releaserId = userId;
    }
    let fullReleaseData = await models.fullRelease.findOne({
        where: { id: fullReleaseId },
        attributes: ['amountStatus', 'fullReleaseStatus', 'masterLoanId'],
        include: [{
            model: models.fullReleaseReleaser,
            as: 'releaser',
            subQuery: false,
            where: releaserSearch,
            attributes: ['releaserId']
        }]
    });
    if (fullReleaseData) {
        if (fullReleaseData.fullReleaseStatus == "pending") {
            if (fullReleaseStatus == "pending") {
                await sequelize.transaction(async t => {
                    await models.fullRelease.update({ fullReleaseStatus, releaserReason, modifiedBy }, { where: { id: fullReleaseId }, transaction: t });
                    await models.fullReleaseHistory.create({ fullReleaseId: fullReleaseId, action: actionFullRelease.FULL_RELEASE_STATUS_P, createdBy, modifiedBy }, { transaction: t });
                });
                return res.status(200).json({ message: "success" });
            } else if (fullReleaseStatus == "released") {
                await sequelize.transaction(async t => {
                    await models.fullRelease.update({ fullReleaseStatus, modifiedBy, releaseDate }, { where: { id: fullReleaseId }, transaction: t });
                    await models.customerLoanMaster.update({ isOrnamentsReleased: true, modifiedBy }, { where: { id: fullReleaseData.masterLoanId }, transaction: t });
                    await models.fullReleaseHistory.create({ fullReleaseId: fullReleaseId, action: actionFullRelease.FULL_RELEASE_STATUS_R, createdBy, modifiedBy }, { transaction: t });
                });
                return res.status(200).json({ message: "success" });
            }
        } else {
            return res.status(400).json({ message: "Now you can't change status as it's Already released!" });
        }
    } else {
        return res.status(400).json({ message: "This full release process is not assigned to you!" })
    }
}

exports.uploadDocumentFullRelease = async (req, res, next) => {
    let { documents, fullReleaseId } = req.body;
    let modifiedBy = req.userData.id;
    let createdBy = req.userData.id;
    let userId = req.userData.id;
    let releaserSearch = { isActive: true }
    if (req.userData.userTypeId != 4) {
        releaserSearch.releaserId = userId;
    }
    let fullReleaseData = await models.fullRelease.findOne({
        where: { id: fullReleaseId },
        attributes: ['amountStatus', 'fullReleaseStatus', 'masterLoanId'],
        include: [{
            model: models.fullReleaseReleaser,
            as: 'releaser',
            subQuery: false,
            where: releaserSearch,
            attributes: ['releaserId']
        }]
    });
    if (fullReleaseData) {
        await sequelize.transaction(async t => {
            await models.fullRelease.update({ documents, modifiedBy }, { where: { id: fullReleaseId }, transaction: t });
            await models.fullReleaseHistory.create({ fullReleaseId: fullReleaseId, action: actionFullRelease.FULL_RELEASE_DOCUMENT, createdBy, modifiedBy }, { transaction: t });
        });
        return res.status(200).json({ message: 'success' });
    } else {
        return res.status(400).json({ message: "This full release process is not assigned to you!" })
    }
}