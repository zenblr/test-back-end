const qs = require('qs');
const uniqid = require('uniqid');
const crypto = require('crypto');
const moment = require('moment');
const path = require('path');
const models = require('../../models');
const check = require('../../lib/checkLib');
const getRazorPayDetails = require('../../utils/razorpay');
const { paginationWithFromTo } = require('../../utils/pagination');
// let sms = require('../../../utils/sendSMS');
let sms = require('../../utils/SMS');
var pdf = require("pdf-creator-node");
var fs = require('fs');
const numToWords = require('../../utils/numToWords');
const errorLogger = require('../../utils/errorLogger');
const sequelize = models.sequelize;
const Sequelize = models.Sequelize;
const Op = Sequelize.Op;
const walletService = require('../../service/wallet');




exports.getAllDepositWithdrawDetailsAdmin = async (req, res) => {
    const { search, offset, pageSize } = paginationWithFromTo(
        req.query.search,
        req.query.from,
        req.query.to
    );
    let { paymentFor } = req.query;
    let orderType;
    if (paymentFor) {
        orderType = await models.digiGoldOrderType.findOne({ where: { orderType: paymentFor } })
    } else {
        return res.status(400).json({ message: "paymentFor is required" });

    }
    let query = {};
    // if (orderType) {
    //     query.orderTypeId = orderType.id
    // }

    let searchQuery = {
        [Op.and]: [query, {
            [Op.or]: {
                depositStatus: sequelize.where(
                    sequelize.cast(sequelize.col("walletTransactionDetails.deposit_status"), "varchar"),
                    {
                        [Op.iLike]: search + "%",
                    }
                ),
                applicationDate: sequelize.where(
                    sequelize.cast(sequelize.col("walletTransactionDetails.deposit_date"), "varchar"),
                    {
                        [Op.iLike]: search + "%",
                    }
                ),
                // "$walletTransactionDetails.payment_for$": { [Op.iLike]: search + '%' },
                "$walletTransactionDetails.bank_name$": { [Op.iLike]: search + '%' },
                "$walletTransactionDetails.cheque_number$": { [Op.iLike]: search + '%' },
                "$walletTransactionDetails.branch_name$": { [Op.iLike]: search + '%' },
            },
        }],
    };
    // let whereCondition = { paymentOrderTypeId: { [Op.in]: [4, 5] }, orderTypeId: { [Op.in]: [4] } }

    // if (paymentFor) {
    //     if (orderType.id == 4) {
    //       whereCondition = { paymentOrderTypeId: { [Op.in]: [4] }, orderTypeId: { [Op.in]: [4] } }
    //     } else if (orderType.id == 5) {
    //       whereCondition = { paymentOrderTypeId: { [Op.in]: [5] }, orderTypeId: { [Op.notIn]: [4] } }
    //     }
    //   }

    let includeArray = [
        {
            model: models.customer,
            as: 'customer',
            attributes: ['id', 'customerUniqueId', 'firstName', 'lastName', 'mobileNumber', 'currentWalletBalance', 'walletFreeBalance']
        },
        {
            model: models.walletDetails,
            as: 'wallet',
            // where: whereCondition
        }
    ]

    let depositDetail = await models.walletTransactionDetails.findAll({

        include: includeArray,
        where: searchQuery,
        offset: offset,
        limit: pageSize,
        subQuery: false,
        order: [
            ["updatedAt", "DESC"]
        ],
    });

    let count = await models.walletTransactionDetails.findAll({
        where: searchQuery,
        order: [
            ["updatedAt", "DESC"]
        ],
        include: includeArray

    });

    if (check.isEmpty(depositDetail)) {
        return res.status(200).json({
            depositDetail: [], count: 0
        })
    }
    return res.status(200).json({ depositDetail: depositDetail, count: count.length });

}

