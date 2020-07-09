// LOAD REQUIRED PACKAGES
const models = require('../../models');
const sequelize = models.sequelize;
const Sequelize = models.Sequelize;
const Op = Sequelize.Op;
const paginationFUNC = require('../../utils/pagination'); // IMPORTING PAGINATION FUNCTION

const check = require("../../lib/checkLib"); // IMPORTING CHECKLIB 


exports.customerDetails = async (req, res, next) => {

    let customerUniqueId = req.params.customerUniqueId;
    

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
        let createLoanTransfer = await models.customerLoanTransfer.create({ loanTransferCurrentStage: '2' }, { transaction: t });

        await models.customerLoanTransferHistory.create({ loanTransferId: createLoanTransfer.id, action: "Loan transfer basic details submitted", createdBy, modifiedBy }, { transaction: t })

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
                await models.customerLoanTransferHistory.create({ loanTransferId: masterLoan.loanTransfer.id, action: "Loan transfer documents submitted", createdBy, modifiedBy }, { transaction: t })
            } else {
                await models.customerLoanTransfer.update({ pawnTicket, signedCheque, declaration, outstandingLoanAmount, disbursedLoanAmount }, { where: { id: masterLoan.loanTransfer.id }, transaction: t })
                await models.customerLoanTransferHistory.create({ loanTransferId: masterLoan.loanTransfer.id, action: "Loan transfer documents updated", createdBy, modifiedBy }, { transaction: t })
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
                    await models.customerLoanTransferHistory.create({ loanTransferId: masterLoan.loanTransfer.id, action: `Loan transfer approved by BM`, createdBy, modifiedBy }, { transaction: t })
                    return res.status(200).json({ message: 'success', masterLoanId, loanId, loanUniqueId, disbursedLoanAmount: masterLoan.loanTransfer.disbursedLoanAmount,loanCurrentStage:'4' })
                } else if (loanTransferStatusForBM == "rejected") {
                    await models.customerLoanTransfer.update({ loanTransferStatusForBM, modifiedBy, reasonByBM }, { where: { id: masterLoan.loanTransfer.id }, transaction: t });
                    await models.customerLoanTransferHistory.create({ loanTransferId: masterLoan.loanTransfer.id, action: `Loan transfer rejected by BM`, createdBy, modifiedBy }, { transaction: t })
                    return res.status(200).json({ message: 'success', masterLoanId, loanId,loanCurrentStage:'4' })
                } else {
                    await models.customerLoanTransfer.update({ loanTransferStatusForBM, modifiedBy, reasonByBM }, { where: { id: masterLoan.loanTransfer.id }, transaction: t });
                    await models.customerLoanTransferHistory.create({ loanTransferId: masterLoan.loanTransfer.id, action: `Loan transfer status changed to incomplete by BM`, createdBy, modifiedBy }, { transaction: t })
                    return res.status(200).json({ message: 'success', masterLoanId, loanId,loanCurrentStage:'4' })
                }
            } else {
                return res.status(400).json({ message: 'You cannot change status for this customer', masterLoanId, loanId })
            }
        })
    } else {
        return res.status(400).json({ message: 'You cannot change status for this customer', masterLoanId, loanId })
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
                    await models.customerLoanTransferHistory.create({ loanTransferId: masterLoan.loanTransfer.id, action: `Paid the outstanding loan amount to the existing loan company`, createdBy, modifiedBy }, { transaction: t })
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

//get single customer loan details DONE
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


