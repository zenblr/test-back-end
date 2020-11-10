// LOAD REQUIRED PACKAGES
const models = require('../../models');
const sequelize = models.sequelize;
const Sequelize = models.Sequelize;
const Op = Sequelize.Op;
const paginationFUNC = require('../../utils/pagination'); // IMPORTING PAGINATION FUNCTION
const extend = require('extend')
const check = require("../../lib/checkLib"); // IMPORTING CHECKLIB 
const moment = require('moment');
var fs = require('fs');
const _ = require('lodash');
var randomize = require('randomatic');
const { sendDisbursalMessage, sendTransferLoanRequestMessage } = require('../../utils/SMS')

exports.applyLoanTransferFromApp = async (req, res, next) => {


    let { customerId, customerUniqueId, kycStatus, startDate, masterLoanId, requestId, pawnTicket, signedCheque, declaration, outstandingLoanAmount, loanTransferStatusForAppraiser, reasonByAppraiser } = req.body
    let disbursedLoanAmount = outstandingLoanAmount;
    let createdBy = req.userData.id;
    let modifiedBy = req.userData.id;
    let stageId = await models.loanStage.findOne({ where: { name: 'loan transfer' } })
    let disbursedLoanAmount = outstandingLoanAmount;


    let masterLoan = await models.customerLoanMaster.findOne({
        where: { id: masterLoanId },
        include: [
            {
                model: models.customerLoanTransfer,
                as: "loanTransfer",
            },
            {
                model: models.customerLoan,
                as: 'customerLoan'
            }
        ]
    });
    
    if (!check.isEmpty(masterLoan)) {
        if (masterLoan.loanTransfer.loanTransferStatusForBM == "approved" || masterLoan.loanTransfer.loanTransferStatusForBM == "rejected" || masterLoan.loanTransfer.loanTransferStatusForAppraiser == "approved" || masterLoan.loanTransfer.loanTransferStatusForAppraiser == "rejected") {
            return res.status(400).json({ message: 'You cannot change documents now' })
        }
    }
    
    let loanId
    let loanTransferId
    await sequelize.transaction(async t => {

        if (check.isEmpty(masterLoan)) {
            let createLoanTransfer = await models.customerLoanTransfer.create({ createdBy, modifiedBy }, { transaction: t });

            let newMasterLoan = await models.customerLoanMaster.create({ customerId: customerId, loanStageId: stageId.id, createdBy, modifiedBy, internalBranchId: req.userData.internalBranchId, loanTransferId: createLoanTransfer.id, appraiserRequestId: requestId, isLoanTransfer: true }, { transaction: t })

            let loan = await models.customerLoan.create({ customerId, masterLoanId: newMasterLoan.id, loanType: 'secured', createdBy, modifiedBy }, { transaction: t })

            await models.customerLoanPersonalDetail.create({ loanId: loan.id, masterLoanId: newMasterLoan.id, customerUniqueId, startDate, kycStatus, createdBy, modifiedBy }, { transaction: t })

            masterLoanId = newMasterLoan.id
            loanId = loan.id
            loanTransferId = createLoanTransfer.id
        } else {
            masterLoanId = masterLoan.id
            loanId = masterLoan.customerLoan[0].id
            loanTransferId = masterLoan.loanTransfer.id
        }

        await models.appraiserRequest.update({ status: 'complete', isProcessComplete: true }, { where: { id: requestId }, transaction: t })

        let data = await models.customer.findOne({ where: { id: customerId }, transaction: t })

        await sendTransferLoanRequestMessage(data.mobileNumber, data.firstName)

        //documents update

        await models.customerLoanTransfer.update({ pawnTicket, signedCheque, declaration, outstandingLoanAmount, disbursedLoanAmount }, { where: { id: loanTransferId }, transaction: t })

        //appraiser rating
        if (loanTransferStatusForAppraiser == "approved") {
            await models.customerLoanTransfer.update({ loanTransferStatusForAppraiser, modifiedBy, reasonByAppraiser, loanTransferCurrentStage: '4' }, { where: { id: loanTransferId }, transaction: t });
        } else if (loanTransferStatusForAppraiser == "pending") {
            await models.customerLoanTransfer.update({ loanTransferStatusForAppraiser, reasonByAppraiser, modifiedBy, loanTransferCurrentStage: '3' }, { where: { id: loanTransferId }, transaction: t });

        } else if (loanTransferStatusForAppraiser == "rejected") {
            await models.customerLoanTransfer.update({ loanTransferStatusForAppraiser, reasonByAppraiser, modifiedBy, loanTransferCurrentStage: '3' }, { where: { id: loanTransferId }, transaction: t });

        }


    })

    return res.status(200).json({ message: 'Success', masterLoanId, loanId })
}
