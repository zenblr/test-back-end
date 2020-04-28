// LOAD REQUIRED PACKAGES
const models = require('../../models');
const sequelize = models.sequelize;
const Sequelize = models.Sequelize;
const Op = Sequelize.Op;
const paginationFUNC = require('../../utils/pagination'); // IMPORTING PAGINATION FUNCTION

const check = require("../../lib/checkLib"); // IMPORTING CHECKLIB 

//  FUNCTION FOR ADD DISBURSEMENT FOR LOAN ACCOUNT
exports.addLoanDisbursementForAccount = async (req, res, next) => {

    let { partnerId, partnerUniqueId, partnerName, branchId, branchUniqueId, accountNumber, ifscCode, transactionId,
        totalBalance, reduceAmount, remainingAmount, removeDate, removeBy, loanId, loanUniqueId, loanAmount } = req.body;

    let loanDisbursedForAccountAdded = await models.loanDisbursedAccount.addLoanDisbusedForAccount(
        partnerId, partnerUniqueId, partnerName, branchId, branchUniqueId, accountNumber, ifscCode, transactionId, totalBalance,
        reduceAmount, remainingAmount, removeDate, removeBy, loanId, loanUniqueId, loanAmount);
    res.status(201).json({ message: 'you loan disbursed account created successfully' });
}

//  FUNCTION FOR GET DISBURSEMENT FOR LOAN ACCOUNT DETAILS
exports.getLoanDisbursementAccountDetails = async (req, res, next) => {
    let { search, offset, pageSize } =
        paginationFUNC.paginationWithFromTo(req.query.search, req.query.from, req.query.to);
    let searchQuery = {
        [Op.or]: {
            partnerUniqueId: { [Op.iLike]: search + '%' },
            branchUniqueId: { [Op.iLike]: search + '%' },
            accountNumber: { [Op.iLike]: search + '%' },
            ifscCode: { [Op.iLike]: search + '%' },
            totalBalance: sequelize.where(
                sequelize.cast(sequelize.col("total_balance"), "varchar"),
                {
                    [Op.iLike]: search + "%"
                }),
            reduceAmount: sequelize.where(
                sequelize.cast(sequelize.col("reduce_amount"), "varchar"),
                {
                    [Op.iLike]: search + "%"
                }),
            removeDate: sequelize.where(
                sequelize.cast(sequelize.col("remove_date"), "varchar"),
                {
                    [Op.iLike]: search + "%"
                }),
        },
        isActive: true
    };

    let associateModel = [{
        model: models.customerLoan,
        as: 'loan',
        where: {
            isActive: true
        }
    }];
    let loanDisbursedAccountDetails = await models.loanDisbursedAccount.findAll({
        where: searchQuery,
        include: associateModel,
        order: [
            ['id', 'DESC']
        ],
        offset: offset,
        limit: pageSize
    });
    let count = await models.loanDisbursedAccount.findAll({
        where: searchQuery,
        include: associateModel
    });
    if (loanDisbursedAccountDetails.length === 0) {
        res.status(404).json({ message: 'no loan disbursed account details found' });
    } else {
        res.status(200).json({ message: 'loan disbursed account account fetch successfully', loanDisbursedAccountDetails, count: count.length });
    }
}

//  FUNCTION FOR ADD REPAYMENT FOR LOAN ACCOUNT
exports.addLoanRepaymentForAccount = async (req, res, next) => {

    let { accountNumber, ifscCode, loanId, loanUniqueId, loanAmount, paymentMode, date, repayAmount, totalPaid, totalAmount } = req.body;

    let loanDisbursedForAccountAdded = await models.loanRepaymentAccount.addLoanRepaymentForAccount(
        accountNumber, ifscCode, loanId, loanUniqueId, loanAmount, paymentMode, date, repayAmount, totalPaid, totalAmount);
    res.status(201).json({ message: 'you loan repayment account created successfully' });
}

//  FUNCTION FOR GET REPLAYMENT FOR LOAN ACCOUNT DETAILS
exports.getLoanRepaymentAccountDetails = async (req, res, next) => {
    let { search, offset, pageSize } =
        paginationFUNC.paginationWithFromTo(req.query.search, req.query.from, req.query.to);
    let searchQuery = {
        [Op.or]: {
            paymentMode: { [Op.iLike]: search + '%' },
            loanUniqueId: { [Op.iLike]: search + '%' },
            accountNumber: { [Op.iLike]: search + '%' },
            ifscCode: { [Op.iLike]: search + '%' },
            totalAmount: sequelize.where(
                sequelize.cast(sequelize.col("total_amount"), "varchar"),
                {
                    [Op.iLike]: search + "%"
                }),
            repayAmount: sequelize.where(
                sequelize.cast(sequelize.col("repay_amount"), "varchar"),
                {
                    [Op.iLike]: search + "%"
                }),
            date: sequelize.where(
                sequelize.cast(sequelize.col("date"), "varchar"),
                {
                    [Op.iLike]: search + "%"
                }),
        },
        isActive: true
    };
    let associateModel = [{
        model: models.customerLoan,
        as: 'loan',
        where: {
            isActive: true
        }
    }];
    let loanRepaymentAccountDetails = await models.loanRepaymentAccount.findAll({
        where: searchQuery,
        include: associateModel,
        order: [
            ['id', 'DESC']
        ],
        offset: offset,
        limit: pageSize
    });
    let count = await models.loanRepaymentAccount.findAll({
        where: searchQuery,
        include: associateModel
    });
    if (loanRepaymentAccountDetails.length === 0) {
        res.status(404).json({ message: 'no loan repayment account details found' });
    } else {
        res.status(200).json({ message: 'loan repayment account details fetch successfully', loanRepaymentAccountDetails, count: count.length });
    }
}