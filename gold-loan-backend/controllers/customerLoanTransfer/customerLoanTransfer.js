// LOAD REQUIRED PACKAGES
const models = require('../../models');
const sequelize = models.sequelize;
const Sequelize = models.Sequelize;
const Op = Sequelize.Op;
const paginationFUNC = require('../../utils/pagination'); // IMPORTING PAGINATION FUNCTION
const  loanTransferHistory = require('../../utils/customerLoanTransferHistory')
const check = require("../../lib/checkLib"); // IMPORTING CHECKLIB 


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

    let customerLoanStage = await models.customerLoanMaster.findOne({
        where: { customerId: customerData.id, isLoanSubmitted: false },
        include: [{
            model: models.customerLoanTransfer,
            as: "loanTransfer",
            where: {loanTransferCurrentStage: { [Op.notIn]: ["5"] } },
        }]
    })

    if (!check.isEmpty(customerLoanStage)) {
        let customerCurrentStage = customerLoanStage.loanTransfer.loanTransferCurrentStage;
        let loanId = await models.customerLoan.findOne({ where: { masterLoanId: customerLoanStage.id, loanType: 'secured' } })
        if (customerCurrentStage == '2') {
            return res.status(200).json({ message: 'success', loanId: loanId.id, masterLoanId: customerLoanStage.id, loanCurrentStage: customerCurrentStage })
        } else if (customerCurrentStage == '3') {
            return res.status(200).json({ message: 'success', loanId: loanId.id, masterLoanId: customerLoanStage.id, loanCurrentStage: customerCurrentStage })
        } else if (customerCurrentStage == '4') {
            return res.status(200).json({ message: 'success', loanId: loanId.id, masterLoanId: customerLoanStage.id, loanCurrentStage: customerCurrentStage, loanUniqueId: customerLoanStage.loanTransfer.transferredLoanId, disbursedLoanAmount: customerLoanStage.loanTransfer.disbursedLoanAmount })
        }
    }

    if (!customerData) {
        res.status(404).json({ message: 'no customer details found' });
    } else {
        res.status(200).json({ message: 'customer details fetch successfully', customerData,loanCurrentStage: '1' });
    }
}

exports.loanTransferBasicDeatils = async (req, res, next) => {
    let { customerId, customerUniqueId, kycStatus, startDate, masterLoanId } = req.body
    let createdBy = req.userData.id;
    let modifiedBy = req.userData.id;
    let stageId = await models.loanStage.findOne({ where: { name: 'loan transfer' } })

    if (masterLoanId != null) {
        let customerLoanMaster = await models.customerLoanMaster.findOne({ where: { id: masterLoanId } })
        let loanId = await models.customerLoan.findOne({ where: { masterLoanId: customerLoanMaster.id, loanType: 'secured' } })
        if (!check.isEmpty(customerLoanMaster)) {
            return res.status(200).json({ message: 'success', loanId: loanId.id, masterLoanId: customerLoanMaster.id, loanCurrentStage: '2' })
        }
    }
    let loanData = await sequelize.transaction(async t => {
        let createLoanTransfer = await models.customerLoanTransfer.create({ loanTransferCurrentStage: '2',createdBy, modifiedBy }, { transaction: t });
        await models.customerLoanTransferHistory.create({ loanTransferId: createLoanTransfer.id, action: loanTransferHistory.BASIC_DETAILS_SUBMIT, createdBy, modifiedBy }, { transaction: t })
        let masterLoan = await models.customerLoanMaster.create({ customerId: customerId, loanStageId: stageId.id, customerLoanCurrentStage: '1', createdBy, modifiedBy, loanTransferId: createLoanTransfer.id }, { transaction: t })
        let loan = await models.customerLoan.create({ customerId, masterLoanId: masterLoan.id, loanType: 'secured', createdBy, modifiedBy }, { transaction: t })
        await models.customerLoanPersonalDetail.create({ loanId: loan.id, masterLoanId: masterLoan.id, purpose: "Loan transfer", customerUniqueId, startDate, kycStatus, createdBy, modifiedBy }, { transaction: t })
        return loan
    })
    return res.status(200).json({ message: 'success', loanId: loanData.id, masterLoanId: loanData.masterLoanId, loanCurrentStage: '2' })

}

