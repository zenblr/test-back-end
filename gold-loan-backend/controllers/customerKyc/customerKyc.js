const models = require('../../models');
const sequelize = models.sequelize;
const Sequelize = models.Sequelize;
const Op = Sequelize.Op;
const request = require("request");
const { createReferenceCode } = require("../../utils/referenceCode");
const CONSTANT = require("../../utils/constant");
const moment = require("moment");
const { paginationWithFromTo } = require("../../utils/pagination");
const { VIEW_ALL_CUSTOMER } = require('../../utils/permissionCheck')

const check = require("../../lib/checkLib");


exports.getCustomerDetails = async (req, res, next) => {
    let { mobileNumber } = req.body
    let numberExistInCustomer = await models.customer.findOne({ where: { mobileNumber } })
    if (check.isEmpty(numberExistInCustomer)) {
        return res.status(404).json({ message: "Your Mobile number does not exist, please add lead first" });
    }

    let status = await models.status.findOne({ where: { statusName: "confirm" } })
    if (check.isEmpty(status)) {
        return res.status(404).json({ message: "Status confirm is not there in status table" });
    }
    let statusId = status.id
    let checkStatusCustomer = await models.customer.findOne({
        where: { statusId, id: numberExistInCustomer.id },
        attributes: ['firstName', 'lastName', 'panCardNumber', 'panType', 'panCardNumber', 'panImage'],
    })
    if (check.isEmpty(checkStatusCustomer)) {
        return res.status(400).json({ message: "Please proceed after confirm your lead stage status" });
    }
    return res.status(200).json({ message: "Success", customerInfo: checkStatusCustomer });
}


