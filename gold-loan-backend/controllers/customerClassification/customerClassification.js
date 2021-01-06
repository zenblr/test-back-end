
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
let { sendCustomerUniqueId, sendMessageToOperationsTeam, sendKYCApprovalMessage, sendKYCApprovalStatusMessage } = require('../../utils/SMS')
let { updateCompleteKycModule, updateCustomerUniqueId } = require('../../service/customerKyc')


exports.cceKycRating = async (req, res, next) => {

    let { customerId, customerKycId, kycRatingFromCce, kycStatusFromCce, reasonFromCce, moduleId, scrapKycRatingFromCce, scrapKycStatusFromCce, scrapReasonFromCce } = req.body;
    let customer = await models.customer.findOne({ where: { customerId } })
    if (moduleId == 1) {

        let cceId = req.userData.id

        let checkRatingExist = await models.customerKycClassification.findOne({ where: { customerId } })
      
        if (check.isEmpty(checkRatingExist)) {
            if ((kycRatingFromCce == 1 || kycRatingFromCce == 2 || kycRatingFromCce == 3) && kycStatusFromCce == "approved") {
                return res.status(400).json({ message: `Please check rating.` })
            }
            if (kycStatusFromCce !== "approved") {

                if (reasonFromCce.length == 0) {
                    return res.status(400).json({ message: `If you are not approved the customer kyc you have to give a reason.` })
                }

                await sequelize.transaction(async (t) => {

                    if (kycStatusFromCce == "rejected") {
                        await models.customer.update(
                            { digiKycStatus: kycStatusFromCce, emiKycStatus: kycStatusFromCce, kycStatus: kycStatusFromCce, scrapKycStatus: kycStatusFromCce }, { where: { id: customerId }, transaction: t }
                        )
                    }

                    await models.customerKyc.update(
                        { cceVerifiedBy: cceId, isKycSubmitted: true, isScrapKycSubmitted: true },
                        { where: { customerId: customerId }, transaction: t })

                    await models.customerKycClassification.create({ customerId, customerKycId, kycRatingFromCce, kycStatusFromCce, reasonFromCce, cceId }, { transaction: t })
                });
                if (kycStatusFromCce == "rejected") {
                    await sms.sendMessageForKycRejected(customer.mobileNumber, customer.customerUniqueId);
                } else {
                    await sms.sendMessageForKycPending(customer.mobileNumber, customer.customerUniqueId);
                }
            } else {
                reasonFromCce = ""
                await sequelize.transaction(async (t) => {
                    await models.customerKyc.update(
                        { isVerifiedByCce: true, cceVerifiedBy: cceId, isKycSubmitted: true, isScrapKycSubmitted: true },
                        { where: { customerId: customerId }, transaction: t })

                    await models.customerKycClassification.create({ customerId, customerKycId, kycRatingFromCce, kycStatusFromCce, cceId }, { transaction: t })
                });
                await sms.sendMessageAfterKycApproved(customer.mobileNumber, customer.customerUniqueId);
            }
        } else {
            let { kycRatingFromCce, kycStatusFromCce, reasonFromCce } = req.body
            let cceId = req.userData.id

            if (checkRatingExist.kycStatusFromCce == "approved") {
                return res.status(400).json({ message: `You cannot change status from approved` })
            }
            if (kycStatusFromCce !== "approved") {
                if (reasonFromCce.length == 0) {
                    return res.status(400).json({ message: `If you are not approved the customer kyc you have to give a reason.` })
                }
                await sequelize.transaction(async (t) => {
                    if (kycStatusFromCce == "rejected") {
                        await models.customer.update(
                            { digiKycStatus: kycStatusFromCce, emiKycStatus: kycStatusFromCce, kycStatus: kycStatusFromCce, scrapKycStatus: kycStatusFromCce }, { where: { id: customerId }, transaction: t }
                        )
                    }

                    await models.customerKyc.update(
                        { cceVerifiedBy: cceId, isKycSubmitted: true, isScrapKycSubmitted: true },
                        { where: { customerId: customerId }, transaction: t })

                    await models.customerKycClassification.update({ customerId, customerKycId, kycRatingFromCce, kycStatusFromCce, reasonFromCce, cceId }, { where: { customerId }, transaction: t })
                });
                if (kycStatusFromCce == "rejected") {
                    await sms.sendMessageForKycRejected(customer.mobileNumber, customer.customerUniqueId);
                } else {
                    await sms.sendMessageForKycPending(customer.mobileNumber, customer.customerUniqueId);
                }


                return res.status(200).json({ message: 'Success' })
            } else {
                if ((kycRatingFromCce == 1 || kycRatingFromCce == 2 || kycRatingFromCce == 3) && kycStatusFromCce == "approved") {
                    return res.status(400).json({ message: `Please check rating.` })
                }
                reasonFromCce = ""
                await sequelize.transaction(async (t) => {
                    await models.customerKyc.update(
                        { isVerifiedByCce: true, cceVerifiedBy: cceId, isKycSubmitted: true, isScrapKycSubmitted: true },
                        { where: { customerId: customerId }, transaction: t })

                    await models.customerKycClassification.update({ customerId, customerKycId, kycRatingFromCce, kycStatusFromCce, reasonFromCce, cceId }, { where: { customerId }, transaction: t })
                });
                await sms.sendMessageAfterKycApproved(customer.mobileNumber, customer.customerUniqueId);
                return res.status(200).json({ message: 'Success' })
            }
        }

        return res.status(200).json({ message: 'Success' })
    } else {

        let scrapCceId = req.userData.id
        let checkRatingExist = await models.customerKycClassification.findOne({ where: { customerId } })
        if (check.isEmpty(checkRatingExist)) {
            if ((scrapKycRatingFromCce == 1 || scrapKycRatingFromCce == 2 || scrapKycRatingFromCce == 3) && scrapKycStatusFromCce == "approved") {
                return res.status(400).json({ message: `Please check rating.` })
            }
            if (scrapKycStatusFromCce !== "approved") {

                if (scrapReasonFromCce.length == 0) {
                    return res.status(400).json({ message: `If you are not approved the customer kyc you have to give a reason.` })
                }

                await sequelize.transaction(async (t) => {

                    if (scrapKycStatusFromCce == "rejected") {
                        await models.customer.update(
                            { digiKycStatus: scrapKycStatusFromCce, emiKycStatus: scrapKycStatusFromCce, kycStatus: scrapKycStatusFromCce, scrapKycStatus: scrapKycStatusFromCce }, { where: { id: customerId }, transaction: t }
                        )
                    }

                    await models.customerKyc.update(
                        { isScrapKycSubmitted: true },
                        { where: { customerId: customerId }, transaction: t })

                    await models.customerKycClassification.create({ customerId, customerKycId, scrapKycRatingFromCce, scrapKycStatusFromCce, scrapReasonFromCce, scrapCceId }, { transaction: t })
                });

                if (scrapKycStatusFromCce == "rejected") {
                    await sms.sendMessageForKycRejected(customer.mobileNumber, customer.customerUniqueId);
                } else {
                    await sms.sendMessageForKycPending(customer.mobileNumber, customer.customerUniqueId);
                }

            } else {
                reasonFromCce = ""
                await sequelize.transaction(async (t) => {

                    await models.customerKyc.update(
                        { isScrapKycSubmitted: true },
                        { where: { customerId: customerId }, transaction: t })

                    await models.customerKycClassification.create({ customerId, customerKycId, scrapKycRatingFromCce, scrapKycStatusFromCce, scrapReasonFromCce, scrapCceId }, { transaction: t })
                });
                // await sms.sendMessageAfterKycApproved(customer.mobileNumber, transactionData.transactionAmount);
            }
        } else {
            let { scrapKycRatingFromCce, scrapKycStatusFromCce, scrapReasonFromCce } = req.body
            let scrapCceId = req.userData.id

            if (checkRatingExist.scrapKycStatusFromCce == "approved") {
                return res.status(400).json({ message: `You cannot change status from approved` })
            }
            if (scrapKycStatusFromCce !== "approved") {
                if (scrapReasonFromCce.length == 0) {

                    return res.status(400).json({ message: `If you are not approved the customer kyc you have to give a reason.` })
                }
                await sequelize.transaction(async (t) => {

                    if (scrapKycStatusFromCce == "rejected") {
                        await models.customer.update(
                            { digiKycStatus: scrapKycStatusFromCce, emiKycStatus: scrapKycStatusFromCce, kycStatus: scrapKycStatusFromCce, scrapKycStatus: scrapKycStatusFromCce }, { where: { id: customerId }, transaction: t }
                        )
                    }

                    await models.customerKyc.update(
                        { isScrapKycSubmitted: true },
                        { where: { customerId: customerId }, transaction: t })

                    await models.customerKycClassification.update({ customerId, customerKycId, scrapKycRatingFromCce, scrapKycStatusFromCce, scrapReasonFromCce, scrapCceId }, { where: { customerId }, transaction: t })
                });

                if (scrapKycStatusFromCce == "rejected") {
                    await sms.sendMessageForKycRejected(customer.mobileNumber, customer.customerUniqueId);
                } else {
                    await sms.sendMessageForKycPending(customer.mobileNumber, customer.customerUniqueId);
                }
                return res.status(200).json({ message: 'Success' })
            } else {
                if ((scrapKycRatingFromCce == 1 || scrapKycRatingFromCce == 2 || scrapKycRatingFromCce == 3) && scrapKycStatusFromCce == "approved") {
                    return res.status(400).json({ message: `Please check rating.` })
                }
                reasonFromCce = ""
                await sequelize.transaction(async (t) => {

                    await models.customerKyc.update(
                        { isScrapKycSubmitted: true },
                        { where: { customerId: customerId }, transaction: t })

                    await models.customerKycClassification.update({ customerId, customerKycId, scrapKycRatingFromCce, scrapKycStatusFromCce, scrapReasonFromCce, scrapCceId }, { where: { customerId }, transaction: t })
                });
                return res.status(200).json({ message: 'success' })
            }
        }

        return res.status(200).json({ message: 'success' })
    }

}