exports.loanTransferDocuments = async (req, res, next) => {

    let { pawnTicket, signedCheque, declaration, outstandingLoanAmount, loanId, masterLoanId } = req.body
    let createdBy = req.userData.id;
    let modifiedBy = req.userData.id;
    let disbursedLoanAmount = outstandingLoanAmount;
    let masterLoan = await models.customerLoanMaster.findOne({
        where: { id: masterLoanId },
        include: [{
            model: models.customerLoanTransfer,
            as: "loanTransfer",
        }]
    });
    if (masterLoan.loanTransfer.loanTransferStatusForBM == "incomplete") {
        await sequelize.transaction(async t => {
            if (!masterLoan.loanTransfer.pawnTicket || !masterLoan.loanTransfer.signedCheque || !masterLoan.loanTransfer.declaration || !masterLoan.loanTransfer.outstandingLoanAmount) {
                await models.customerLoanTransfer.update({ pawnTicket, signedCheque, declaration, outstandingLoanAmount, modifiedBy, loanTransferCurrentStage: '3', disbursedLoanAmount }, { where: { id: masterLoan.loanTransfer.id }, transaction: t })
                await models.customerLoanTransferHistory.create({ loanTransferId: masterLoan.loanTransfer.id, action: loanTransferHistory.LOAN_DOCUMENTS, createdBy, modifiedBy }, { transaction: t })
            } else {
                await models.customerLoanTransfer.update({ pawnTicket, signedCheque, declaration, outstandingLoanAmount, disbursedLoanAmount }, { where: { id: masterLoan.loanTransfer.id }, transaction: t })
                await models.customerLoanTransferHistory.create({ loanTransferId: masterLoan.loanTransfer.id, action: loanTransferHistory.LOAN_DOCUMENTS_UPDATED, createdBy, modifiedBy }, { transaction: t })
            }
        })
    }
    return res.status(200).json({ message: 'success', masterLoanId, loanId,loanCurrentStage:'3' })
}

exports.loanTransferBmRating = async (req, res, next) => {

    let { loanTransferStatusForBM, reasonByBM, loanId, masterLoanId } = req.body
    let createdBy = req.userData.id;
    let modifiedBy = req.userData.id;

    let masterLoan = await models.customerLoanMaster.findOne({
        where: { id: masterLoanId },
        include: [{
            model: models.customerLoanTransfer,
            as: "loanTransfer",
        }]
    });
    if (req.userData.userTypeId == 5) {
        await sequelize.transaction(async t => {
            if (masterLoan.loanTransfer.loanTransferStatusForBM == "incomplete") {
                if (loanTransferStatusForBM == "approved") {
                    let loanUniqueId = `LOAN${Math.floor(1000 + Math.random() * 9000)}`;
                    await models.customerLoanTransfer.update({ loanTransferStatusForBM, modifiedBy, loanTransferCurrentStage: '4', transferredLoanId: loanUniqueId }, { where: { id: masterLoan.loanTransfer.id }, transaction: t });
                    await models.customerLoan.update({ loanUniqueId: loanUniqueId }, { where: { id: loanId }, transaction: t }) 
                    await models.customerLoanTransferHistory.create({ loanTransferId: masterLoan.loanTransfer.id, action: loanTransferHistory.BM_RATING_APPROVED, createdBy, modifiedBy }, { transaction: t })
                    return res.status(200).json({ message: 'success', masterLoanId, loanId, loanUniqueId, disbursedLoanAmount: masterLoan.loanTransfer.disbursedLoanAmount,loanCurrentStage:'4' })
                } else if (loanTransferStatusForBM == "rejected") {
                    await models.customerLoanTransfer.update({ loanTransferStatusForBM, modifiedBy, reasonByBM }, { where: { id: masterLoan.loanTransfer.id }, transaction: t });
                    await models.customerLoanTransferHistory.create({ loanTransferId: masterLoan.loanTransfer.id, action: loanTransferHistory.BM_RATING_REJECTED, createdBy, modifiedBy }, { transaction: t })
                    return res.status(200).json({ message: 'success', masterLoanId, loanId,loanCurrentStage:'4' })
                } else {
                    await models.customerLoanTransfer.update({ loanTransferStatusForBM, modifiedBy, reasonByBM }, { where: { id: masterLoan.loanTransfer.id }, transaction: t });
                    await models.customerLoanTransferHistory.create({ loanTransferId: masterLoan.loanTransfer.id, action: loanTransferHistory.BM_RATING_PENDING, createdBy, modifiedBy }, { transaction: t })
                    return res.status(200).json({ message: 'success', masterLoanId, loanId,loanCurrentStage:'4' })
                }
            } else {
                return res.status(400).json({ message: 'You cannot change status for this customer' })
            }
        })
    } else {
        return res.status(400).json({ message: 'You cannot change status for this customer' })
    }
}