exports.submitCustomerKycinfo = async (req, res, next) => {

    let { firstName, lastName, mobileNumber, panCardNumber, panType, panImage } = req.body

    let status = await models.status.findOne({ where: { statusName: "confirm" } })
    if (check.isEmpty(status)) {
        return res.status(404).json({ message: "Status confirm is not there in status table" });
    }
    let statusId = status.id
    let getCustomerInfo = await models.customer.findOne({
        where: { mobileNumber: mobileNumber, statusId },
        attributes: ['id', 'firstName', 'lastName', 'stateId', 'cityId', 'pinCode', 'panType', 'panImage'],
    })
    let findPanCardNumber = await models.customer.findOne({
        where: {
            id: { [Op.not]: getCustomerInfo.id },
            panCardNumber: { [Op.iLike]: panCardNumber },
            isActive: true
        }
    });
    if (!check.isEmpty(findPanCardNumber)) {
        return res.status(400).json({ message: "Pan Card Number already exists! " })
    }

    if (check.isEmpty(getCustomerInfo)) {
        return res.status(404).json({ message: "Your status is not confirm" });
    }

    let findCustomerKyc = await models.customerKyc.findOne({ where: { customerId: getCustomerInfo.id, isKycSubmitted: true } })
    if (!check.isEmpty(findCustomerKyc)) {
        return res.status(404).json({ message: "This customer Kyc is already submitted." });
    }
    let KycStage = await models.customerKyc.findOne({ where: { customerId: getCustomerInfo.id } })

    if (!check.isEmpty(KycStage)) {

        if (KycStage.customerKycCurrentStage == "2") {
            let { id, stateId, cityId, pinCode } = await models.customer.findOne({ where: { id: KycStage.customerId, isActive: true } });

            return res.status(200).json({
                customerId: KycStage.customerId,
                customerKycId: KycStage.id,
                customerKycCurrentStage: KycStage.customerKycCurrentStage,
                stateId: stateId,
                cityId: cityId,
                pinCode: pinCode
            })

        } else if (KycStage.customerKycCurrentStage == "3") {

            let { firstName, lastName } = await models.customerKycPersonalDetail.findOne({ where: { customerId: KycStage.customerId } })
            let name = `${firstName} ${lastName}`;

            return res.status(200).json({
                customerId: KycStage.customerId,
                customerKycId: KycStage.id,
                name,
                customerKycCurrentStage: KycStage.customerKycCurrentStage
            })

        } else if (KycStage.customerKycCurrentStage == "4") {
            let customerKycReview = await models.customer.findOne({
                where: { id: KycStage.customerId },
                attributes: ['id', 'firstName', 'lastName', 'panCardNumber', 'mobileNumber', 'panType', 'panImage'],
                include: [{
                    model: models.customerKycPersonalDetail,
                    as: 'customerKycPersonal',
                    attributes: ['id', 'customerId', 'firstName', 'lastName', 'profileImage', 'dateOfBirth', 'alternateMobileNumber', 'panCardNumber', 'gender', 'age', 'martialStatus', 'occupationId', 'identityTypeId', 'identityProofNumber', 'identityProof', 'spouseName', 'signatureProof'],
                    include: [{
                        model: models.occupation,
                        as: 'occupation'
                    }, {
                        model: models.identityType,
                        as: 'identityType'
                    }]
                }, {
                    model: models.customerKycAddressDetail,
                    as: 'customerKycAddress',
                    attributes: ['id', 'customerKycId', 'customerId', 'addressType', 'address', 'stateId', 'cityId', 'pinCode', 'addressProofTypeId', 'addressProofNumber', 'addressProof'],
                    include: [{
                        model: models.state,
                        as: 'state'
                    }, {
                        model: models.city,
                        as: 'city'
                    }, {
                        model: models.addressProofType,
                        as: 'addressProofType'
                    }],
                    order: [["id", "ASC"]]
                }]
            })
            return res.status(200).json({
                customerId: KycStage.customerId,
                customerKycId: KycStage.id,
                customerKycCurrentStage: KycStage.customerKycCurrentStage,
                customerKycReview
            })

        }
    }


    let createdBy = req.userData.id;
    let modifiedBy = req.userData.id;
    let kyc = await sequelize.transaction(async (t) => {

        let customerKycAdd = await models.customerKyc.create({ isAppliedForKyc: true, customerId: getCustomerInfo.id, createdBy, modifiedBy, customerKycCurrentStage: "2" }, { transaction: t })

        await models.customer.update({ firstName: firstName, lastName: lastName, panCardNumber: panCardNumber, panType, panImage }, { where: { id: getCustomerInfo.id }, transaction: t })

        let createCustomerKyc = await models.customerKycPersonalDetail.create({
            customerId: getCustomerInfo.id,
            customerKycId: customerKycAdd.id,
            firstName: firstName,
            lastName: lastName,
            panCardNumber: panCardNumber,
            createdBy,
            modifiedBy
        }, { transaction: t });
        return customerKycAdd
    })

    return res.status(200).json({
        customerId: getCustomerInfo.id,
        customerKycId: kyc.id,
        customerKycCurrentStage: kyc.customerKycCurrentStage,
        stateId: getCustomerInfo.stateId,
        cityId: getCustomerInfo.cityId,
        pinCode: getCustomerInfo.pinCode
    })
}


exports.submitCustomerKycAddress = async (req, res, next) => {

    let { customerId, customerKycId, identityProof, identityTypeId, identityProofNumber, address } = req.body
    let createdBy = req.userData.id;
    let modifiedBy = req.userData.id;
    if (identityProof.length == 0) {
        return res.status(404).json({ message: "Identity proof file must be required." });
    }
    if (address[0].addressProof.length == 0 || address[1].addressProof.length == 0) {
        return res.status(404).json({ message: "Address proof file must be required." });
    }
    let findCustomerKyc = await models.customerKycAddressDetail.findOne({ where: { customerKycId: customerKycId } })

    if (!check.isEmpty(findCustomerKyc)) {
        return res.status(404).json({ message: "This customer address details is already filled." });
    }

    let findIdentityNumber = await models.customerKycPersonalDetail.findOne({ where: { identityProofNumber: identityProofNumber } });
    if (!check.isEmpty(findIdentityNumber)) {
        return res.status(400).json({ message: "Identity Proof Number already exists! " })
    }


    let addressArray = []
    for (let i = 0; i < address.length; i++) {

        address[i]['customerId'] = customerId
        address[i]['customerKycId'] = customerKycId
        address[i]['createdBy'] = createdBy
        address[i]['modifiedBy'] = modifiedBy
        addressArray.push(address[i])
    }
    let customerDetail = await models.customerKycPersonalDetail.findOne({ where: { customerKycId: customerKycId } })
    let name = `${customerDetail.firstName} ${customerDetail.lastName}`;

    await sequelize.transaction(async t => {
        await models.customerKycPersonalDetail.update({
            identityProof: identityProof,
            identityTypeId: identityTypeId,
            identityProofNumber: identityProofNumber,
            modifiedBy: modifiedBy
        }, { where: { customerId: customerId }, transaction: t });

        await models.customerKyc.update({ modifiedBy, customerKycCurrentStage: "3" }, { where: { customerId }, transaction: t });
        await models.customerKycAddressDetail.bulkCreate(addressArray, { returning: true, transaction: t });

    })

    let { customerKycCurrentStage } = await models.customerKyc.findOne({ where: { customerId } });

    return res.status(200).json({ customerId, customerKycId, name, customerKycCurrentStage })
}


