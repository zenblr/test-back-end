const qs = require('qs');
const uniqid = require('uniqid');
const crypto = require('crypto');
const moment = require('moment');
const path = require('path');
const models = require('../models');
const check = require('../lib/checkLib');
const { paginationWithFromTo } = require('../utils/pagination');
// let sms = require('../../../utils/sendSMS');
const numToWords = require('../utils/numToWords');
const sequelize = models.sequelize;
const Sequelize = models.Sequelize;
const Op = Sequelize.Op




//To get wallet transaction detail by id
exports.walletTransactionDetailById = async (walletTransactionId) => {
    
    let transactionData = await models.walletTransactionDetails.findOne({
         where: { id: walletTransactionId },
         include: {
             model: models.customer,
             as: 'customer',
             attribute: ['customerUniqueId', 'firstName', 'lastName', 'mobileNumber']
         }
        });
    return transactionData;
}