exports.loanTransferDisbursal = async (req, res, next) => {
    let { transactionId, loanId, masterLoanId } = req.body
    let createdBy = req.userData.id;
    let modifiedBy = req.userData.id;
    let masterLoan = await models.customerLoanMaster.findOne({
        where: { id: masterLoanId },
        include: [{
            model: models.customerLoanTransfer,
            as: "loanTransfer",
        }]
    });
        await sequelize.transaction(async t => {
            if (masterLoan.loanTransfer.loanTransferStatusForBM == "approved" && masterLoan.loanTransfer.loanTransferCurrentStage == 5) {
                return res.status(400).json({ message: 'Amount is already disbursed'})
            } else {
                if(masterLoan.loanTransfer.loanTransferStatusForBM == "approved"){
                    await models.customerLoanTransfer.update({ transactionId, modifiedBy, loanTransferCurrentStage: '5' }, { where: { id: masterLoan.loanTransfer.id }, transaction: t });
                    await models.customerLoanTransferHistory.create({ loanTransferId: masterLoan.loanTransfer.id, action: loanTransferHistory.LOAN_DOCUMENTS, createdBy, modifiedBy }, { transaction: t })
                    return res.status(200).json({ message: 'success', masterLoanId, loanId })
                }else{
                    if(masterLoan.loanTransfer.loanTransferStatusForBM == "incomplete"){
                        return res.status(400).json({ message: 'BM approval  is pending' })
                    }else{
                        return res.status(400).json({ message: 'Loan transfer request is rejected by BM' })
                    }
                }
               
            }
        })
}

exports.getSingleLoanDetails = async (req, res, next) => {

    let customerLoanId = req.query.customerLoanId

    let customerLoan = await models.customerLoan.findOne({
        where: { id: customerLoanId },
        attributes:['id','loanUniqueId','masterLoanId'],
        include: [
            {
                model: models.customerLoanMaster,
                as: 'masterLoan',
                attributes:['id','loanTransferId'],
                include: [{
                    model: models.customerLoanTransfer,
                    as: "loanTransfer",
                    attributes:['id','transferredLoanId','disbursedLoanAmount','transactionId','loanTransferStatusForBM','reasonByBM','pawnTicket','signedCheque','declaration','outstandingLoanAmount','loanTransferCurrentStage','isLoanApplied']
                }]
            }]
    });
    if(!customerLoan){
        return res.status(404).json({ message: 'Data not found'})
    }else{
        return res.status(200).json({ message: 'success', data: customerLoan })
    }
}

exports.getLoanTransferList = async (req, res, next) => {

    let { search, offset, pageSize } =
    paginationFUNC.paginationWithFromTo(req.query.search, req.query.from, req.query.to);
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
                "$customerLoan.loan_unique_id$": { [Op.iLike]: search + '%' }
            },
        }],
        isActive: true,
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
            attributes:['loanUniqueId','customerId','masterLoanId']
        },
        {
            model: models.customer,
            as: 'customer',
            where: internalBranchWhere,
            attributes: { exclude: ['mobileNumber', 'createdAt', 'updatedAt', 'createdBy', 'modifiedBy', 'isActive'] }
        },
        {
            model: models.customerLoanTransfer,
            as: "loanTransfer",
            attributes: { exclude: [ 'updatedAt', 'createdBy', 'modifiedBy', 'isActive'] }
        }
    ]
    
    let loanDetails = await models.customerLoanMaster.findAll({
        where: searchQuery,
        subQuery: false,
        include: associateModel,
        attributes:['loanTransferId'],
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
        return res.status(200).json({data:[],count:0});
    } else {
        return res.status(200).json({ data: loanDetails, count: count.length });
    }
}