exports.submitCustomerKycPersonalDetail = async (req, res, next) => {

    let { customerId, customerKycId, profileImage, dateOfBirth, age, alternateMobileNumber, gender, martialStatus, occupationId, spouseName, signatureProof } = req.body

    let createdBy = req.userData.id;
    let modifiedBy = req.userData.id;

    let customer = await models.customer.findOne({ where: { id: customerId } })

    if (customer.mobileNumber == alternateMobileNumber) {
        return res.status(400).json({ message: "Your alternate Mobile number is same as your previous Mobile number " });
    }
    let findAlternateNumberExist = await models.customerKycPersonalDetail.findOne({ where: { alternateMobileNumber } })

    if (!check.isEmpty(findAlternateNumberExist)) {
        return res.status(400).json({ message: "Your alternate Mobile number is already exist." });
    }

    await sequelize.transaction(async t => {

        let details = await models.customerKycPersonalDetail.update({
            profileImage: profileImage,
            dateOfBirth: dateOfBirth,
            alternateMobileNumber: alternateMobileNumber,
            gender: gender,
            age: age,
            martialStatus: martialStatus,
            occupationId: occupationId,
            spouseName: spouseName,
            signatureProof: signatureProof,
            modifiedBy: modifiedBy
        }, { where: { customerId: customerId }, transaction: t });

        await models.customerKyc.update({ modifiedBy, customerKycCurrentStage: "4" }, { where: { customerId }, transaction: t });

    })
    let customerKycReview = await models.customer.findOne({
        where: { id: customerId },
        attributes: ['id', 'firstName', 'lastName', 'panCardNumber', 'mobileNumber', 'panType', 'panImage'],
        include: [{
            model: models.customerKycPersonalDetail,
            as: 'customerKycPersonal',
            attributes: ['id', 'customerId', 'firstName', 'lastName', 'profileImage', 'dateOfBirth', 'alternateMobileNumber', 'panCardNumber', 'gender', 'age', 'martialStatus', 'occupationId', 'identityTypeId', 'identityProofNumber', 'identityProof', 'spouseName', 'signatureProof'],
            include: [{
                model: models.occupation,
                as: 'occupation'
            }, {
                model: models.identityType,
                as: 'identityType'
            }]
        }, {
            model: models.customerKycAddressDetail,
            as: 'customerKycAddress',
            attributes: ['id', 'customerKycId', 'customerId', 'addressType', 'address', 'stateId', 'cityId', 'pinCode', 'addressProofTypeId', 'addressProofNumber', 'addressProof'],
            include: [{
                model: models.state,
                as: 'state'
            }, {
                model: models.city,
                as: 'city'
            }, {
                model: models.addressProofType,
                as: 'addressProofType'
            }],
            order: [["id", "ASC"]]
        }]
    })

    let { customerKycCurrentStage } = await models.customerKyc.findOne({ where: { customerId } });

    return res.status(200).json({ customerId, customerKycId, customerKycCurrentStage, customerKycReview })


}


exports.submitCustomerKycBankDetail = async (req, res, next) => {

}


