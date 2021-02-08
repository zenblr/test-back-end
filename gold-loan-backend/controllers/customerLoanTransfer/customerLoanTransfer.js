// LOAD REQUIRED PACKAGES
const models = require('../../models');
const sequelize = models.sequelize;
const Sequelize = models.Sequelize;
const Op = Sequelize.Op;
const { VIEW_ALL_CUSTOMER } = require('../../utils/permissionCheck')
const paginationFUNC = require('../../utils/pagination'); // IMPORTING PAGINATION FUNCTION
const loanTransferHistory = require('../../utils/customerLoanTransferHistory')
const check = require("../../lib/checkLib"); // IMPORTING CHECKLIB 
var randomize = require('randomatic');
const { sendDisbursalMessage, sendTransferLoanRequestMessage } = require('../../utils/SMS')
const { customerNameNumberLoanId } = require('../../utils/loanFunction');
const moment = require('moment');

exports.customerDetails = async (req, res, next) => {

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


    // if (check.isEmpty(getAppraiserId)) {
    //     return res.status(400).json({ message: 'This customer Did not assign in to anyone' })
    // }
    // if (reqId != getAppraiserId.appraiserId) {
    //     return res.status(400).json({ message: `This customer is not assign to you` })
    // }

    let customerData = await models.customer.findOne({
        where: { customerUniqueId: getCustomer.customerUniqueId, isActive: true, kycStatus: 'approved' },
        attributes: ['id', 'customerUniqueId', 'panCardNumber', 'mobileNumber', 'kycStatus', 'panType', 'panImage', 'form60Image'],

    })

    let customerLoanStage = await models.customerLoanMaster.findOne({
        where: { customerId: customerData.id, appraiserRequestId: appraiserRequestId, isLoanSubmitted: false },
        include: [{
            model: models.customerLoanTransfer,
            as: "loanTransfer",
            where: { loanTransferCurrentStage: { [Op.notIn]: ["6"] } },
        }]
    })

    if (!check.isEmpty(customerLoanStage)) {
        let customerCurrentStage = customerLoanStage.loanTransfer.loanTransferCurrentStage;
        let loanId = await models.customerLoan.findOne({ where: { masterLoanId: customerLoanStage.id, loanType: 'secured' } })
        if (customerCurrentStage == '2') {
            return res.status(200).json({ message: 'Success', loanId: loanId.id, masterLoanId: customerLoanStage.id, loanCurrentStage: customerCurrentStage })
        } else if (customerCurrentStage == '3') {
            return res.status(200).json({ message: 'Success', loanId: loanId.id, masterLoanId: customerLoanStage.id, loanCurrentStage: customerCurrentStage })
        } else if (customerCurrentStage == '4') {
            return res.status(200).json({ message: 'Success', loanId: loanId.id, masterLoanId: customerLoanStage.id, loanCurrentStage: customerCurrentStage, loanUniqueId: customerLoanStage.loanTransfer.transferredLoanId, disbursedLoanAmount: customerLoanStage.loanTransfer.disbursedLoanAmount })
        } else if (customerCurrentStage == '5') {
            return res.status(200).json({ message: 'Success', loanId: loanId.id, masterLoanId: customerLoanStage.id, loanCurrentStage: customerCurrentStage, loanUniqueId: customerLoanStage.loanTransfer.transferredLoanId, disbursedLoanAmount: customerLoanStage.loanTransfer.disbursedLoanAmount })
        }
    }

    if (!customerData) {
        res.status(404).json({ message: 'no customer details found' });
    } else {
        res.status(200).json({ message: 'customer details fetch successfully', customerData, loanCurrentStage: '1' });
    }
}