exports.operationalTeamKycRating = async (req, res, next) => {
    let { kycStatusFromOperationalTeam, reasonFromOperationalTeam, customerId, customerKycId, moduleId, scrapKycStatusFromOperationalTeam, scrapReasonFromOperationalTeam, userType } = req.body

    if (moduleId == 1) {

        let checkCceVerified = await models.customerKyc.findOne({ where: { customerId, isVerifiedByCce: true } })
        if (check.isEmpty(checkCceVerified)) {
            return res.status(400).json({ message: `Cce rating not verified` })
        }

        let customerRating = await models.customerKycClassification.findOne({ where: { customerId } })

        let operationalTeamId = req.userData.id

        if (customerRating.kycStatusFromOperationalTeam == "approved" || customerRating.kycStatusFromOperationalTeam == "rejected") {
            return res.status(400).json({ message: `You cannot change status for this customer` })
        }
        if (kycStatusFromOperationalTeam !== "approved") {
            if (reasonFromOperationalTeam.length == 0) {
                return res.status(400).json({ message: `If you are not approved the customer kyc you have to give a reason.` })
            }
            if (kycStatusFromOperationalTeam == "incomplete") {
                await sequelize.transaction(async (t) => {

                    await models.customer.update({ kycStatus: "pending" }, { where: { id: customerId } })
                    await models.customerKyc.update(
                        { operationalTeamVerifiedBy: operationalTeamId, isVerifiedByCce: false },
                        { where: { customerId: customerId }, transaction: t })

                    await models.customerKycClassification.update({ customerId, customerKycId, kycStatusFromOperationalTeam, reasonFromOperationalTeam, operationalTeamId: operationalTeamId, kycStatusFromCce: "pending" }, { where: { customerId }, transaction: t })
                });
                return res.status(200).json({ message: 'success' })
            } else {

                await sequelize.transaction(async (t) => {
                    let kycClassificationData = await models.customerKycClassification.findOne({ where: { customerId } });

                    let customerData = await models.customer.findOne({ where: { id: customerId } });
                    if (customerData.scrapKycStatus != 'approved') {
                        await models.customer.update(
                            { digiKycStatus: kycStatusFromOperationalTeam, emiKycStatus: kycStatusFromOperationalTeam, kycStatus: kycStatusFromOperationalTeam, scrapKycStatus: kycStatusFromOperationalTeam },
                            { where: { id: customerId }, transaction: t })

                        await models.customerKyc.update(
                            { operationalTeamVerifiedBy: operationalTeamId },
                            { where: { customerId: customerId }, transaction: t })

                        await models.customerKycClassification.update({ customerId, customerKycId, kycStatusFromOperationalTeam, reasonFromOperationalTeam, operationalTeamId: operationalTeamId, scrapKycRatingFromCce: kycClassificationData.kycRatingFromCce, scrapKycStatusFromCce: kycClassificationData.kycStatusFromCce, scrapReasonFromCce: kycClassificationData.reasonFromCce, scrapCceId: kycClassificationData.cceId, scrapKycStatusFromOperationalTeam: kycStatusFromOperationalTeam, scrapReasonFromOperationalTeam: reasonFromOperationalTeam, scrapOperationalTeamId: operationalTeamId }, { where: { customerId }, transaction: t })
                    } else if (customerData.scrapKycStatus == 'approved') {
                        await models.customer.update({ kycStatus: kycStatusFromOperationalTeam }, { where: { id: customerId }, transaction: t })

                        await models.customerKyc.update(
                            { operationalTeamVerifiedBy: operationalTeamId },
                            { where: { customerId: customerId }, transaction: t })

                        await models.customerKycClassification.update({ customerId, customerKycId, kycStatusFromOperationalTeam, reasonFromOperationalTeam, operationalTeamId: operationalTeamId }, { where: { customerId }, transaction: t })
                    }


                });
                let getMobileNumber = await models.customer.findOne({ where: { id: customerId } })
                await sendKYCApprovalStatusMessage(getMobileNumber.mobileNumber, getMobileNumber.firstName, "Gold Loan", kycStatusFromOperationalTeam)

                return res.status(200).json({ message: 'success' })
            }


        } else {
            reasonFromOperationalTeam = ""

            //change check unique id
            let checkUniqueId = await models.customer.findOne({ where: { id: customerId } })
            let customerUniqueId = await updateCustomerUniqueId(checkUniqueId.customerUniqueId)
            //change check unique id

            //add complete kyc point
            let kycCompletePoint = await updateCompleteKycModule(checkUniqueId.kycCompletePoint, moduleId)
            //add complete kyc point
            let getMobileNumber = await models.customer.findOne({ where: { id: customerId } })

            await sequelize.transaction(async (t) => {

                // cust- check - scrap kyc complete
                // customerKycClassification get data of cce 
                if (getMobileNumber.scrapKycStatus == "pending") {
                    let customerKycClassificationData = await models.customerKycClassification.findOne({ where: { customerId: customerId } })

                    await models.customer.update({ kycCompletePoint, customerUniqueId, digiKycStatus: "approved", emiKycStatus: "approved", kycStatus: "approved", scrapKycStatus: "approved", userType: "Individual" }, { where: { id: customerId }, transaction: t })

                    await models.customerKyc.update(
                        { isVerifiedByOperationalTeam: true, operationalTeamVerifiedBy: operationalTeamId },
                        { where: { customerId: customerId }, transaction: t })

                    await models.customerKycClassification.update({ customerId, customerKycId, kycStatusFromOperationalTeam, reasonFromOperationalTeam, operationalTeamId: operationalTeamId, scrapKycRatingFromCce: customerKycClassificationData.kycRatingFromCce, scrapKycStatusFromCce: customerKycClassificationData.kycStatusFromCce, scrapCceId: customerKycClassificationData.cceId, scrapKycStatusFromOperationalTeam: kycStatusFromOperationalTeam, scrapReasonFromOperationalTeam: reasonFromOperationalTeam, scrapOperationalTeamId: operationalTeamId }, { where: { customerId }, transaction: t })
                } else if (getMobileNumber.scrapKycStatus == "approved") {

                    await models.customer.update({ kycCompletePoint, customerUniqueId, digiKycStatus: "approved", emiKycStatus: "approved", kycStatus: "approved" }, { where: { id: customerId }, transaction: t })
                    await models.customerKyc.update(
                        { isVerifiedByOperationalTeam: true, operationalTeamVerifiedBy: operationalTeamId },
                        { where: { customerId: customerId }, transaction: t })

                    await models.customerKycClassification.update({ customerId, customerKycId, kycStatusFromOperationalTeam, reasonFromOperationalTeam, operationalTeamId: operationalTeamId }, { where: { customerId }, transaction: t })
                }
            });

            let cusMobile = getMobileNumber.mobileNumber

            await sendKYCApprovalStatusMessage(cusMobile, getMobileNumber.firstName, "Gold Loan", kycStatusFromOperationalTeam)

            await sendCustomerUniqueId(cusMobile, getMobileNumber.firstName, customerUniqueId)
            //message for customer
            // request(
            // `${CONSTANT.SMSURL}username=${CONSTANT.SMSUSERNAME}&password=${CONSTANT.SMSPASSWORD}&type=0&dlr=1&destination=${cusMobile}&source=nicalc&message= Your unique customer ID for further loan applications is ${customerUniqueId} `
            // );
            let getBm = await models.user.findOne({ where: { id: operationalTeamId } });
            let bmMobile = getBm.mobileNumber

            await sendMessageToOperationsTeam(bmMobile, customerUniqueId)

            //message for BranchManager
            // request(
            // `${CONSTANT.SMSURL}username=${CONSTANT.SMSUSERNAME}&password=${CONSTANT.SMSPASSWORD}&type=0&dlr=1&destination=${bmMobile}&source=nicalc&message= Approved customer unique ID is ${customerUniqueId} Assign appraiser for further process.`
            // );
            return res.status(200).json({ message: 'success' })
        }
    } else {

        let checkCceVerified = await models.customerKycClassification.findOne({ where: { customerId, scrapKycStatusFromCce: { [Op.in]: ["approved"] } } })
        if (check.isEmpty(checkCceVerified)) {
            return res.status(400).json({ message: `Cce rating not verified` })
        }

        let customerRating = await models.customerKycClassification.findOne({ where: { customerId } })

        let scrapOperationalTeamId = req.userData.id

        if (customerRating.scrapKycStatusFromOperationalTeam == "approved" || customerRating.scrapKycStatusFromOperationalTeam == "rejected") {
            return res.status(400).json({ message: `You cannot change status for this customer` })
        }
        if (scrapKycStatusFromOperationalTeam !== "approved") {
            if (scrapReasonFromOperationalTeam.length == 0) {
                return res.status(400).json({ message: `If you are not approved the customer kyc you have to give a reason.` })
            }
            if (scrapKycStatusFromOperationalTeam == "incomplete") {
                await sequelize.transaction(async (t) => {

                    // await models.customerKyc.update(
                    // { operationalTeamVerifiedBy: scrapOperationalTeamId, isVerifiedByCce: false },
                    // { where: { customerId: customerId }, transaction: t })

                    await models.customer.update({ scrapKycStatus: "pending" }, { where: { id: customerId } })

                    await models.customerKycClassification.update({ customerId, customerKycId, scrapKycStatusFromOperationalTeam, scrapReasonFromOperationalTeam, scrapOperationalTeamId: scrapOperationalTeamId, scrapKycStatusFromCce: "pending" }, { where: { customerId }, transaction: t })
                });
                return res.status(200).json({ message: 'success' })
            } else {

                if (userType == "Corporate") {

                    await sequelize.transaction(async (t) => {
                        await models.customer.update({ scrapKycStatus: scrapKycStatusFromOperationalTeam }, { where: { id: customerId }, transaction: t })

                        // await models.customerKyc.update(
                        // { operationalTeamVerifiedBy: scrapOperationalTeamId },
                        // { where: { customerId: customerId }, transaction: t })

                        await models.customerKycClassification.update({
                            customerId, customerKycId, scrapKycStatusFromOperationalTeam, scrapReasonFromOperationalTeam, scrapOperationalTeamId: scrapOperationalTeamId,
                            // kycRatingFromCce: kycClassificationData.scrapKycRatingFromCce, kycStatusFromCce: kycClassificationData.scrapKycStatusFromCce, reasonFromCce: kycClassificationData.scrapReasonFromCce, cceId: kycClassificationData.scrapCceId, kycStatusFromOperationalTeam: scrapKycStatusFromOperationalTeam, reasonFromOperationalTeam: scrapReasonFromOperationalTeam, operationalTeamId: scrapOperationalTeamId 
                        }, { where: { customerId }, transaction: t })
                    });

                } else {
                    let kycClassificationData = await models.customerKycClassification.findOne({ where: { customerId } });

                    await sequelize.transaction(async (t) => {
                        await models.customer.update(
                            { digiKycStatus: scrapKycStatusFromOperationalTeam, emiKycStatus: scrapKycStatusFromOperationalTeam, scrapKycStatus: scrapKycStatusFromOperationalTeam, kycStatus: scrapKycStatusFromOperationalTeam },
                            { where: { id: customerId }, transaction: t })

                        // await models.customerKyc.update(
                        // { operationalTeamVerifiedBy: scrapOperationalTeamId },
                        // { where: { customerId: customerId }, transaction: t })

                        await models.customerKycClassification.update({ customerId, customerKycId, scrapKycStatusFromOperationalTeam, scrapReasonFromOperationalTeam, scrapOperationalTeamId: scrapOperationalTeamId, kycRatingFromCce: kycClassificationData.scrapKycRatingFromCce, kycStatusFromCce: kycClassificationData.scrapKycStatusFromCce, reasonFromCce: kycClassificationData.scrapReasonFromCce, cceId: kycClassificationData.scrapCceId, kycStatusFromOperationalTeam: scrapKycStatusFromOperationalTeam, reasonFromOperationalTeam: scrapReasonFromOperationalTeam, operationalTeamId: scrapOperationalTeamId }, { where: { customerId }, transaction: t })
                    });
                }

                let getMobileNumber = await models.customer.findOne({ where: { id: customerId } })
                await sendKYCApprovalStatusMessage(getMobileNumber.mobileNumber, getMobileNumber.firstName, "Gold Scrap", scrapKycStatusFromOperationalTeam)

                return res.status(200).json({ message: 'success' })
            }


        } else {
            scrapRscrapReasonFromOperationalTeam = ""

            //change check unique id
            let checkUniqueId = await models.customer.findOne({ where: { id: customerId } })
            let customerUniqueId = await updateCustomerUniqueId(checkUniqueId.customerUniqueId)
            //change check unique id

            //add complete kyc point
            let kycCompletePoint = await updateCompleteKycModule(checkUniqueId.kycCompletePoint, moduleId)
            //add complete kyc point

            await sequelize.transaction(async (t) => {
                await models.customer.update({ kycCompletePoint, customerUniqueId, digiKycStatus: "approved", emiKycStatus: "Approved", scrapKycStatus: "approved" }, { where: { id: customerId }, transaction: t })

                // await models.customerKyc.update(
                // { isVerifiedByOperationalTeam: true, operationalTeamVerifiedBy: scrapOperationalTeamId },
                // { where: { customerId: customerId }, transaction: t })

                await models.customerKycClassification.update({ customerId, customerKycId, scrapKycStatusFromOperationalTeam, scrapReasonFromOperationalTeam, scrapOperationalTeamId: scrapOperationalTeamId }, { where: { customerId }, transaction: t })
            });

            let getMobileNumber = await models.customer.findOne({ where: { id: customerId } })
            let cusMobile = getMobileNumber.mobileNumber

            await sendKYCApprovalStatusMessage(cusMobile, getMobileNumber.firstName, "Gold Scrap", scrapKycStatusFromOperationalTeam)
            // await sendCustomerUniqueId(cusMobile, getMobileNumber.firstName, customerUniqueId)
            //message for customer
            request(
                `${CONSTANT.SMSURL}username=${CONSTANT.SMSUSERNAME}&password=${CONSTANT.SMSPASSWORD}&type=0&dlr=1&destination=${cusMobile}&source=nicalc&message= Your unique customer ID for further loan applications is ${customerUniqueId} `
            );
            let getBm = await models.user.findOne({ where: { id: scrapOperationalTeamId } });
            let bmMobile = getBm.mobileNumber

            // await sendMessageToOperationsTeam(bmMobile, customerUniqueId)

            //message for BranchManager
            request(
                `${CONSTANT.SMSURL}username=${CONSTANT.SMSUSERNAME}&password=${CONSTANT.SMSPASSWORD}&type=0&dlr=1&destination=${bmMobile}&source=nicalc&message= Approved customer unique ID is ${customerUniqueId} Assign appraiser for further process.`
            );
            return res.status(200).json({ message: 'success' })
        }
    }

}

