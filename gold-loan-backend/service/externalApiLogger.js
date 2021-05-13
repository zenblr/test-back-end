const moment = require('moment');
const models = require('../models');
// let sms = require('../../../utils/sendSMS');
const sequelize = models.sequelize;
const Sequelize = models.Sequelize;
const Op = Sequelize.Op
// var stringify = require('json-stringify');


let createExternalApiLogger = async (apiType, userId, customerId, api, request, response, status) => {

    let createlogs = await models.externalApiLogger.create({
        apiType, userId, customerId, api, request, response, status
    });

    return createlogs
}

module.exports = {
    createExternalApiLogger: createExternalApiLogger
}