exports.loanTransferBasicDeatils = async (req, res, next) => {
    let { customerId, customerUniqueId, kycStatus, startDate, masterLoanId, requestId } = req.body
    let createdBy = req.userData.id;
    let modifiedBy = req.userData.id;
    let stageId = await models.loanStage.findOne({ where: { name: 'loan transfer' } })

    if (masterLoanId != null) {
        let customerLoanMaster = await models.customerLoanMaster.findOne({ where: { id: masterLoanId, appraiserRequestId: requestId } })
        let loanId = await models.customerLoan.findOne({ where: { masterLoanId: customerLoanMaster.id, loanType: 'secured' } })
        if (!check.isEmpty(customerLoanMaster)) {
            return res.status(200).json({ message: 'Success', loanId: loanId.id, masterLoanId: customerLoanMaster.id, loanCurrentStage: '2' })
        }
    }
    let loanData = await sequelize.transaction(async t => {
        await models.appraiserRequest.update({ status: 'complete' }, { where: { id: requestId }, transaction: t })



        let createLoanTransfer = await models.customerLoanTransfer.create({ loanTransferCurrentStage: '2', createdBy, modifiedBy }, { transaction: t });

        await models.customerLoanTransferHistory.create({ loanTransferId: createLoanTransfer.id, action: loanTransferHistory.BASIC_DETAILS_SUBMIT, createdBy, modifiedBy }, { transaction: t })

        let masterLoan = await models.customerLoanMaster.create({ customerId: customerId, loanStageId: stageId.id, customerLoanCurrentStage: '1', createdBy, modifiedBy, internalBranchId: req.userData.internalBranchId, loanTransferId: createLoanTransfer.id, appraiserRequestId: requestId, isLoanTransfer: true }, { transaction: t })

        let loan = await models.customerLoan.create({ customerId, masterLoanId: masterLoan.id, loanType: 'secured', createdBy, modifiedBy }, { transaction: t })

        await models.customerLoanPersonalDetail.create({ loanId: loan.id, masterLoanId: masterLoan.id, customerUniqueId, startDate, kycStatus, createdBy, modifiedBy }, { transaction: t })

        let data = await models.customer.findOne({ where: { id: customerId }, transaction: t })

        await sendTransferLoanRequestMessage(data.mobileNumber, data.firstName)
        return loan
    })
    return res.status(200).json({ message: 'Success', loanId: loanData.id, masterLoanId: loanData.masterLoanId, loanCurrentStage: '2' })

}

exports.loanTransferDocuments = async (req, res, next) => {

    let { pawnTicket, signedCheque, declaration, outstandingLoanAmount, loanId, masterLoanId } = req.body
    let createdBy = req.userData.id;
    let modifiedBy = req.userData.id;
    let masterLoan = await models.customerLoanMaster.findOne({
        where: { id: masterLoanId },
        include: [{
            model: models.customerLoanTransfer,
            as: "loanTransfer",
        }]
    });
    if (masterLoan.loanTransfer.loanTransferStatusForBM == "pending" || masterLoan.loanTransfer.loanTransferStatusForBM == "incomplete" || masterLoan.loanTransfer.loanTransferStatusForAppraiser == "pending" || masterLoan.loanTransfer.loanTransferStatusForAppraiser == "incomplete") {
        await sequelize.transaction(async t => {
            if (!masterLoan.loanTransfer.pawnTicket || !masterLoan.loanTransfer.signedCheque || !masterLoan.loanTransfer.declaration || !masterLoan.loanTransfer.outstandingLoanAmount) {
                await models.customerLoanTransfer.update({ pawnTicket, signedCheque, declaration, outstandingLoanAmount, modifiedBy, loanTransferCurrentStage: '3', disbursedLoanAmount: outstandingLoanAmount }, { where: { id: masterLoan.loanTransfer.id }, transaction: t })
                await models.customerLoanTransferHistory.create({ loanTransferId: masterLoan.loanTransfer.id, action: loanTransferHistory.LOAN_DOCUMENTS, createdBy, modifiedBy }, { transaction: t })
            } else {
                await models.customerLoanTransfer.update({ pawnTicket, signedCheque, declaration, outstandingLoanAmount }, { where: { id: masterLoan.loanTransfer.id }, transaction: t })
                await models.customerLoanTransferHistory.create({ loanTransferId: masterLoan.loanTransfer.id, action: loanTransferHistory.LOAN_DOCUMENTS_UPDATED, createdBy, modifiedBy }, { transaction: t })
            }
        })
        return res.status(200).json({ message: 'Success', masterLoanId, loanId, loanCurrentStage: '3' })
    } else {
        return res.status(400).json({ message: 'You cannot change documents now' })
    }

}

