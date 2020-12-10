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
    try {
        const { search, offset, pageSize } = paginationWithFromTo(
            req.query.search,
            req.query.from,
            req.query.to
        );
        let { paymentFor } = req.query;
        let orderType;
        if(paymentFor){
            orderType = await models.digiGoldOrderType.findOne({where: { orderType: paymentFor}})
        }
        let query = {};
        if (orderType) {
            query.orderTypeId = orderType.id
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
                    // "$walletTransactionDetails.payment_for$": { [Op.iLike]: search + '%' },
                    "$walletTransactionDetails.bank_name$": { [Op.iLike]: search + '%' },
                    "$walletTransactionDetails.cheque_number$": { [Op.iLike]: search + '%' },
                    "$walletTransactionDetails.branch_name$": { [Op.iLike]: search + '%' },
                },
            }],
        };

        let includeArray = [
            {
                model: models.customer,
                as: 'customer',
                attributes: ['id', 'customerUniqueId', 'firstName', 'lastName', 'mobileNumber', 'currentWalletBalance', 'walletFreeBalance']
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
        return res.status(200).json({ depositDetail: depositDetail, count: count });
    } catch (err) {
        console.log(err);

    };
}

exports.updateDepositWithdrawStatus = async (req, res) => {
    try {
    
        let depositWithdrawId = req.params.depositWithdrawId;
        let { depositStatus } = req.body
        let customerUpdatedBalance;

        let transactionData = await models.walletTransactionDetails.findOne({ where: { id: depositWithdrawId } });

        if (!transactionData) {
            return res.status(404).json({ message: 'Data not found' });
        }

        if (transactionData.depositStatus == "Completed" || transactionData.depositStatus == "Rejected") {
            return res.status(400).json({ message: 'You can not change the status for this transaction' });
        }
        if(transactionData.orderTypeId == 4){
            let customer = await models.customer.findOne({ id: transactionData.customerId });

            let date = moment()
    
            await sequelize.transaction(async (t) => {
    
            if (customer.currentWalletBalance) {
                customerUpdatedBalance = Number(customer.currentWalletBalance) + Number(transactionData.transactionAmont);
            } else {
                customerUpdatedBalance = Number(transactionData.transactionAmont);
            }
            await models.customer.update({ currentWalletBalance: customerUpdatedBalance}, {where: { id: customer.id}, transaction: t});

            let walletData = await models.walletDetails.create({ customerId: transactionData.customerId, amount: transactionData.transactionAmont, paymentDirection: "credit", description: "add amount", productTypeId: 4, transactionDate: date }, { transaction: t });

            await models.walletTransactionDetails.update({ depositStatus: depositStatus, depositApprovedDate: date, walletId: walletData.id }, { where: { id: transactionData.id }, transaction: t });

            });
            return res.status(200).json({message: "Success"});
        }

    } catch (err) {
        console.log(err);
    }
}

exports.getWalletDetailByIdAdmin = async (req, res) => {
    let depositWithdrawId = req.params.depositWithdrawId;

    let transactionData = await walletService.walletTransactionDetailById(depositWithdrawId);

        if (!transactionData) {
            return res.status(404).json({ message: 'Data not found' });
        }else{
            return res.status(200).json({transactionData});
        }
}