exports.updateDepositWithdrawStatus = async (req, res) => {

    let depositWithdrawId = req.params.depositWithdrawId;
    let { depositStatus } = req.body
    let customerUpdatedBalance;
    let currentWalletBalance;
    let transactionData = await models.walletTransactionDetails.findOne({ where: { id: depositWithdrawId } });
    if (!transactionData) {
        return res.status(404).json({ message: 'Data not found' });
    }

    if (transactionData.depositStatus == "completed" || transactionData.depositStatus == "rejected") {
        return res.status(400).json({ message: 'You can not change the status for this transaction' });
    }
    let customer = await models.customer.findOne({ where: { id: transactionData.customerId, isActive: true } });

    let date = moment()

    if (transactionData.orderTypeId == 4) {

        await sequelize.transaction(async (t) => {
            if (depositStatus == "completed") {
                if (customer.currentWalletBalance) {
                    customerUpdatedBalance = Number(customer.currentWalletBalance) + Number(transactionData.transactionAmount);

                } else {
                    customerUpdatedBalance = Number(transactionData.transactionAmount);
                }

                await models.customer.update({ currentWalletBalance: customerUpdatedBalance }, { where: { id: customer.id }, transaction: t });

                let walletData = await models.walletDetails.create({ customerId: transactionData.customerId, amount: transactionData.transactionAmount, paymentDirection: "credit", description: "add amount", productTypeId: 4, transactionDate: date, orderTypeId: 4, paymentOrderTypeId: 4 }, { transaction: t });

                await models.walletTransactionDetails.update({ depositStatus: depositStatus, depositApprovedDate: date, walletId: walletData.id }, { where: { id: transactionData.id }, transaction: t });
            } else {

                await models.walletTransactionDetails.update({ depositStatus: depositStatus, depositApprovedDate: date }, { where: { id: transactionData.id }, transaction: t });

            }

        });
        return res.status(200).json({ message: "Success", transactionId: transactionData.id });
    } else if (transactionData.orderTypeId == 5) {
        if (customer.walletFreeBalance < transactionData.transactionAmount) {
            return res.status(400).json({ message: 'You have insufficient free wallet balance.' });
        }

        await sequelize.transaction(async (t) => {

            if (depositStatus == "completed") {
                customerUpdatedFreeBalance = Number(customer.walletFreeBalance) - Number(transactionData.transactionAmount);
                currentWalletBalance = Number(customer.currentWalletBalance) - Number(transactionData.transactionAmount);

                await models.customer.update({ walletFreeBalance: customerUpdatedFreeBalance, currentWalletBalance: currentWalletBalance }, { where: { id: customer.id }, transaction: t });

                let walletData = await models.walletDetails.create({ customerId: transactionData.customerId, amount: transactionData.transactionAmount, paymentDirection: "debit", description: "withdraw amount", productTypeId: 4, transactionDate: date, orderTypeId: 5, paymentOrderTypeId: 5 }, { transaction: t });

                await models.walletTransactionDetails.update({ depositStatus: depositStatus, depositApprovedDate: date, walletId: walletData.id }, { where: { id: transactionData.id }, transaction: t });
            } else {

                await models.walletTransactionDetails.update({ depositStatus: depositStatus, depositApprovedDate: date, }, { where: { id: transactionData.id }, transaction: t });
            }
        });
        return res.status(200).json({ message: "Success", transactionId: transactionData.id });
    }

}

exports.getWalletDetailByIdAdmin = async (req, res) => {
    let depositWithdrawId = req.params.depositWithdrawId;

    let transactionData = await models.walletTransactionDetails.findOne({
        where: { id: depositWithdrawId },
        include: {
            model: models.customer,
            as: 'customer',
            attributes: ['customerUniqueId', 'firstName', 'lastName', 'mobileNumber']
        }
    });
    if (!transactionData) {
        return res.status(404).json({ message: 'Data not found' });
    } else {
        return res.status(200).json({ transactionData });
    }
}