exports.loanTransferAppraiserRating = async (req, res, next) => {

    let { loanTransferStatusForAppraiser, reasonByAppraiser, loanId, masterLoanId } = req.body
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
        if (masterLoan.loanTransfer.loanTransferStatusForBM == "incomplete" || masterLoan.loanTransfer.loanTransferStatusForBM == "pending" || masterLoan.loanTransfer.loanTransferStatusForAppraiser == "pending" || masterLoan.loanTransfer.loanTransferStatusForAppraiser == "incomplete") {
            await models.appraiserRequest.update({ isProcessComplete: true }, { where: { id: masterLoan.appraiserRequestId }, transaction: t })


            if (loanTransferStatusForAppraiser == "approved") {
                await models.customerLoanTransfer.update({ loanTransferStatusForAppraiser, modifiedBy, reasonByAppraiser, loanTransferCurrentStage: '4' }, { where: { id: masterLoan.loanTransfer.id }, transaction: t });
                await models.customerLoanTransferHistory.create({ loanTransferId: masterLoan.loanTransfer.id, action: loanTransferHistory.APPRAISER_RATING_APPROVED, createdBy, modifiedBy }, { transaction: t })
                return res.status(200).json({ message: 'Success', masterLoanId, loanId, loanCurrentStage: '4' })
            } else if (loanTransferStatusForAppraiser == "pending") {
                await models.customerLoanTransfer.update({ loanTransferStatusForAppraiser, reasonByAppraiser, modifiedBy, loanTransferCurrentStage: '3' }, { where: { id: masterLoan.loanTransfer.id }, transaction: t });
                await models.customerLoanTransferHistory.create({ loanTransferId: masterLoan.loanTransfer.id, action: loanTransferHistory.APPRAISER_RATING_PENDING, createdBy, modifiedBy }, { transaction: t })
                return res.status(200).json({ message: 'Success', masterLoanId, loanId, loanCurrentStage: '3' })
            } else if (loanTransferStatusForAppraiser == "rejected") {
                await models.customerLoanTransfer.update({ loanTransferStatusForAppraiser, reasonByAppraiser, modifiedBy, loanTransferCurrentStage: '3' }, { where: { id: masterLoan.loanTransfer.id }, transaction: t });
                await models.customerLoanTransferHistory.create({ loanTransferId: masterLoan.loanTransfer.id, action: loanTransferHistory.APPRAISER_RATING_REJECTED, createdBy, modifiedBy }, { transaction: t })
                return res.status(200).json({ message: 'Success', masterLoanId, loanId, loanCurrentStage: '3' })
            }
        } else {
            return res.status(400).json({ message: 'You cannot change status for this customer' })
        }
    })
}

