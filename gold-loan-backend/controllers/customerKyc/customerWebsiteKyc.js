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
const { customerKycAdd, customerKycEdit, getKycInfo } = require('../../service/customerKyc')
const check = require("../../lib/checkLib");

exports.submitApplyKyc = async (req, res, next) => {
    let modifiedByCustomer = req.userData.id;
    let createdByCustomer = req.userData.id;
    let modifiedBy = null
    let createdBy = null
    let isFromCustomerWebsite = true

    let data = await customerKycAdd(req, createdBy, createdByCustomer, modifiedBy, modifiedByCustomer, isFromCustomerWebsite)

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
    let isFromCustomerWebsite = true



    let data = await customerKycEdit(req, createdBy, modifiedBy, createdByCustomer, modifiedByCustomer, isFromCustomerWebsite)

    if (data.success) {
        return res.status(data.status).json({ customerId: data.customerId, customerKycId: data.customerKycId, customerKycCurrentStage: data.customerKycCurrentStage, KycClassification: data.KycClassification, ratingStage: data.ratingStage, moduleId: data.moduleId, userType: data.userType })
    } else {
        return res.status(data.status).json({ message: data.message })
    }
    return res.status(200).json({ message: data })
}

exports.getKycInfo = async (req, res, next) => {

    let { id } = req.userData;

    let data = await getKycInfo(id);

    if (data.success) {
        return res.status(data.status).json({ customerKycReview: data.customerKycReview, moduleId: data.moduleId, userType: data.userType, customerId: data.customerId, customerKycId: data.customerKycId })
    } else {
        return res.status(400).json({ message: `error` })
    }

}