exports.getDepositReuest = async (req, res) => {

    const { startDate, endDate } = req.query;
    let endDateNew = moment(moment(endDate).utcOffset("+05:30").endOf('day'));
    let startDateNew = moment(moment(startDate).utcOffset("+05:30").startOf('day'));
    let query = {}

    let depositData = await models.walletTransactionDetails.findAll({
        // where: { orderTypeId: 4, [Op.and]: [query] },
        where: {
            orderTypeId: 4, depositDate: {
                [Op.between]: [startDateNew, endDateNew],
            }
        },

        include: [{
            model: models.walletDetails,
            as: "walletDetails",
            attributes: ['customerId', 'amount', 'payment_direction', 'description', 'productTypeId', 'transactionDate']
        },
        {
            model: models.customer,
            as: "customer",
            attributes: ['firstName', 'lastName', 'customerUniqueId', 'mobileNumber']
        }]
    });

    let finalData = [];

    for (const order of depositData) {



        let depositReportData = {};
        depositReportData["Customer Id"] = order.customer.customerUniqueId;
        depositReportData["Customer Name"] = order.customer.firstName + " " + order.customer.lastName;
        depositReportData["Mobile No"] = order.customer.mobileNumber;
        depositReportData["Transaction Id"] = order.transactionUniqueId;
        depositReportData["Payment Type"] = order.paymentType;
        depositReportData["Bank Name"] = order.bankName;
        depositReportData["Branch Name"] = order.branchName;
        depositReportData["Withdraw Amount"] = order.transactionAmount;
        depositReportData["Payment Received Date"] = order.paymentReceivedDate;
        depositReportData["Deposit Status"] = order.depositStatus;


        finalData.push(depositReportData);
    }
    if (!check.isEmpty(finalData)) {
        const date = Date.now();
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader("Content-Disposition", "attachment; filename=" + `orderReport${date}.xlsx`);
        await res.xls(`depositReport${date}.xlsx`, finalData);
        res.end();
    } else {
        return res.status(200).json({ message: "Data Not Found" });
    }


    // let depositDetail = await models.walletTransactionDetails.findAll({
    //     where: { orderTypeId:4 ,depositStatus:'completed'},
    //     include: [{
    //         model: models.walletDetails,
    //         as: "walletDetails",
    //         attributes: ['customerId', 'amount', 'payment_direction','description','productTypeId','transactionDate']
    //     }]
    // })

    // if (check.isEmpty(depositDetail) ){
    //     return res.status(404).json({ message: 'Data not found' });
    // } else {
    //     return res.status(200).json({ depositDetail });
    // }


}

exports.getwithdrawDetail = async (req, res) => {

    const { startDate, endDate } = req.query;

    let query = {}

    let endDateNew = moment(moment(endDate).utcOffset("+05:30").endOf('day'));
    let startDateNew = moment(moment(startDate).utcOffset("+05:30").startOf('day'));
    console.log("enddate1", endDateNew)
    console.log("startdate", startDateNew)
    let withdrawData = await models.walletTransactionDetails.findAll({
        where: {
            orderTypeId: 5, depositDate: {
                [Op.between]: [startDateNew, endDateNew],
            }
        },

        include: [{
            model: models.walletDetails,
            as: "walletDetails",
            attributes: ['customerId', 'amount', 'payment_direction', 'description', 'productTypeId', 'transactionDate']
        }, {
            model: models.customer,
            as: "customer",
            attributes: ['firstName', 'lastName', 'customerUniqueId', 'mobileNumber']
        }]
    });

    let finalData = [];

    for (const order of withdrawData) {



        let withdrawReportData = {};
        withdrawReportData["Customer Id"] = order.customer.customerUniqueId;
        withdrawReportData["Customer Name"] = order.customer.firstName + " " + order.customer.lastName;
        withdrawReportData["Mobile No"] = order.customer.mobileNumber;
        withdrawReportData["Transaction Id"] = order.transactionUniqueId;
        withdrawReportData["Payment Type"] = order.paymentType;
        withdrawReportData["Bank Name"] = order.bankName;
        withdrawReportData["Branch Name"] = order.branchName;
        withdrawReportData["Withdraw Amount"] = order.transactionAmount;
        withdrawReportData["Payment Received Date"] = order.paymentReceivedDate;
        withdrawReportData["Deposit Status"] = order.depositStatus;

        finalData.push(withdrawReportData);
    }
    if (!check.isEmpty(finalData)) {
        const date = Date.now();
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader("Content-Disposition", "attachment; filename=" + `orderReport${date}.xlsx`);
        await res.xls(`withdrawReport${date}.xlsx`, finalData);
        res.end();
    } else {
        return res.status(200).json({ message: "Data Not Found" });
    }

    // }
    //    return

    // let withdrawDetailData = await models.walletTransactionDetails.findAll({
    //     where: { orderTypeId:5 ,depositStatus:'completed'},
    //     include: [{
    //         model: models.walletDetails,
    //         as: "walletDetails",
    //         attributes: ['customerId', 'amount', 'payment_direction','description','productTypeId','transactionDate']
    //     }]
    // })

    // if (check.isEmpty(withdrawDetailData) ){
    //     return res.status(404).json({ message: 'Data not found' });
    // } else {
    //     return res.status(200).json({ withdrawDetailData });
    // }


}