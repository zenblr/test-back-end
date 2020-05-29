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

    let { customerId, customerKycId, kycRatingFromCce, kycStatusFromCce, reasonFromCce } = req.body;


    let cceId = req.userData.id
    let checkRatingExist = await models.customerKycClassification.findOne({ where: { customerId } })
    if (!check.isEmpty(checkRatingExist)) {
        return res.status(200).json({ message: `This customer rating is already exist` })
    }
    if ((kycRatingFromCce == 1 || kycRatingFromCce == 2 || kycRatingFromCce == 3 || kycRatingFromCce == 4) && kycStatusFromCce == "approved") {
        return res.status(400).json({ message: `Please check rating.` })
    }
    if (kycStatusFromCce !== "approved") {

        if (reasonFromCce.length == 0) {
            return res.status(400).json({ message: `If you are not approved the customer kyc you have to give a reason.` })
        }

        await sequelize.transaction(async (t) => {
            await models.customerKyc.update(
                { cceVerifiedBy: cceId, isKycSubmitted: true },
                { where: { customerId: customerId }, transaction: t })

            await models.customerKycClassification.create({ customerId, customerKycId, kycRatingFromCce, kycStatusFromCce, reasonFromCce, cceId }, { transaction: t })
        });
    } else {
        reasonFromCce = ""
        await sequelize.transaction(async (t) => {
            await models.customerKyc.update(
                { isVerifiedByCce: true, cceVerifiedBy: cceId, isKycSubmitted: true },
                { where: { customerId: customerId }, transaction: t })

            await models.customerKycClassification.create({ customerId, customerKycId, kycRatingFromCce, kycStatusFromCce, cceId }, { transaction: t })
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

    let user = await models.user.findOne({ where: { id: req.userData.id } });

    if (user.userTypeId == 6) {
        let { kycRatingFromCce, kycStatusFromCce, reasonFromCce } = req.body
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

                await models.customerKycClassification.update({ customerId, customerKycId, kycRatingFromCce, kycStatusFromCce, reasonFromCce, cceId }, { where: { customerId }, transaction: t })
            });
            return res.status(200).json({ message: 'success' })
        } else {
            if ((kycRatingFromCce == 1 || kycRatingFromCce == 2 || kycRatingFromCce == 3 || kycRatingFromCce == 4) && kycStatusFromCce == "approved") {
                return res.status(400).json({ message: `Please check rating.` })
            }
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

    if (user.userTypeId == 5) {
        let { kycStatusFromBm, reasonFromBm } = req.body

        let checkCceVerified = await models.customerKyc.findOne({ customerId, isVerifiedByCce: true })
        if (check.isEmpty(checkCceVerified)) {
            return res.status(400).json({ message: `Cce rating not verified` })
        }

        let bmId = req.userData.id

        if (customerRating.kycStatusFromBm == "approved" || customerRating.kycStatusFromBm == "rejected") {
            return res.status(400).json({ message: `You cannot change status for this customer` })
        }
        if (kycStatusFromBm !== "approved") {
            if (reasonFromBm.length == 0) {
                return res.status(400).json({ message: `If you are not approved the customer kyc you have to give a reason.` })
            }
            if (kycStatusFromBm == "incomplete") {
                await sequelize.transaction(async (t) => {

                    await models.customer.update({ kycStatus: "pending" })
                    await models.customerKyc.update(
                        { branchManagerVerifiedBy: bmId, isVerifiedByCce: false, kycStatusFromCce: "pending" },
                        { where: { customerId: customerId }, transaction: t })

                    await models.customerKycClassification.update({ customerId, customerKycId, kycStatusFromBm, reasonFromBm, branchManagerId: bmId }, { where: { customerId }, transaction: t })
                });
                return res.status(200).json({ message: 'success' })
            } else {
                await sequelize.transaction(async (t) => {
                    await models.customerKyc.update(
                        { branchManagerVerifiedBy: bmId },
                        { where: { customerId: customerId }, transaction: t })

                    await models.customerKycClassification.update({ customerId, customerKycId, kycStatusFromBm, reasonFromBm, branchManagerId: bmId }, { where: { customerId }, transaction: t })
                });
                return res.status(200).json({ message: 'success' })
            }


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
                let getBm = await models.user.findOne({ where: { id: bmId } });
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