exports.updateRating = async (req, res, next) => {

    let { customerId, customerKycId, moduleId } = req.body;

    let customerRating = await models.customerKycClassification.findOne({ where: { customerId } })
    if (check.isEmpty(customerRating)) {
        return res.status(400).json({ message: `This customer rating is not available` })
    }

    let user = await models.user.findOne({ where: { id: req.userData.id } });

    if (moduleId == 1) {
        if (user.userTypeId == 6) {

        }

        if (user.userTypeId == 8) {
            let { kycStatusFromOperationalTeam, reasonFromOperationalTeam } = req.body

            let checkCceVerified = await models.customerKyc.findOne({ where: { customerId, isVerifiedByCce: true } })
            if (check.isEmpty(checkCceVerified)) {
                return res.status(400).json({ message: `Cce rating not verified` })
            }

            let operationalTeamId = req.userData.id

            if (customerRating.kycStatusFromOperationalTeam == "approved" || customerRating.kycStatusFromOperationalTeam == "rejected") {
                return res.status(400).json({ message: `You cannot change status for this customer` })
            }
            if (kycStatusFromOperationalTeam !== "approved") {
                if (reasonFromOperationalTeam.length == 0) {
                    return res.status(400).json({ message: `If you are not approved the customer kyc you have to give a reason.` })
                }
                if (kycStatusFromOperationalTeam == "incomplete") {
                    await sequelize.transaction(async (t) => {

                        await models.customer.update({ kycStatus: "pending" }, { where: { id: customerId } })
                        await models.customerKyc.update(
                            { operationalTeamVerifiedBy: operationalTeamId, isVerifiedByCce: false },
                            { where: { customerId: customerId }, transaction: t })

                        await models.customerKycClassification.update({ customerId, customerKycId, kycStatusFromOperationalTeam, reasonFromOperationalTeam, operationalTeamId: operationalTeamId, kycStatusFromCce: "pending" }, { where: { customerId }, transaction: t })
                    });
                    return res.status(200).json({ message: 'success' })
                } else {
                    await sequelize.transaction(async (t) => {

                        let customerData = await models.customer.findOne({ where: { id: customerId } });
                        let kycClassificationData = await models.customerKycClassification.findOne({ where: { customerId } });

                        if (customerData.scrapKycStatus != "approved") {
                            await models.customerKyc.update(
                                { operationalTeamVerifiedBy: operationalTeamId },
                                { where: { customerId: customerId }, transaction: t })

                            await models.customerKycClassification.update({ customerId, customerKycId, kycStatusFromOperationalTeam, reasonFromOperationalTeam, operationalTeamId: operationalTeamId, scrapKycRatingFromCce: kycClassificationData.kycRatingFromCce, scrapKycStatusFromCce: kycClassificationData.kycStatusFromCce, scrapReasonFromCce: kycClassificationData.reasonFromCce, scrapCceId: kycClassificationData.cceId, scrapKycStatusFromOperationalTeam: kycStatusFromOperationalTeam, scrapReasonFromOperationalTeam: reasonFromOperationalTeam, scrapOperationalTeamId: operationalTeamId }, { where: { customerId }, transaction: t })

                        } else if (ustomerData.scrapKycStatus == "approved") {
                            await models.customerKyc.update(
                                { operationalTeamVerifiedBy: operationalTeamId },
                                { where: { customerId: customerId }, transaction: t })

                            await models.customerKycClassification.update({ customerId, customerKycId, kycStatusFromOperationalTeam, reasonFromOperationalTeam, operationalTeamId: operationalTeamId }, { where: { customerId }, transaction: t })
                        }
                    });
                    return res.status(200).json({ message: 'success' })
                }


            } else {
                reasonFromOperationalTeam = ""
                let customerUniqueId = uniqid.time().toUpperCase();

                let getMobileNumber = await models.customer.findOne({ where: { id: customerId } })

                await sequelize.transaction(async (t) => {

                    //if loan kyc approved then scrap kyc status approved
                    if (getMobileNumber.scrapKycStatus == "pending") {
                        let customerKycClassificationData = await models.customerKycClassification.findOne({ where: { customerId: customerId } })

                        await models.customer.update({ customerUniqueId, kycStatus: "approved", scrapKycStatus: "approved", userType: "Individual" }, { where: { id: customerId }, transaction: t })

                        await models.customerKyc.update(
                            { isVerifiedByOperationalTeam: true, operationalTeamVerifiedBy: operationalTeamId },
                            { where: { customerId: customerId }, transaction: t })

                        await models.customerKycClassification.update({ customerId, customerKycId, kycStatusFromOperationalTeam, reasonFromOperationalTeam, operationalTeamId: operationalTeamId, scrapKycRatingFromCce: customerKycClassificationData.kycRatingFromCce, scrapKycStatusFromCce: customerKycClassificationData.kycStatusFromCce, scrapCceId: customerKycClassificationData.cceId, scrapKycStatusFromOperationalTeam: kycStatusFromOperationalTeam, scrapReasonFromOperationalTeam: reasonFromOperationalTeam, scrapOperationalTeamId: operationalTeamId }, { where: { customerId }, transaction: t })
                    } else if (getMobileNumber.scrapKycStatus == "approved") {

                        await models.customer.update({ customerUniqueId, kycStatus: "approved" }, { where: { id: customerId }, transaction: t })
                        await models.customerKyc.update(
                            { isVerifiedByOperationalTeam: true, operationalTeamVerifiedBy: operationalTeamId },
                            { where: { customerId: customerId }, transaction: t })

                        await models.customerKycClassification.update({ customerId, customerKycId, kycStatusFromOperationalTeam, reasonFromOperationalTeam, operationalTeamId: operationalTeamId }, { where: { customerId }, transaction: t })
                    }

                });

                let cusMobile = getMobileNumber.mobileNumber

                // await sendCustomerUniqueId(cusMobile, getMobileNumber.firstName, customerUniqueId)
                //message for customer
                request(
                    `${CONSTANT.SMSURL}username=${CONSTANT.SMSUSERNAME}&password=${CONSTANT.SMSPASSWORD}&type=0&dlr=1&destination=${cusMobile}&source=nicalc&message= Your unique customer ID for further loan applications is ${customerUniqueId} `
                );
                let getBm = await models.user.findOne({ where: { id: operationalTeamId } });
                let bmMobile = getBm.mobileNumber

                // await sendMessageToOperationsTeam(bmMobile, customerUniqueId)

                //message for BranchManager
                request(
                    `${CONSTANT.SMSURL}username=${CONSTANT.SMSUSERNAME}&password=${CONSTANT.SMSPASSWORD}&type=0&dlr=1&destination=${bmMobile}&source=nicalc&message= Approved customer unique ID is ${customerUniqueId} Assign appraiser for further process.`
                );
                return res.status(200).json({ message: 'success' })

            }
        }
        return res.status(400).json({ message: `You do not have authority.` })

    } else {

        if (user.userTypeId == 6) {

        }

        if (user.userTypeId == 8) {
            let { scrapKycStatusFromOperationalTeam, scrapReasonFromOperationalTeam } = req.body

            let checkCceVerified = await models.customerKycClassification.findOne({ where: { customerId, scrapKycStatusFromCce: { [Op.in]: ["approved"] } } })
            if (check.isEmpty(checkCceVerified)) {
                return res.status(400).json({ message: `Cce rating not verified` })
            }

            let operationalTeamId = req.userData.id

            if (customerRating.scrapKycStatusFromOperationalTeam == "approved" || customerRating.scrapKycStatusFromOperationalTeam == "rejected") {
                return res.status(400).json({ message: `You cannot change status for this customer` })
            }
            if (scrapKycStatusFromOperationalTeam !== "approved") {
                if (scrapReasonFromOperationalTeam.length == 0) {
                    return res.status(400).json({ message: `If you are not approved the customer kyc you have to give a reason.` })
                }
                if (scrapKycStatusFromOperationalTeam == "incomplete") {
                    await sequelize.transaction(async (t) => {

                        await models.customer.update({ scrapKycStatus: "pending" }, { where: { id: customerId } })

                        // await models.customerKyc.update(
                        // { operationalTeamVerifiedBy: operationalTeamId, isVerifiedByCce: false },
                        // { where: { customerId: customerId }, transaction: t })

                        await models.customerKycClassification.update({ customerId, customerKycId, scrapKycStatusFromOperationalTeam, scrapReasonFromOperationalTeam, scrapOperationalTeamId: operationalTeamId, scrapKycStatusFromCce: "pending" }, { where: { customerId }, transaction: t })
                    });
                    return res.status(200).json({ message: 'success' })
                } else {

                    if (userType == "Corporate") {
                        await sequelize.transaction(async (t) => {

                            let kycClassificationData = await models.customerKycClassification.findOne({ where: { customerId } });

                            // await models.customerKyc.update(
                            // { operationalTeamVerifiedBy: operationalTeamId },
                            // { where: { customerId: customerId }, transaction: t })

                            await models.customerKycClassification.update({
                                customerId, customerKycId, scrapKycStatusFromOperationalTeam, scrapReasonFromOperationalTeam, scrapOperationalTeamId: operationalTeamId,
                                // kycRatingFromCce: kycClassificationData.scrapKycRatingFromCce, kycStatusFromCce: kycClassificationData.scrapKycStatusFromCce, reasonFromCce: kycClassificationData.scrapReasonFromCce, cceId: kycClassificationData.scrapCceId, kycStatusFromOperationalTeam: scrapKycStatusFromOperationalTeam, reasonFromOperationalTeam: scrapReasonFromOperationalTeam, operationalTeamId: operationalTeamId 
                            }, { where: { customerId }, transaction: t })
                        });
                    } else {
                        await sequelize.transaction(async (t) => {

                            let kycClassificationData = await models.customerKycClassification.findOne({ where: { customerId } });

                            // await models.customerKyc.update(
                            // { operationalTeamVerifiedBy: operationalTeamId },
                            // { where: { customerId: customerId }, transaction: t })

                            await models.customerKycClassification.update({ customerId, customerKycId, scrapKycStatusFromOperationalTeam, scrapReasonFromOperationalTeam, scrapOperationalTeamId: operationalTeamId, kycRatingFromCce: kycClassificationData.scrapKycRatingFromCce, kycStatusFromCce: kycClassificationData.scrapKycStatusFromCce, reasonFromCce: kycClassificationData.scrapReasonFromCce, cceId: kycClassificationData.scrapCceId, kycStatusFromOperationalTeam: scrapKycStatusFromOperationalTeam, reasonFromOperationalTeam: scrapReasonFromOperationalTeam, operationalTeamId: operationalTeamId }, { where: { customerId }, transaction: t })
                        });
                    }

                    return res.status(200).json({ message: 'success' })
                }

            } else {
                scrapReasonFromOperationalTeam = ""
                let customerUniqueId = uniqid.time().toUpperCase();
                await sequelize.transaction(async (t) => {
                    await models.customer.update({ customerUniqueId, scrapKycStatus: "approved" }, { where: { id: customerId }, transaction: t })

                    // await models.customerKyc.update(
                    // { isVerifiedByOperationalTeam: true, operationalTeamVerifiedBy: operationalTeamId },
                    // { where: { customerId: customerId }, transaction: t })

                    await models.customerKycClassification.update({ customerId, customerKycId, scrapKycStatusFromOperationalTeam, scrapReasonFromOperationalTeam, scrapOperationalTeamId: operationalTeamId }, { where: { customerId }, transaction: t })
                });

                let getMobileNumber = await models.customer.findOne({ where: { id: customerId } })
                let cusMobile = getMobileNumber.mobileNumber

                // await sendCustomerUniqueId(cusMobile, getMobileNumber.firstName, customerUniqueId)
                //message for customer
                request(
                    `${CONSTANT.SMSURL}username=${CONSTANT.SMSUSERNAME}&password=${CONSTANT.SMSPASSWORD}&type=0&dlr=1&destination=${cusMobile}&source=nicalc&message= Your unique customer ID for further loan applications is ${customerUniqueId} `
                );
                let getBm = await models.user.findOne({ where: { id: operationalTeamId } });
                let bmMobile = getBm.mobileNumber

                // await sendMessageToOperationsTeam(bmMobile, customerUniqueId)

                //message for BranchManager
                request(
                    `${CONSTANT.SMSURL}username=${CONSTANT.SMSUSERNAME}&password=${CONSTANT.SMSPASSWORD}&type=0&dlr=1&destination=${bmMobile}&source=nicalc&message= Approved customer unique ID is ${customerUniqueId} Assign appraiser for further process.`
                );
                return res.status(200).json({ message: 'success' })

            }
        }
        return res.status(400).json({ message: `You do not have authority.` })

    }


}