exports.loanTransferBmRating = async (req, res, next) => {

    let { loanTransferStatusForBM, reasonByBM, masterLoanId } = req.body
    let createdBy = req.userData.id;
    let modifiedBy = req.userData.id;

    let masterLoan = await models.customerLoanMaster.findOne({
        where: { id: masterLoanId },
        include: [{
            model: models.customerLoanTransfer,
            as: "loanTransfer",
        }, {
            model: models.customerLoan,
            as: 'customerLoan',
        }]
    });
    let loanId = masterLoan.customerLoan[0].id;
    await sequelize.transaction(async t => {
        if (masterLoan.loanTransfer.loanTransferStatusForBM == "incomplete" || masterLoan.loanTransfer.loanTransferStatusForBM == "pending") {
            if (loanTransferStatusForBM == "approved") {
                await models.customerLoanTransfer.update({ loanTransferStatusForBM, modifiedBy, reasonByBM, loanTransferCurrentStage: '5' }, { where: { id: masterLoan.loanTransfer.id }, transaction: t });
                await models.customerLoanTransferHistory.create({ loanTransferId: masterLoan.loanTransfer.id, action: loanTransferHistory.BM_RATING_APPROVED, createdBy, modifiedBy }, { transaction: t })
                return res.status(200).json({ message: 'Success', masterLoanId, loanId, disbursedLoanAmount: masterLoan.loanTransfer.outstandingLoanAmount, loanCurrentStage: '5', outstandingLoanAmount: masterLoan.loanTransfer.outstandingLoanAmount })
            } else if (loanTransferStatusForBM == "rejected") {
                await models.customerLoanTransfer.update({ loanTransferStatusForBM, modifiedBy, reasonByBM, loanTransferCurrentStage: '4' }, { where: { id: masterLoan.loanTransfer.id }, transaction: t });
                await models.customerLoanTransferHistory.create({ loanTransferId: masterLoan.loanTransfer.id, action: loanTransferHistory.BM_RATING_REJECTED, createdBy, modifiedBy }, { transaction: t })
                return res.status(200).json({ message: 'Success', masterLoanId, loanId, loanCurrentStage: '4' })
            } else {
                await models.customerLoanTransfer.update({ loanTransferStatusForAppraiser: "pending", loanTransferStatusForBM, modifiedBy, reasonByBM, loanTransferCurrentStage: '3' }, { where: { id: masterLoan.loanTransfer.id }, transaction: t });
                await models.customerLoanTransferHistory.create({ loanTransferId: masterLoan.loanTransfer.id, action: loanTransferHistory.BM_RATING_PENDING, createdBy, modifiedBy }, { transaction: t })
                return res.status(200).json({ message: 'Success', masterLoanId, loanId, loanCurrentStage: '3' })
            }
        } else {
            return res.status(400).json({ message: 'You cannot change status for this customer' })
        }
    })
}

