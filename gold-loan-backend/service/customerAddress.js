const models = require('../models');
const sequelize = models.sequelize;
const Sequelize = models.Sequelize;
const Op = Sequelize.Op;
const request = require("request");
const { createReferenceCode } = require("../utils/referenceCode");
const CONSTANT = require("../utils/constant");
const moment = require("moment");
const { paginationWithFromTo } = require("../utils/pagination");
const extend = require('extend')
const check = require("../lib/checkLib");
var uniqid = require('uniqid');
const errorLogger = require('../utils/errorLogger');
const getMerchantData = require('../controllers/auth/getMerchantData')
const fs = require('fs');
const FormData = require('form-data');
let sms = require('../utils/SMS');


let getCustomerCityById = async (cityId, cityUnqieCode) => {
    let whereCondition;
    if (cityId != null) {
        whereCondition = { id: cityId }
    } else if (cityUnqieCode != null) {
        whereCondition = { cityUniqueCode: cityUnqieCode }
    }

    let city = await models.city.findOne({ where: whereCondition });
    return city;
}


let getCustomerStateById = async (stateId, stateUniqueCode) => {
    let whereCondition;
    if (stateId != null) {
        whereCondition = { id: stateId }
    } else if (stateUniqueCode != null) {
        whereCondition = { stateUniqueCode: stateUniqueCode }
    }

    let state = await models.state.findOne({ where: whereCondition });
    return state;
}


module.exports = {
    getCustomerCityById: getCustomerCityById,
    getCustomerStateById: getCustomerStateById
}