exports.updateRatingAppraiserOrCce = async (req, res, next) => {
    let { customerId, customerKycId } = req.body;

    let customerRating = await models.customerKycClassification.findOne({ where: { customerId } })
    let customer = await models.customer.findOne({ where: { customerId } })

    if (check.isEmpty(customerRating)) {
        return res.status(400).json({ message: `This customer rating is not available` })
    }

    let user = await models.user.findOne({ where: { id: req.userData.id } });

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

            if (kycStatusFromCce == "rejected") {
                await models.customer.update(
                    { digiKycStatus: kycStatusFromCce, emiKycStatus: kycStatusFromCce, kycStatus: kycStatusFromCce, scrapKycStatus: kycStatusFromCce }, { where: { id: customerId }, transaction: t }
                )
            }

            await models.customerKyc.update(
                { cceVerifiedBy: cceId, isKycSubmitted: true },
                { where: { customerId: customerId }, transaction: t })

            await models.customerKycClassification.update({ customerId, customerKycId, kycRatingFromCce, kycStatusFromCce, reasonFromCce, cceId }, { where: { customerId }, transaction: t })
        });
        if (checkRatingExist.kycStatusFromCce == "rejected") {
            await sms.sendMessageForKycRejected(customer.mobileNumber, customer.customerUniqueId);
        } else {
            await sms.sendMessageForKycPending(customer.mobileNumber, customer.customerUniqueId);
        }
        return res.status(200).json({ message: 'success' })
    } else {
        if ((kycRatingFromCce == 1 || kycRatingFromCce == 2 || kycRatingFromCce == 3) && kycStatusFromCce == "approved") {
            return res.status(400).json({ message: `Please check rating.` })
        }
        reasonFromCce = ""
        await sequelize.transaction(async (t) => {
            await models.customerKyc.update(
                { isVerifiedByCce: true, cceVerifiedBy: cceId, isKycSubmitted: true },
                { where: { customerId: customerId }, transaction: t })

            await models.customerKycClassification.update({ customerId, customerKycId, kycRatingFromCce, kycStatusFromCce, reasonFromCce, cceId }, { where: { customerId }, transaction: t })
        });
        await sms.sendMessageAfterKycApproved(customer.mobileNumber, customer.customerUniqueId);
        return res.status(200).json({ message: 'success' })
    }
}