exports.loanTransferDisbursal = async (req, res, next) => {
    let { transactionId, masterLoanId, processingCharge, disbursedLoanAmount, bankTransferType } = req.body
    let createdBy = req.userData.id;
    let modifiedBy = req.userData.id;
    let masterLoan = await models.customerLoanMaster.findOne({
        where: { id: masterLoanId },
        include: [{

            model: models.customerLoanTransfer,
            as: "loanTransfer",
        },
        {
            model: models.customerLoan,
            as: "customerLoan"
        }]
    });
    let loanId = masterLoan.customerLoan[0].id;
    await sequelize.transaction(async t => {
        if (masterLoan.loanTransfer.loanTransferStatusForBM == "approved" && masterLoan.loanTransfer.loanTransferCurrentStage == 6) {
            return res.status(400).json({ message: 'Amount is already disbursed' })
        } else {
            if (masterLoan.loanTransfer.loanTransferStatusForBM == "approved") {
                let customerDetails = await models.customer.findOne({ where: { id: masterLoan.customerId } });
                let sliceCustId = customerDetails.customerUniqueId.slice(0, 2)
                let loanUniqueId = null;
                let checkSecuredUnique = false
                do {
                    let getSecu = randomize('A0', 4);
                    loanUniqueId = `LR${sliceCustId}${getSecu}`;
                    let checkUnique = await models.customerLoan.findOne({ where: { loanUniqueId: loanUniqueId }, transaction: t })
                    if (!checkUnique) {
                        checkSecuredUnique = true
                    }
                }
                while (!checkSecuredUnique);
                await models.customerLoan.update({ loanUniqueId: loanUniqueId }, { where: { masterLoanId: masterLoanId }, transaction: t })
                await models.customerLoanTransfer.update({ transactionId, modifiedBy, processingCharge, disbursedLoanAmount, loanTransferCurrentStage: '6', isLoanDisbursed: true, transferredLoanId: loanUniqueId, bankTransferType }, { where: { id: masterLoan.loanTransfer.id }, transaction: t });
                await models.customerLoanTransferHistory.create({ loanTransferId: masterLoan.loanTransfer.id, action: loanTransferHistory.LOAN_DISBURSEMENT, createdBy, modifiedBy }, { transaction: t })

                //LOAN_DISBURSEMENT and processing chanrges
                let processingDebit = await models.customerTransactionDetail.create({ masterLoanId, loanId: loanId, debit: processingCharge, description: `Processing charges debit`, paymentDate: moment() }, { transaction: t })
                await models.customerTransactionDetail.update({ referenceId: `${loanUniqueId}-${processingDebit.id}` }, { where: { id: processingDebit.id }, transaction: t });
                //////processingCharge
                await models.customerLoanMaster.update({ processingCharge }, { where: { id: masterLoanId }, transaction: t });

                let transferLoanDisburse = await models.customerTransactionDetail.create({ masterLoanId, loanId: loanId, debit: disbursedLoanAmount, description: `Loan transfer disbursed amount`, paymentDate: moment() }, { transaction: t })
                await models.customerTransactionDetail.update({ referenceId: `${loanUniqueId}-${transferLoanDisburse.id}` }, { where: { id: transferLoanDisburse.id }, transaction: t })
                await models.customerLoanDisbursement.create({
                    masterLoanId, loanId: loanId, disbursementAmount: disbursedLoanAmount, transactionId: transactionId, date: moment(), paymentMode: 'Loan transfer', createdBy: createdBy, modifiedBy: modifiedBy, bankTransferType
                }, { transaction: t });

                let sendLoanMessage = await customerNameNumberLoanId(masterLoanId)

                await sendDisbursalMessage(sendLoanMessage.mobileNumber, sendLoanMessage.customerName, sendLoanMessage.sendLoanUniqueId)

                return res.status(200).json({ message: 'Success', masterLoanId, loanId })
            } else {
                if (masterLoan.loanTransfer.loanTransferStatusForBM == "incomplete") {
                    return res.status(400).json({ message: 'BM approval  is pending' })
                } else {
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
        attributes: ['id', 'loanUniqueId', 'masterLoanId'],
        include: [
            {
                model: models.customerLoanMaster,
                as: 'masterLoan',
                attributes: ['id', 'loanTransferId', 'appraiserRequestId'],
                include: [{
                    model: models.customerLoanTransfer,
                    as: "loanTransfer",
                    attributes: ['id', 'transferredLoanId', 'reasonByAppraiser', 'loanTransferStatusForAppraiser', 'disbursedLoanAmount', 'transactionId', 'loanTransferStatusForBM', 'reasonByBM', 'pawnTicket', 'signedCheque', 'declaration', 'outstandingLoanAmount', 'loanTransferCurrentStage', 'isLoanApplied', 'processingCharge', 'bankTransferType']
                }]
            },
            {
                model: models.customer,
                as: 'customer',
                attributes: ['id', 'customerUniqueId', 'firstName', 'lastName', 'panType', 'panImage', 'form60Image', 'mobileNumber', 'kycStatus'],
            },
            {
                model: models.customerLoanPersonalDetail,
                as: 'loanPersonalDetail',
            }
        ]
    });
    if (!customerLoan) {
        return res.status(404).json({ message: 'Data not found' })
    } else {
        return res.status(200).json({ message: 'Success', data: customerLoan })
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
                finalLoanAmount: sequelize.where(
                    sequelize.cast(sequelize.col("customerLoanMaster.final_loan_amount"), "varchar"),
                    {
                        [Op.iLike]: search + "%",
                    }
                )
            },
        }],
        isActive: true,
        isLoanTransfer: true
    };
    // let customerLoanWhere = {loan_unique_id:{ [Op.iLike]: search + '%'}};
    let internalBranchId = req.userData.internalBranchId
    if (!check.isPermissionGive(req.permissionArray, VIEW_ALL_CUSTOMER)) {
        searchQuery.internalBranchId = internalBranchId
    }
    let associateModel = [
        {
            model: models.customerLoan,
            as: 'customerLoan',
            separate: true,
            attributes: ['id', 'loanUniqueId', 'customerId', 'masterLoanId']
        },
        {
            model: models.customer,
            as: 'customer',
            attributes: { exclude: ['createdAt', 'updatedAt', 'createdBy', 'modifiedBy', 'isActive'] }
        },
        {
            model: models.customerLoanTransfer,
            as: "loanTransfer",
            attributes: { exclude: ['updatedAt', 'createdBy', 'modifiedBy', 'isActive'] }
        }
    ]

    let loanDetails = await models.customerLoanMaster.findAll({
        where: searchQuery,
        subQuery: false,
        include: associateModel,
        attributes: ['loanTransferId', 'isLoanSubmitted', 'loanStatusForAppraiser', 'appraiserRequestId'],
        order: [
            // [models.customerLoan, 'id', 'asc'],
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
        return res.status(200).json({ data: loanDetails, count: count.length });
    }
}

exports.customerDetailsLoanTransfer = async (req, res, next) => {


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

    let customerData = await models.customer.findOne({
        where: { customerUniqueId: getCustomer.customerUniqueId, isActive: true, kycStatus: 'approved' },
        attributes: ['id', 'customerUniqueId', 'panCardNumber', 'mobileNumber', 'kycStatus', 'panType', 'panImage', 'form60Image'],

    })

    let customerLoanStage = await models.customerLoanMaster.findOne({
        where: { customerId: customerData.id, appraiserRequestId: appraiserRequestId, isLoanTransfer: true, isLoanSubmitted: false },
        include: [{
            model: models.customerLoanTransfer,
            as: "loanTransfer",
            where: { loanTransferCurrentStage: '6' },
        }, {
            model: models.customer,
            as: 'customer',
            attributes: ['firstName', 'lastName']
        }]
    });
    const firstName = customerLoanStage.customer.firstName
    const lastName = customerLoanStage.customer.lastName
    let loanTransfer = true;
    let loanTransfetData = customerLoanStage.loanTransfer;
    if (!check.isEmpty(customerLoanStage)) {
        let customerCurrentStage = customerLoanStage.customerLoanCurrentStage
        let loanId = await models.customerLoan.findOne({ where: { masterLoanId: customerLoanStage.id, loanType: 'secured' } })
        if (customerCurrentStage == '1') {
            return res.status(200).json({ message: 'Success', loanId: loanId.id, masterLoanId: customerLoanStage.id, loanCurrentStage: customerCurrentStage, customerData, loanTransfer, loanTransfetData })
        } else if (customerCurrentStage == '2') {
            return res.status(200).json({ message: 'Success', loanId: loanId.id, masterLoanId: customerLoanStage.id, loanCurrentStage: customerCurrentStage, loanTransfer, loanTransfetData })
        } else if (customerCurrentStage == '3') {
            return res.status(200).json({ message: 'Success', loanId: loanId.id, masterLoanId: customerLoanStage.id, loanCurrentStage: customerCurrentStage, loanTransfer, loanTransfetData })
        } else if (customerCurrentStage == '4') {
            return res.status(200).json({ message: 'Success', loanId: loanId.id, masterLoanId: customerLoanStage.id, loanCurrentStage: customerCurrentStage, totalEligibleAmt: customerLoanStage.totalEligibleAmt, loanTransfer, loanTransfetData })
        } else if (customerCurrentStage == '5') {
            return res.status(200).json({ message: 'Success', loanId: loanId.id, masterLoanId: customerLoanStage.id, loanCurrentStage: customerCurrentStage, finalLoanAmount: customerLoanStage.finalLoanAmount, loanTransfer, loanTransfetData, firstName, lastName })
        } else if (customerCurrentStage == '6') {
            return res.status(200).json({ message: 'Success', masterLoanId: customerLoanStage.id, loanId: loanId.id, loanCurrentStage: customerCurrentStage, loanTransfer, loanTransfetData })
        }
    } else {
        res.status(400).json({ message: 'Loan transfer process is pending' });
    }
}