exports.submitAllKycInfo = async (req, res, next) => {

    let { customerId, customerKycId, customerKycPersonal, customerKycAddress, customerKycBank, customerKycReview } = req.body;

    // let findCustomerKyc = await models.customerKyc.findOne({ where: { id: customerKycId } })
    // if (check.isEmpty(findCustomerKyc)) {
    //     return res.status(404).json({ message: "This customer kyc detailes is not filled." });
    // }

    let findIdentityNumber = await models.customerKycPersonalDetail.findOne({ where: { customerId: { [Op.not]: customerId }, identityProofNumber: customerKycPersonal.identityProofNumber } });
    if (!check.isEmpty(findIdentityNumber)) {
        return res.status(400).json({ message: "Identity Proof Number already exists! " })
    }
    if (customerKycReview.panCardNumber) {
        let findPanCardNumber = await models.customer.findOne({
            where: {
                id: { [Op.not]: customerId },
                panCardNumber: { [Op.iLike]: customerKycReview.panCardNumber },
                isActive: true
            }
        });
        if (!check.isEmpty(findPanCardNumber)) {
            return res.status(400).json({ message: "Pan Card Number already exists! " })
        }
    }


    let modifiedBy = req.userData.id;
    customerKycPersonal['modifiedBy'] = modifiedBy

    let addressArray = []
    for (let i = 0; i < customerKycAddress.length; i++) {

        customerKycAddress[i]['modifiedBy'] = modifiedBy
        addressArray.push(customerKycAddress[i])
    }

    await sequelize.transaction(async (t) => {
        let personalId = await models.customerKycPersonalDetail.findOne({ where: { customerId: customerId }, transaction: t });

        await models.customer.update({ firstName: customerKycReview.firstName, lastName: customerKycReview.lastName, panCardNumber: customerKycReview.panCardNumber }, { where: { id: customerId }, transaction: t })

        await models.customerKycPersonalDetail.update(customerKycPersonal, { where: { customerId: customerId }, transaction: t });

        await models.customerKycAddressDetail.bulkCreate(addressArray, { updateOnDuplicate: ["addressType", "address", "stateId", "cityId", "pinCode", "addressProofTypeId", "addressProof", "addressProofNumber", "modifiedBy"] }, { transaction: t })

        await models.customerKyc.update({ modifiedBy, customerKycCurrentStage: "4" }, { where: { customerId }, transaction: t });

    })
    let { customerKycCurrentStage } = await models.customerKyc.findOne({ where: { customerId } });

    let KycClassification = await models.customerKycClassification.findOne({ where: { customerId: customerId } })
    let kycRating = await models.customerKyc.findOne({ where: { customerId: customerId } })

    if (!kycRating.isVerifiedByCce) {
        ratingStage = 1
    } else {
        ratingStage = 2
    }

    // console.log(KycClassification);
    return res.status(200).json({ message: `successful`, customerId, customerKycId, customerKycCurrentStage, KycClassification, ratingStage })

}


