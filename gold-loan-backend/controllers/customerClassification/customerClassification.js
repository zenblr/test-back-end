const models = require('../../models');
const sequelize = models.sequelize;
const Sequelize = models.Sequelize;
const Op = Sequelize.Op;
const request = require("request");
const { createReferenceCode } = require("../../utils/referenceCode");
const CONSTANT = require("../../utils/constant");
const moment = require("moment");

const check = require("../../lib/checkLib");
var uniqid = require('uniqid');


exports.addCceRating = async (req, res, next) => {

    let { customerId, customerKycId, behaviourRatingCce, idProofRatingCce, addressProofRatingCce, kycStatusFromCce, reasonFromCce } = req.body;


    let cceId = req.userData.id
    let checkRatingExist = await models.customerKycClassification.findOne({ where: { customerId } })
    if (!check.isEmpty(checkRatingExist)) {
        return res.status(200).json({ message: `This customer rating is already exist` })
    }
    if (kycStatusFromCce !== "approved") {

        if (reasonFromCce.length == 0) {
            return res.status(400).json({ message: `If you are not approved the customer kyc you have to give a reason.` })
        }

        await sequelize.transaction(async (t) => {
            await models.customerKyc.update(
                { cceVerifiedBy: cceId, isKycSubmitted: true },
                { where: { customerId: customerId }, transaction: t })

            await models.customerKycClassification.create({ customerId, customerKycId, behaviourRatingCce, idProofRatingCce, addressProofRatingCce, kycStatusFromCce, reasonFromCce, cceId }, { transaction: t })
        });
    } else {
        reasonFromCce = ""
        await sequelize.transaction(async (t) => {
            await models.customerKyc.update(
                { isVerifiedByCce: true, cceVerifiedBy: cceId, isKycSubmitted: true },
                { where: { customerId: customerId }, transaction: t })

            await models.customerKycClassification.create({ customerId, customerKycId, behaviourRatingCce, idProofRatingCce, addressProofRatingCce, kycStatusFromCce, cceId }, { transaction: t })
        });
    }
    return res.status(200).json({ message: 'success' })
}


exports.updateRating = async (req, res, next) => {

    let { customerId, customerKycId } = req.body;

    let customerRating = await models.customerKycClassification.findOne({ where: { customerId } })
    if (check.isEmpty(customerRating)) {
        return res.status(400).json({ message: `This customer rating is not available` })
    }

    // let { roleName } = await models.role.findOne({ where: { id: req.userData.roleId[0] } })
    // console.log(roleName)

    if ("Customer Care Executive" == req.userData.roleName[0]) {
        let { behaviourRatingCce, idProofRatingCce, addressProofRatingCce, kycStatusFromCce, reasonFromCce } = req.body
        let cceId = req.userData.id

        if (customerRating.kycStatusFromCce == "approved") {
            return res.status(400).json({ message: `You cannot change status from approved` })
        }
        if (kycStatusFromCce !== "approved") {
            if (reasonFromCce.length == 0) {
                return res.status(400).json({ message: `If you are not approved the customer kyc you have to give a reason.` })
            }
            await sequelize.transaction(async (t) => {
                await models.customerKyc.update(
                    { cceVerifiedBy: cceId, isKycSubmitted: true },
                    { where: { customerId: customerId }, transaction: t })

                await models.customerKycClassification.update({ customerId, customerKycId, behaviourRatingCce, idProofRatingCce, addressProofRatingCce, kycStatusFromCce, reasonFromCce, cceId }, { where: { customerId }, transaction: t })
            });
            return res.status(200).json({ message: 'success' })
        } else {
            reasonFromCce = ""
            await sequelize.transaction(async (t) => {
                await models.customerKyc.update(
                    { isVerifiedByCce: true, cceVerifiedBy: cceId, isKycSubmitted: true },
                    { where: { customerId: customerId }, transaction: t })

                await models.customerKycClassification.update({ customerId, customerKycId, behaviourRatingCce, idProofRatingCce, addressProofRatingCce, kycStatusFromCce, reasonFromCce, cceId }, { where: { customerId }, transaction: t })
            });
            return res.status(200).json({ message: 'success' })
        }
    }

    if ("Branch Manager" == req.userData.roleName[0]) {
        let { behaviourRatingVerifiedByBm, idProofRatingVerifiedByBm, addressProofRatingVerifiedBm, kycStatusFromBm, reasonFromBm } = req.body

        let checkCceVerified = await models.customerKyc.findOne({ customerId, isVerifiedByCce: true })
        if (check.isEmpty(checkCceVerified)) {
            return res.status(400).json({ message: `Cce rating not verified` })
        }

        let bmId = req.userData.id

        if (customerRating.kycStatusFromBm == "approved") {
            return res.status(400).json({ message: `You cannot change status from approved` })
        }
        if (kycStatusFromBm !== "approved") {
            if (reasonFromBm.length == 0) {
                return res.status(400).json({ message: `If you are not approved the customer kyc you have to give a reason.` })
            }
            await sequelize.transaction(async (t) => {
                await models.customerKyc.update(
                    { branchManagerVerifiedBy: bmId, kycStatus: kycStatusFromBm },
                    { where: { customerId: customerId }, transaction: t })

                await models.customerKycClassification.update({ customerId, customerKycId, behaviourRatingVerifiedByBm, idProofRatingVerifiedByBm, addressProofRatingVerifiedBm, kycStatusFromBm, reasonFromBm, branchManagerId: bmId }, { where: { customerId }, transaction: t })
            });
            return res.status(200).json({ message: 'success' })
        } else {
            if (behaviourRatingVerifiedByBm == true & idProofRatingVerifiedByBm == true & addressProofRatingVerifiedBm == true) {
                reasonFromBm = ""
                let customerUniqueId = uniqid.time().toUpperCase();
                await sequelize.transaction(async (t) => {
                    await models.customer.update({ customerUniqueId }, { where: { id: customerId }, transaction: t })
                    await models.customerKyc.update(
                        { isVerifiedByBranchManager: true, branchManagerVerifiedBy: bmId, kycStatus: "approved" },
                        { where: { customerId: customerId }, transaction: t })

                    await models.customerKycClassification.update({ customerId, customerKycId, behaviourRatingVerifiedByBm, idProofRatingVerifiedByBm, addressProofRatingVerifiedBm, kycStatusFromBm, reasonFromBm, branchManagerId: bmId }, { where: { customerId }, transaction: t })
                });

                let getMobileNumber = await models.customer.findOne({ where: { id: customerId } })
                let cusMobile = getMobileNumber.mobileNumber
                //message for customer
                request(
                    `${CONSTANT.SMSURL}username=${CONSTANT.SMSUSERNAME}&password=${CONSTANT.SMSPASSWORD}&type=0&dlr=1&destination=${cusMobile}&source=nicalc&message= Your unique customer ID for further loan applications is  ${customerUniqueId} `
                );
                let getBm = await models.user.findOne({ id: bmId});
                let bmMobile = getBm.mobileNumber
                 //message for BranchManager
                 request(
                    `${CONSTANT.SMSURL}username=${CONSTANT.SMSUSERNAME}&password=${CONSTANT.SMSPASSWORD}&type=0&dlr=1&destination=${bmMobile}&source=nicalc&message= Approved customer unique ID is  ${customerUniqueId} Assign appraiser for further process.`
                );
                return res.status(200).json({ message: 'success' })

               

            }
            return res.status(400).json({ message: `One of field is not verified` })
        }
    }


    return res.status(400).json({ message: `You do not have authority.` })

}


