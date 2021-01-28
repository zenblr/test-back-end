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
const { transactionDetail } = require('../../service/wallet');




exports.getAllDepositWithdrawDetailsAdmin = async (req, res) => {
    const { search, offset, pageSize } = paginationWithFromTo(
        req.query.search,
        req.query.from,
        req.query.to
    );
    let { paymentFor, depositStatus, paymentReceivedDate } = req.query;
    let orderType;
    if (paymentFor) {
        orderType = await models.digiGoldOrderType.findOne({ where: { orderType: paymentFor } })
    } else {
        return res.status(400).json({ message: "paymentFor is required" });

    }
    let query = {};
    if (depositStatus) {
        query.depositStatus = depositStatus.split(",");
    }

    let theDepositList;
    console.log("sort", req.query.sort)
    if (req.query.sort == "ListByNew") {
        theDepositList = [["paymentReceivedDate", "DESC"]]
    } else if (req.query.sort == "ListByOld") {
        theDepositList = [["paymentReceivedDate", "ASC"]]
    } else {
        theDepositList = [["updatedAt", "DESC"]]
    }
    console.log("theDepositList", theDepositList)
    if (paymentReceivedDate) {
        let start = moment(moment(paymentReceivedDate).utcOffset("+05:30").startOf('day'));
        let end = moment(moment(paymentReceivedDate).utcOffset("+05:30").endOf('day'));

        let endDate = moment(end).format('YYYY-MM-DD HH:mm:ss');
        let startDate = moment(start).format('YYYY-MM-DD HH:mm:ss');

        query.paymentReceivedDate = await { [Op.between]: [startDate, endDate] }
    }

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
                transactionAmount: sequelize.where(
                    sequelize.cast(sequelize.col("walletTransactionDetails.deposit_date"), "varchar"),
                    {
                        [Op.iLike]: search + "%",
                    }
                ),
                razorpayPaymentId: sequelize.where(
                    sequelize.cast(sequelize.col("walletTransactionDetails.razorpay_payment_id"), "varchar"),
                    {
                        [Op.iLike]: search + "%",
                    }
                ),
                // "$walletTransactionDetails.payment_for$": { [Op.iLike]: search + '%' },
                "$walletTransactionDetails.bank_name$": { [Op.iLike]: search + '%' },
                "$walletTransactionDetails.cheque_number$": { [Op.iLike]: search + '%' },
                "$walletTransactionDetails.branch_name$": { [Op.iLike]: search + '%' },
                "$customer.customer_unique_id$": { [Op.iLike]: search + '%' },
                "$customer.first_name$": { [Op.iLike]: search + '%' },
                "$customer.last_name$": { [Op.iLike]: search + '%' },
                "$walletTransactionDetails.transaction_unique_id$": { [Op.iLike]: search + '%' },
                "$walletTransactionDetails.ifsc_code$": { [Op.iLike]: search + '%' },
                "$walletTransactionDetails.payment_type$": { [Op.iLike]: search + '%' },
                // "$walletTransactionDetails.razorpay_payment_id$": { [Op.iLike]: search + '%' },
                "$customer.mobile_number$": { [Op.iLike]: search + '%' },
                "$walletTransactionDetails.bank_transaction_unique_id$": { [Op.iLike]: search + '%' },
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

    if (orderType) {
        if (orderType.id == 4) {
            searchQuery.productTypeId = { [Op.in]: [4] }
            searchQuery.orderTypeId = { [Op.in]: [4] }
            // searchQuery.customerId = id
        } else if (orderType.id == 5) {
            searchQuery.productTypeId = { [Op.in]: [4] }
            searchQuery.orderTypeId = { [Op.in]: [5] }
            // searchQuery.customerId = id
        }
    }

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
        order: theDepositList,
        include: includeArray,
        where: searchQuery,
        offset: offset,
        limit: pageSize,
        subQuery: false,

        // order: [
        //     ["updatedAt", "DESC"]
        // ],

        // where: searchQuery,

    });

    let count = await models.walletTransactionDetails.findAll({
        where: searchQuery,
        // order: theDepositList,
        // order: [
        //     ["updatedAt", "DESC"]
        // ],
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
    let { depositStatus, date, bankTransactionUniqueId } = req.body
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

    // let date = moment()

    if (transactionData.orderTypeId == 4) {

        await sequelize.transaction(async (t) => {
            if (depositStatus == "completed") {
                if (customer.currentWalletBalance) {
                    customerUpdatedBalance = Number(customer.currentWalletBalance) + Number(transactionData.transactionAmount);

                } else {
                    customerUpdatedBalance = Number(transactionData.transactionAmount);
                }
                let newCustomerUpdatedBalance = customerUpdatedBalance.toFixed(2);


                await models.customer.update({ currentWalletBalance: Number(newCustomerUpdatedBalance) }, { where: { id: customer.id }, transaction: t });


                // let walletData = await models.walletDetails.create({ customerId: transactionData.customerId, amount: transactionData.transactionAmount, paymentDirection: "credit", description: "Amount added to your Augmont Wallet", productTypeId: 4, transactionDate: date, orderTypeId: 4, paymentOrderTypeId: 4, transactionStatus: "completed" }, { transaction: t });

                await models.walletDetails.update({ transactionStatus: "completed" }, { where: { id: transactionData.walletId } });

                var updtedRunningBalance = Number(transactionData.runningBalance) + Number(transactionData.transactionAmount)

                let newUpdtedRunningBalance = updtedRunningBalance.toFixed(2);

                await models.walletTransactionDetails.update({ depositStatus: depositStatus, depositApprovedDate: date, runningBalance: Number(newUpdtedRunningBalance) }, { where: { id: transactionData.id }, transaction: t });

                await sms.sendMessageForDepositRequestAccepted(customer.mobileNumber, transactionData.transactionAmount);

            } else {

                await models.walletTransactionDetails.update({ depositStatus: depositStatus, depositApprovedDate: date }, { where: { id: transactionData.id }, transaction: t });

                await models.walletDetails.update({ transactionStatus: "rejected" }, { where: { id: transactionData.walletId }, transaction: t });

                await sms.sendMessageForDepositRequestRejected(customer.mobileNumber, transactionData.transactionAmount);

            }

        });
        return res.status(200).json({ message: "Success", transactionId: transactionData.id });
    } else if (transactionData.orderTypeId == 5) {
        // if (customer.walletFreeBalance < transactionData.transactionAmount) {
        //     return res.status(400).json({ message: 'You have insufficient free wallet balance.' });
        // }

        await sequelize.transaction(async (t) => {

            if (depositStatus == "completed") {
                if (!bankTransactionUniqueId) {
                    return res.status(400).json({ message: "Transaction UniqueId is required" });
                }
                // customerUpdatedFreeBalance = Number(customer.walletFreeBalance) - Number(transactionData.transactionAmount);
                // currentWalletBalance = Number(customer.currentWalletBalance) - Number(transactionData.transactionAmount);

                // await models.customer.update({ walletFreeBalance: customerUpdatedFreeBalance, currentWalletBalance: currentWalletBalance }, { where: { id: customer.id }, transaction: t });

                // let walletData = await models.walletDetails.create({ customerId: transactionData.customerId, amount: transactionData.transactionAmount, paymentDirection: "debit", description: "withdraw amount", productTypeId: 4, transactionDate: date, orderTypeId: 5, paymentOrderTypeId: 5 }, { transaction: t });

                await models.walletTransactionDetails.update({ depositStatus: depositStatus, depositApprovedDate: date, bankTransactionUniqueId }, { where: { id: transactionData.id }, transaction: t });

                await models.walletDetails.update({ transactionStatus: "completed" }, { where: { id: transactionData.walletId } });

                await sms.sendMessageForWithdrawalPaymentCompleted(customer.mobileNumber, transactionData.transactionAmount);
            } else if (depositStatus == "rejected") {

                //rejected code
                await models.walletDetails.update({ transactionStatus: "rejected" }, { where: { id: transactionData.walletId }, transaction: t });

                customerUpdatedFreeBalance = Number(customer.walletFreeBalance) + Number(transactionData.transactionAmount);

                let newCustomerUpdatedFreeBalance = customerUpdatedFreeBalance.toFixed(2);

                currentWalletBalance = Number(customer.currentWalletBalance) + Number(transactionData.transactionAmount);

                let newCurrentWalletBalance = currentWalletBalance.toFixed(2)


                await models.customer.update({ walletFreeBalance: Number(newCustomerUpdatedFreeBalance), currentWalletBalance: Number(newCurrentWalletBalance) }, { where: { id: customer.id }, transaction: t });

                await models.walletTransactionDetails.update({ depositStatus: depositStatus, depositApprovedDate: date, }, { where: { id: transactionData.id }, transaction: t });

                await sms.sendMessageForWithdrawalRejected(customer.mobileNumber, transactionData.transactionAmount);
            } else {
                await models.walletTransactionDetails.update({ depositStatus: depositStatus, depositApprovedDate: date, }, { where: { id: transactionData.id }, transaction: t });

                await models.walletDetails.update({ transactionStatus: depositStatus }, { where: { id: transactionData.walletId }, transaction: t });

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

    let { paymentFor } = req.query;
    if (paymentFor == "deposit") {
        let query = {}


        let searchQuery = {
            [Op.and]: [query, {

            }],
            orderTypeId: 4
        };

        if (req.query.paymentReceivedDate) {
            let endDateNew = moment(moment(req.query.paymentReceivedDate).utcOffset("+05:30").endOf('day'));
            let startDateNew = moment(moment(req.query.paymentReceivedDate).utcOffset("+05:30").startOf('day'));
            let endDateNewFormat = moment(endDateNew).format('YYYY-MM-DD HH:mm:ss');
            let startDateNewFormat = moment(startDateNew).format('YYYY-MM-DD HH:mm:ss');
            searchQuery.paymentReceivedDate = { [Op.between]: [startDateNewFormat, endDateNewFormat] }
        }

        if (req.query.depositStatus) {
            let depositStatusArray = req.query.depositStatus.split(',');
            searchQuery.depositStatus = { [Op.in]: depositStatusArray }
        }


        let depositDtReport = await models.walletTransactionDetails.findAll({
            where: searchQuery,
            subQuery: false,
            order: [
                ["updatedAt", "DESC"]
            ],

            include: [{
                model: models.walletDetails,
                as: "wallet",
                attributes: ['customerId', 'amount', 'payment_direction', 'description', 'productTypeId', 'transactionDate']
            }, {
                model: models.customer,
                as: "customer",
                attributes: ['firstName', 'lastName', 'customerUniqueId', 'mobileNumber']
            }]
        });
        let finalData = [];

        for (const order of depositDtReport) {

            let depositReportData = {};
            depositReportData["Transaction Id"] = order.transactionUniqueId;
            depositReportData["Deposit Amount"] = order.transactionAmount;
            if (!check.isEmpty(order.razorpayPaymentId)) {
                depositReportData["Bank Transaction ID"] = order.razorpayPaymentId;
            }
            if (!check.isEmpty(order.bankTransactionUniqueId)) {
                depositReportData["Bank Transaction ID"] = order.bankTransactionUniqueId;
            }
            if (!check.isEmpty(order.chequeNumber)) {
                depositReportData["Bank Transaction ID"] = order.chequeNumber;
            }
            depositReportData["Customer Id"] = order.customer.customerUniqueId;
            if (order.depositDate != null) {
                year = order.depositDate.split('-')[0];
                month = order.depositDate.split('-')[1];
                day = order.depositDate.split('-')[2];

                const dateDepositApprovedDate = day + '-' + month + '-' + year;

                // depositReportData["Deposit Date"] = order.depositDate;
                depositReportData["Deposit Date"] = dateDepositApprovedDate;
            } else {
                depositReportData["Deposit Date"] = '';
            }
            depositReportData["Customer Name"] = order.customer.firstName + " " + order.customer.lastName;
            depositReportData["Mobile Number"] = order.customer.mobileNumber;
            depositReportData["Deposit Mode Of Payment"] = order.paymentType;
            depositReportData["Deposit Bank Name"] = order.bankName;
            depositReportData["Deposit Branch Name"] = order.branchName;


            if (order.depositApprovedDate != null) {
                mnth = ("0" + (order.depositApprovedDate.getMonth() + 1)).slice(-2),
                    day = ("0" + order.depositApprovedDate.getDate()).slice(-2);
                const dateDepositApprovedDate = [day, mnth, order.depositApprovedDate.getFullYear()].join("-");

                depositReportData["Approval Date"] = dateDepositApprovedDate;
            } else {
                depositReportData["Approval Date"] = '';
            }
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
    }
    else if (paymentFor == "withdraw") {
        let query = {}


        let searchQuery = {
            [Op.and]: [query, {

            }],
            orderTypeId: 5
        };

        if (req.query.paymentReceivedDate) {
            let endDateNew = moment(moment(req.query.paymentReceivedDate).utcOffset("+05:30").endOf('day'));
            let startDateNew = moment(moment(req.query.paymentReceivedDate).utcOffset("+05:30").startOf('day'));
            let endDateNewFormat = moment(endDateNew).format('YYYY-MM-DD HH:mm:ss');
            let startDateNewFormat = moment(startDateNew).format('YYYY-MM-DD HH:mm:ss');
            searchQuery.paymentReceivedDate = { [Op.between]: [startDateNewFormat, endDateNewFormat] }
        }

        if (req.query.depositStatus) {
            let depositStatusArray = req.query.depositStatus.split(',');
            searchQuery.depositStatus = { [Op.in]: depositStatusArray }
        }

        let withdrawData = await models.walletTransactionDetails.findAll({
            where: searchQuery,
            subQuery: false,
            order: [
                ["updatedAt", "DESC"]
            ],

            include: [{
                model: models.walletDetails,
                as: "wallet",
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
            withdrawReportData["Mobile Number"] = order.customer.mobileNumber;
            withdrawReportData["Withdrawal Transaction Id"] = order.transactionUniqueId;
            // withdrawReportData["Withdrawal Initiated Date"] = order.paymentReceivedDate;

            if (order.paymentReceivedDate != null) {
                mnth = ("0" + (order.paymentReceivedDate.getMonth() + 1)).slice(-2),
                    day = ("0" + order.paymentReceivedDate.getDate()).slice(-2);
                const datePaymentReceivedDate = [day, mnth, order.paymentReceivedDate.getFullYear()].join("-");

                withdrawReportData["Withdrawal Initiated Date"] = datePaymentReceivedDate;
            } else {
                withdrawReportData["Withdrawal Initiated Date"] = '';
            }
            withdrawReportData["Withdrawal Amount"] = order.transactionAmount;
            withdrawReportData["Bank Name"] = order.bankName;
            withdrawReportData["Branch Name"] = order.branchName;
            withdrawReportData["Account Number"] = order.accountNumber;
            withdrawReportData["Account Holder Namer"] = order.accountHolderName;
            withdrawReportData["IFSC Code"] = order.ifscCode;
            if (order.depositApprovedDate != null) {
                mnth = ("0" + (order.depositApprovedDate.getMonth() + 1)).slice(-2),
                    day = ("0" + order.depositApprovedDate.getDate()).slice(-2);
                const dateDepositApprovedDateWithdrw = [day, mnth, order.depositApprovedDate.getFullYear()].join("-");

                withdrawReportData["Withdrawal Payment Date"] = dateDepositApprovedDateWithdrw;
            } else {
                withdrawReportData["Withdrawal Payment Date"] = '';
            }

            // withdrawReportData["Withdrawal Payment Date"] = order.depositApprovedDate;
            withdrawReportData["Bank Transaction ID"] = order.bankTransactionUniqueId;
            withdrawReportData["Withdrawal Status"] = order.depositStatus;

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
    }

}





exports.getTransactionDetails = async (req, res) => {
    try {
        console.log("paymentFor, customerId");
        const { paymentFor, customerId, search, from, to } = req.query;

        let transactionData = await transactionDetail(customerId, paymentFor, search, from, to);

        return res.status(200).json({ transactionDetails: transactionData.transactionDetails, count: transactionData.count.length });

    } catch (err) {
        console.log(err);
    }
}