exports.appliedKyc = async (req, res, next) => {

    // let { roleName } = await models.role.findOne({ where: { id: req.userData.roleId[0] } })


    const { search, offset, pageSize } = paginationWithFromTo(
        req.query.search,
        req.query.from,
        req.query.to
    );
    let query = {};
    if (req.query.kycStatus) {
        query.kycStatus = sequelize.where(
            sequelize.cast(sequelize.col("customer.kyc_status"), "varchar"),
            {
                [Op.iLike]: req.query.kycStatus + "%",
            }
        );
    }
    if (req.query.cceStatus) {
        query.cceRating = sequelize.where(
            sequelize.cast(sequelize.col("customerKycClassification.kyc_status_from_cce"), "varchar"),
            {
                [Op.iLike]: req.query.cceStatus + "%",
            }
        );
    }
    if (req.query.kycStatusFromOperationalTeam) {
        query.kycStatusFromOperationalTeam = sequelize.where(
            sequelize.cast(sequelize.col("customerKycClassification.kyc_status_from_operational_team"), "varchar"),
            {
                [Op.iLike]: search + "%",
            }
        )
    }

    const searchQuery = {
        [Op.and]: [query, {
            [Op.or]: {
                "$customer.first_name$": { [Op.iLike]: search + "%" },
                "$customer.last_name$": { [Op.iLike]: search + "%" },
                "$customer.mobile_number$": { [Op.iLike]: search + "%" },
                "$customer.pan_card_number$": { [Op.iLike]: search + "%" },
                "$customer.customer_unique_id$": { [Op.iLike]: search + "%" },
                kyc_status: sequelize.where(
                    sequelize.cast(sequelize.col("customer.kyc_status"), "varchar"),
                    {
                        [Op.iLike]: search + "%",
                    }
                ),
                kyc_rating_cce: sequelize.where(
                    sequelize.cast(sequelize.col("customerKycClassification.kyc_status_from_cce"), "varchar"),
                    {
                        [Op.iLike]: search + "%",
                    }
                ),
                kyc_rating_bm: sequelize.where(
                    sequelize.cast(sequelize.col("customerKycClassification.kyc_status_from_operational_team"), "varchar"),
                    {
                        [Op.iLike]: search + "%",
                    }
                )
            }
        }],
        isActive: true,
        isKycSubmitted: true,

    }
    let internalBranchId = req.userData.internalBranchId
    let internalBranchWhere;

    let assignAppraiser;

    if (!check.isPermissionGive(req.permissionArray, VIEW_ALL_CUSTOMER)) {
        internalBranchWhere = { isActive: true, internalBranchId: internalBranchId }
        // if (req.userData.userTypeId == 7) {
        //     assignAppraiser = { appraiserId: req.userData.id }
        // }
    } else {
        internalBranchWhere = { isActive: true }
    }

    // if (req.userData.userTypeId == 6) {
    //     customerKycClassification = {
    //         kycStatusFromCce: { [Op.in]: ["approved", 'pending', 'incomplete', 'rejected'] },
    //     }
    // } else {
    //     customerKycClassification = {
    //         kycStatusFromCce: { [Op.in]: ['approved'] },
    //     }
    // }

    const includeArray = [
        {
            model: models.customerKycClassification,
            as: 'customerKycClassification',
            required: true,
            // where: customerKycClassification,
            attributes: ['kycStatusFromCce', 'reasonFromCce', 'kycStatusFromOperationalTeam', 'reasonFromOperationalTeam']
        },
        {
            model: models.customer,
            as: 'customer',
            attributes: ['firstName', 'lastName', 'panCardNumber', 'kycStatus', 'customerUniqueId'],
            where: internalBranchWhere,
        }
    ]

    let user = await models.user.findOne({ where: { id: req.userData.id } });

    // if (user.userTypeId == 5) {
    //     searchQuery.isVerifiedByCce = true
    // }

    let getAppliedKyc = await models.customerKyc.findAll({
        where: searchQuery,
        attributes: ['id', 'customerId', 'createdAt'],
        order: [["updatedAt", "DESC"]],
        offset: offset,
        limit: pageSize,
        include: includeArray
    })
    let count = await models.customerKyc.findAll({
        where: searchQuery,
        include: includeArray,
    });
    if (getAppliedKyc.length == 0) {
        return res.status(200).json({ data: [] })
    }
    return res.status(200).json({ data: getAppliedKyc, count: count.length })


}



exports.getReviewAndSubmit = async (req, res, next) => {

    let { customerId, customerKycId } = req.query;

    let customerKycReview = await models.customer.findOne({
        where: { id: customerId },
        attributes: ['id', 'firstName', 'lastName', 'panCardNumber', 'mobileNumber', 'panType', 'panImage'],
        include: [{
            model: models.customerKycPersonalDetail,
            as: 'customerKycPersonal',
            attributes: ['id', 'customerId', 'firstName', 'lastName', 'profileImage', 'dateOfBirth', 'alternateMobileNumber', 'panCardNumber', 'gender', 'age', 'martialStatus', 'occupationId', 'identityTypeId', 'identityProofNumber', 'identityProof', 'spouseName', 'signatureProof'],
            include: [{
                model: models.occupation,
                as: 'occupation'
            }, {
                model: models.identityType,
                as: 'identityType'
            }]
        }, {
            model: models.customerKycAddressDetail,
            as: 'customerKycAddress',
            attributes: ['id', 'customerKycId', 'customerId', 'addressType', 'address', 'stateId', 'cityId', 'pinCode', 'addressProofTypeId', 'addressProofNumber', 'addressProof'],
            include: [{
                model: models.state,
                as: 'state'
            }, {
                model: models.city,
                as: 'city'
            }, {
                model: models.addressProofType,
                as: 'addressProofType'
            }],
            order: [["id", "ASC"]]
        }]
    })

    return res.status(200).json({ customerKycReview, customerId, customerKycId })
}