exports.updateCceRating = async (req, res, next) => {
    let { id } = req.params;
    let { behaviourRatingCce, idProofRatingCce, addressProofRatingCce, kycStatusFromCce } = req.body;
    let cceId = req.userData.id

    let customer = await models.customer.findOne({ where: { id: id, isVerifiedByBranchManager: true, kycStatus: "confirm" } });
    if (!check.isEmpty(customer)) {
        return res.status(200).json({ message: `This customer status is confirm by Branch manager.` })
    }

    if (kycStatusFromCce !== "confirm") {
        await sequelize.transaction(async (t) => {

            await models.customer.update(
                { isVerifiedByCce: false, cceVerifiedBy: cceId, kycStatus: "pending" },
                { where: { id: id } })

            await models.customerKycClassification.update({ behaviourRatingCce, idProofRatingCce, addressProofRatingCce, kycStatusFromCce, cceId }, { where: { customerId: id } })
        });
    } else {
        await sequelize.transaction(async (t) => {
            await models.customer.update(
                { isVerifiedByCce: true, cceVerifiedBy: cceId, kycStatus: "complete" },
                { where: { id: id } })

            await models.customerKycClassification.update({ behaviourRatingCce, idProofRatingCce, addressProofRatingCce, kycStatusFromCce, cceId }, { where: { customerId: id } })
        });

    }
    return res.status(200).json({ message: 'success' })

}


exports.readKycSubmmitedCustomer = async (req, res, next) => {

    let customer = await models.customer.findAll({
        where: { isVerifiedByCce: false },
        include: [{
            model: models.customerKycClassification,
            as: 'customerKycClassification'
        }]
    })

    return res.status(200).json({ customer })

}


exports.addBranchManagerRating = async (req, res, next) => {
    let { customerId, customerKycId, behaviourRatingBranchManager, idProofRatingBranchManager, addressProofRatingBranchManager, kycStatusFromBranchManager } = req.body;

    let customer = await models.customer.findOne({ where: { id: customerId, isVerifiedByCce: true } });

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

    let customer = await models.customer.findAll({
        where: { isVerifiedByCce: true, isVerifiedByBranchManager: false },
        include: [{
            model: models.customerKycClassification,
            as: 'customerKycClassification'
        }]
    })

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