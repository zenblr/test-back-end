const models = require('../../models');
const sequelize = models.sequelize;
const Sequelize = models.Sequelize;
const Op = Sequelize.Op;
const request = require("request");
const { createReferenceCode } = require("../../utils/referenceCode");
const CONSTANT = require("../../utils/constant");
const moment = require("moment");

const check = require("../../lib/checkLib");

exports.addAppraisalRating = async (req, res, next) => {

    let { customerId, customerKycId, behaviourRatingAppraisal, idProofRatingAppraisal, addressProofRatingAppraisal, kycStatusFromAppraisal } = req.body;

    let customer = await models.customer.findOne({ where: { id: customerId, isKycSubmitted: true } });
    if (check.isEmpty(customer)) {
        return res.status(200).json({ message: `This customer Kyc information is not submitted` })
    }

    let appraisalId = req.userData.id
    let checkRatingExist = await models.customerKycClassification.findOne({ where: { customerId } })
    if (!check.isEmpty(checkRatingExist)) {
        return res.status(200).json({ message: `This customer rating is already exist` })
    }
    if (kycStatusFromAppraisal !== "confirm") {
        await sequelize.transaction(async (t) => {

            await models.customerKycClassification.create({ customerId, customerKycId, behaviourRatingAppraisal, idProofRatingAppraisal, addressProofRatingAppraisal, kycStatusFromAppraisal, appraisalId })
        });
    } else {
        await sequelize.transaction(async (t) => {
            await models.customer.update(
                { isVerifiedByFirstStage: true, firstStageVerifiedBy: appraisalId, kycStatus: "complete" },
                { where: { id: customerId } })

            await models.customerKycClassification.create({ customerId, customerKycId, behaviourRatingAppraisal, idProofRatingAppraisal, addressProofRatingAppraisal, kycStatusFromAppraisal, appraisalId })
        });
    }
    return res.status(200).json({ message: 'success' })
}


exports.updateAppraisalRating = async (req, res, next) => {
    let { id } = req.params;
    let { behaviourRatingAppraisal, idProofRatingAppraisal, addressProofRatingAppraisal, kycStatusFromAppraisal } = req.body;
    let appraisalId = req.userData.id

    let customer = await models.customer.findOne({ where: { id: id, isVerifiedByBranchManager: true, kycStatus: "confirm" } });
    if (!check.isEmpty(customer)) {
        return res.status(200).json({ message: `This customer status is confirm by Branch manager.` })
    }

    if (kycStatusFromAppraisal !== "confirm") {
        await sequelize.transaction(async (t) => {

            await models.customer.update(
                { isVerifiedByFirstStage: false, firstStageVerifiedBy: appraisalId, kycStatus: "pending" },
                { where: { id: id } })

            await models.customerKycClassification.update({ behaviourRatingAppraisal, idProofRatingAppraisal, addressProofRatingAppraisal, kycStatusFromAppraisal, appraisalId }, { where: { customerId: id } })
        });
    } else {
        await sequelize.transaction(async (t) => {
            await models.customer.update(
                { isVerifiedByFirstStage: true, firstStageVerifiedBy: appraisalId, kycStatus: "complete" },
                { where: { id: id } })

            await models.customerKycClassification.update({ behaviourRatingAppraisal, idProofRatingAppraisal, addressProofRatingAppraisal, kycStatusFromAppraisal, appraisalId }, { where: { customerId: id } })
        });

    }
    return res.status(200).json({ message: 'success' })

}


exports.readKycSubmmitedCustomer = async (req, res, next) => {

    let customer = await models.customer.findAll({
        where: { isVerifiedByFirstStage: false, isKycSubmitted: true },
        include: [{
            model: models.customerKycClassification,
            as: 'customerKycClassification'
        }]
    })

    return res.status(200).json({ customer })

}


exports.addBranchManagerRating = async (req, res, next) => {
    let { customerId, customerKycId, behaviourRatingBranchManager, idProofRatingBranchManager, addressProofRatingBranchManager, kycStatusFromBranchManager } = req.body;

    let customer = await models.customer.findOne({ where: { id: customerId, isVerifiedByFirstStage: true, isKycSubmitted: true, kycStatus: "complete" } });

    if (check.isEmpty(customer)) {
        return res.status(200).json({ message: `This customer Kyc is not verified by appraisal.` })
    }
    let branchManagerId = req.userData.id

    if (kycStatusFromBranchManager !== "confirm") {
        await sequelize.transaction(async (t) => {

            await models.customerKycClassification.update({ behaviourRatingBranchManager, idProofRatingBranchManager, addressProofRatingBranchManager, kycStatusFromBranchManager, branchManagerId }, { where: { customerId } })
        });
    } else {
        await sequelize.transaction(async (t) => {
            await models.customer.update(
                { isVerifiedByBranchManager: true, branchManagerVerifiedBy: branchManagerId, kycStatus: "confirm" },
                { where: { id: customerId } })

            await models.customerKycClassification.update({ behaviourRatingBranchManager, idProofRatingBranchManager, addressProofRatingBranchManager, kycStatusFromBranchManager, branchManagerId }, { where: { customerId } })
        });
    }
    return res.status(200).json({ message: 'success' })

}


exports.readFirstStageVerifiedCustomer = async (req, res, next) => {

    let customer = await models.customer.findAll({ where: { isVerifiedByFirstStage: true, isVerifiedByBranchManager: false, isKycSubmitted: true, } })

    return res.status(200).json({ customer })

}


exports.readAllCustomerClassification = async (req, res, next) => {

    let customerClassification = await models.customerKycClassification.findAll();

    return res.status(200).json({ customerClassification })
}


exports.readAllCustomerClassificationById = async (req, res, next) => {

    let { id } = req.params;

    let customerClassification = await models.customerKycClassification.findOne({ where: { id: id } });


    if (check.isEmpty(customerClassification)) {
        return res.status(200).json({ message: `This customer Clssification data not found.` })
    }
    return res.status(200).json({ customerClassification })
}