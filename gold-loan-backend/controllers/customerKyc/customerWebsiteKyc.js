const models = require('../../models');
const sequelize = models.sequelize;
const Sequelize = models.Sequelize;
const Op = Sequelize.Op;
const request = require("request");
const { createReferenceCode } = require("../../utils/referenceCode");
const CONSTANT = require("../../utils/constant");
const moment = require("moment");
const { paginationWithFromTo } = require("../../utils/pagination");
const extend = require('extend')
const { customerKycAdd, customerKycEdit } = require('../../service/customerKyc')
const check = require("../../lib/checkLib");

exports.submitApplyKyc = async (req, res, next) => {
    let modifiedByCustomer = req.userData.id;
    let createdByCustomer = req.userData.id;
    let modifiedBy = null
    let createdBy = null

    let data = await customerKycAdd(req, createdBy, createdByCustomer, modifiedBy, modifiedByCustomer)

    if (data.success) {
        return res.status(data.status).json({ customerId: data.customerId, customerKycId: data.customerKycId, })
    } else {
        return res.status(data.status).json({ message: data.message })
    }
    // return res.status(200).json({ message: data })
}

exports.submitEditKycInfo = async (req, res, next) => {

    let modifiedByCustomer = req.userData.id;
    let createdByCustomer = req.userData.id;
    let modifiedBy = null
    let createdBy = null



    let data = await customerKycEdit(req, createdBy, modifiedBy, createdByCustomer, modifiedByCustomer)

    if (data.success) {
        return res.status(data.status).json({ customerId: data.customerId, customerKycId: data.customerKycId, customerKycCurrentStage: data.customerKycCurrentStage, KycClassification: data.KycClassification, ratingStage: data.ratingStage, moduleId: data.moduleId, userType: data.userType })
    } else {
        return res.status(data.status).json({ message: data.message })
    }
    return res.status(200).json({ message: data })
}