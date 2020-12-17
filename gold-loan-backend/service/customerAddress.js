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


let getCustomerCityById = async (cityId) => {

    let city = await models.city.findOne({ where: { id: cityId } });
    return city;
}


let getCustomerStateById = async (stateId) => {

    let stste = await models.state.findOne({ where: { id: stateId } });
    return stste;
}


module.exports = {
    getCustomerCityById: getCustomerCityById,
    getCustomerStateById: getCustomerStateById
}