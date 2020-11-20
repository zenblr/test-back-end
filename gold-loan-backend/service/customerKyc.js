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

let customerKycAdd = async (req, createdBy, createdByCustomer, modifiedBy, modifiedByCustomer, isFromCustomerWebsite) => {

    let { firstName, lastName, customerId, profileImage, dateOfBirth, age, alternateMobileNumber, gender, martialStatus, occupationId, spouseName, signatureProof, identityProof, identityTypeId, identityProofNumber, address, panCardNumber, panType, panImage, moduleId } = req.body
    var date = dateOfBirth

    let status = await models.status.findOne({ where: { statusName: "confirm" } })
    if (check.isEmpty(status)) {
        return { status: 404, success: false, message: `Status confirm is not there in status table` }
    }

    let checkKycExist = await models.customerKyc.findOne({ where: { customerId: customerId } })
    if (checkKycExist) {
        return { status: 404, success: false, message: `You are Already Applied for Kyc!` }

    }
    let statusId = status.id
    let getCustomerInfo = await models.customer.findOne({
        where: { id: customerId, statusId },
        attributes: ['id', 'firstName', 'lastName', 'stateId', 'cityId', 'pinCode', 'panType', 'panImage'
            , 'panCardNumber', 'internalBranchId'],
    })
    if (check.isEmpty(getCustomerInfo)) {
        return { status: 404, success: false, message: `Your status is not confirm` }

    }
    if (panCardNumber) {
        let findPanCardNumber = await models.customer.findOne({
            where: {
                id: { [Op.not]: customerId },
                panCardNumber: panCardNumber
            }
        });
        if (!check.isEmpty(findPanCardNumber)) {
            return { status: 404, success: false, message: `Pan Card Number already exists!` }

        }
    }

    if (moduleId == 1) {


        let findIdentityNumber = await models.customerKycPersonalDetail.findOne({ where: { identityProofNumber: identityProofNumber } });
        if (!check.isEmpty(findIdentityNumber)) {
            return { status: 404, success: false, message: `Identity Proof Number already exists!` }
        }


        let kycInfo = await sequelize.transaction(async t => {

            await models.customer.update({ firstName, lastName, panCardNumber: panCardNumber, panType, panImage, modifiedBy, modifiedByCustomer }, { where: { id: customerId }, transaction: t })

            let customerKycAdd = await models.customerKyc.create({ currentKycModuleId: moduleId, isAppliedForKyc: true, customerKycCurrentStage: '4', customerId: getCustomerInfo.id, createdBy, modifiedBy, createdByCustomer, modifiedByCustomer, isKycSubmitted: true }, { transaction: t })

            let abcd = await models.customerKycPersonalDetail.create({
                customerId: getCustomerInfo.id,
                customerKycId: customerKycAdd.id,
                firstName: firstName,
                lastName: lastName,
                panCardNumber: panCardNumber,
                profileImage: profileImage,
                dateOfBirth: date,
                alternateMobileNumber: alternateMobileNumber,
                gender: gender,
                age: age,
                martialStatus: martialStatus,
                occupationId: occupationId,
                spouseName: spouseName,
                signatureProof: signatureProof,
                identityProof: identityProof,
                identityTypeId: identityTypeId,
                identityProofNumber: identityProofNumber,
                createdBy,
                modifiedBy,
                createdByCustomer,
                modifiedByCustomer
            }, { transaction: t });

            let addressArray = []
            for (let i = 0; i < address.length; i++) {

                address[i]['customerId'] = getCustomerInfo.id
                address[i]['customerKycId'] = customerKycAdd.id
                address[i]['createdBy'] = createdBy
                address[i]['modifiedBy'] = modifiedBy
                address[i]['createdByCustomer'] = createdByCustomer
                address[i]['modifiedByCustomer'] = modifiedByCustomer


                addressArray.push(address[i])
            }

            let data = await models.customerKycAddressDetail.bulkCreate(addressArray, { returning: true, transaction: t });

            await models.customerKycClassification.create({ customerId, customerKycId: customerKycAdd.id, kycStatusFromCce: "pending", cceId: createdBy, createdBy, modifiedBy, createdByCustomer, modifiedByCustomer }, { transaction: t })

            //for approved the status by default
            if (isFromCustomerWebsite && !check.isEmpty(getCustomerInfo.internalBranchId)) {
                await models.customerKyc.update(
                    { isVerifiedByCce: true, cceVerifiedBy: cceId, isKycSubmitted: true, isScrapKycSubmitted: true },
                    { where: { customerId: customerId }, transaction: t })

                await models.customerKycClassification.update({ kycRatingFromCce: 4, kycStatusFromCce: "approved", createdBy, modifiedBy, createdByCustomer, modifiedByCustomer, }, { where: { customerId }, transaction: t })
            }
            //for approved the status by default

            return customerKycAdd
        })

        return { status: 200, success: true, message: `Success`, customerId, customerKycId: kycInfo.id }

    } else {


        if (moduleId == 3 && address[0].addressProofNumber && address[0].addressProofTypeId == 2) {
            let findIdentityNumber = await models.customerKycPersonalDetail.findOne({ where: { identityProofNumber: address[0].addressProofNumber } });

            if (!check.isEmpty(findIdentityNumber)) {
                return { status: 404, success: false, message: `Address Proof Number already exists!` }
            }
        }
        //nikalna padega
        if (address.length > 1) {
            if (moduleId == 3 && address[1].addressProofNumber && address[0].addressProofTypeId == 2) {
                let findIdentityNumber = await models.customerKycPersonalDetail.findOne({ where: { identityProofNumber: address[1].addressProofNumber } });
                if (!check.isEmpty(findIdentityNumber)) {
                    return { status: 404, success: false, message: `Address Proof Number already exists!` }
                }
            }
        }
        //nikalna padega

        if (userType == "Individual") {
            if (address[0].addressProof.length == 0) {
                return { status: 404, success: false, message: `Address proof file must be required.` }
            }
        }
        if (userType == "Corporate") {
            if (address[0].addressProof.length == 0 || address[1].addressProof.length == 0) {
                return { status: 404, success: false, message: `Address proof file must be required.` }
            }
        }

        let findCustomerKyc = await models.customerKycAddressDetail.findOne({ where: { customerKycId: customerKycId } })

        if (!check.isEmpty(findCustomerKyc)) {
            return { status: 404, success: false, message: `This customer address details is already filled.` }
        }
        let addressArray = []
        for (let i = 0; i < address.length; i++) {

            address[i]['customerId'] = customerId
            address[i]['customerKycId'] = customerKycId
            address[i]['createdBy'] = createdBy
            address[i]['modifiedBy'] = modifiedBy
            address[i]['createdByCustomer'] = createdByCustomer
            address[i]['modifiedByCustomer'] = modifiedByCustomer
            addressArray.push(address[i])
        }

        if (userType == "Corporate") {
            let customerEmail = await models.customer.findOne({ where: { email } });

            let customerOrganizationEmail = await models.customerKycOrganizationDetail.findOne({ where: { email } });

            if (!check.isEmpty(customerEmail) || !check.isEmpty(customerOrganizationEmail)) {
                return { status: 404, success: false, message: `your email id is already exists.` }
            }

            if (alternateEmail) {

                if (email == alternateEmail) {
                    return { status: 404, success: false, message: `your email id and alternate email id is same.` }
                }

                let customerAlternateEmail = await models.customer.findOne({ where: { email: alternateEmail } });

                let customerOrganizationAlternateEmail = await models.customerKycOrganizationDetail.findOne({ where: { alternateEmail } });

                let customerOrganizationEmailVerify = await models.customerKycOrganizationDetail.findOne({ where: { email: alternateEmail } });

                if (!check.isEmpty(customerAlternateEmail) || !check.isEmpty(customerOrganizationAlternateEmail) || !check.isEmpty(customerOrganizationEmailVerify)) {
                    return { status: 404, success: false, message: `your alternate email id is already exists.` }
                }
            }

            if (landLineNumber) {
                let customerLandline = await models.customerKycOrganizationDetail.findOne({ where: { landLineNumber } });

                if (!check.isEmpty(customerLandline)) {
                    return { status: 404, success: false, message: `your land line number is already exists.` }
                }
            }
        }

        let customerKycId = await sequelize.transaction(async t => {
            let customerKycAdd = await models.customerKyc.create({ isAppliedForKyc: true, customerId: getCustomerInfo.id, createdBy, modifiedBy, createdByCustomer, modifiedByCustomer, customerKycCurrentStage: "2", currentKycModuleId: moduleId }, { transaction: t })


            await models.customer.update({ firstName: firstName, lastName: lastName, panCardNumber: panCardNumber, panType: panType, panImage: panImage, organizationTypeId, dateOfIncorporation, userType: userType, moduleId: moduleId, modifiedBy, modifiedByCustomer }, { where: { id: getCustomerInfo.id }, transaction: t })

            await models.customerKycAddressDetail.bulkCreate(addressArray, { returning: true, transaction: t });

            let createCustomerKyc
            let createOrganizationDetail
            if (userType == "Corporate") {
                createOrganizationDetail = await models.customerKycOrganizationDetail.create({
                    customerId: getCustomerInfo.id,
                    customerKycId: customerKycAdd.id,
                    email: email,
                    alternateEmail: alternateEmail,
                    landLineNumber: landLineNumber,
                    gstinNumber: gstinNumber,
                    cinNumber: cinNumber,
                    constitutionsDeed: constitutionsDeed,
                    gstCertificate: gstCertificate,
                    createdBy,
                    modifiedBy,
                    createdByCustomer,
                    modifiedByCustomer
                }, { transaction: t });
            } else {
                createCustomerKyc = await models.customerKycPersonalDetail.create({
                    customerId: getCustomerInfo.id,
                    customerKycId: customerKycAdd.id,
                    firstName: firstName,
                    lastName: lastName,
                    panCardNumber: panCardNumber,
                    createdBy,
                    modifiedBy,
                    createdByCustomer,
                    modifiedByCustomer,
                    profileImage: profileImage,
                    dateOfBirth: dateOfBirth,
                    alternateMobileNumber: alternateMobileNumber,
                    gender: gender,
                    age: age,
                    martialStatus: martialStatus,
                    occupationId: occupationId,
                    spouseName: spouseName,
                    signatureProof: signatureProof,
                }, { transaction: t });
            }
            return { customerKycAdd }
        })

        return { status: 200, success: true, message: `Success`, customerId, customerKycId: customerKycAdd.id }
    }

}

let customerKycEdit = async (req, createdBy, modifiedBy, createdByCustomer, modifiedByCustomer, isFromCustomerWebsite) => {


    let { customerId, customerKycId, customerKycPersonal, customerKycAddress, customerKycBasicDetails, customerOrganizationDetail, moduleId, userType } = req.body;

    let getCustomerInfo = await models.customer.findOne({
        where: { id: customerId, statusId },
        attributes: ['id', 'firstName', 'lastName', 'stateId', 'cityId', 'pinCode', 'panType', 'panImage'
            , 'panCardNumber', 'internalBranchId'],
    })

    //change
    if (moduleId == 1) {
        let findCustomerKyc = await models.customer.findOne({
            where: { id: customerId },
            include: [{
                model: models.customerKyc,
                as: 'customerKyc',
                attributes: ['currentKycModuleId']
            }]
        })

        if (findCustomerKyc.customerKyc.currentKycModuleId == 3 && findCustomerKyc.scrapKycStatus != 'approved') {
            return { status: 404, success: false, message: `Your scrap kyc process pending.` }
        }
    }
    //change

    if (moduleId == 1) {
        let findIdentityNumber = await models.customerKycPersonalDetail.findOne({ where: { customerId: { [Op.not]: customerId }, identityProofNumber: customerKycPersonal.identityProofNumber } });
        if (!check.isEmpty(findIdentityNumber)) {
            return { status: 404, success: false, message: `Identity Proof Number already exists!` }
        }
    }

    if (moduleId == 3 && customerKycAddress[0].addressProofNumber && customerKycAddress[0].addressProofTypeId == 2) {
        let findIdentityNumber = await models.customerKycPersonalDetail.findOne({ where: { identityProofNumber: customerKycAddress[0].addressProofNumber, customerId: { [Op.not]: customerId } } });
        console.log(customerKycAddress[0].addressProofNumber, findIdentityNumber)

        if (!check.isEmpty(findIdentityNumber)) {
            return { status: 404, success: false, message: `Address Proof Number already exists!` }
        }
    }

    if (customerKycAddress.length > 1) {
        if (moduleId == 3 && customerKycAddress[1].addressProofNumber && customerKycAddress[0].addressProofTypeId == 2) {
            let findIdentityNumber = await models.customerKycPersonalDetail.findOne({ where: { identityProofNumber: customerKycAddress[1].addressProofNumber, customerId: { [Op.not]: customerId } } });
            if (!check.isEmpty(findIdentityNumber)) {
                return { status: 404, success: false, message: `Address Proof Number already exists!` }
            }
        }
    }

    if (customerKycBasicDetails.panCardNumber) {
        let findPanCardNumber = await models.customer.findOne({
            where: {
                id: { [Op.not]: customerId },
                panCardNumber: { [Op.iLike]: customerKycBasicDetails.panCardNumber },
                isActive: true
            }
        });
        if (!check.isEmpty(findPanCardNumber)) {
            return { status: 404, success: false, message: `Pan Card Number already exists!` }
        }
    }
    if (customerKycPersonal) {
        customerKycPersonal['modifiedBy'] = modifiedBy
        customerKycPersonal['modifiedByCustomer'] = modifiedByCustomer
    }
    if (customerOrganizationDetail) {
        customerOrganizationDetail['modifiedBy'] = modifiedBy
        customerOrganizationDetail['modifiedByCustomer'] = modifiedByCustomer
    }

    let addressArray = []
    for (let i = 0; i < customerKycAddress.length; i++) {

        customerKycAddress[i]['modifiedBy'] = modifiedBy
        customerKycAddress[i]['modifiedByCustomer'] = modifiedByCustomer
        addressArray.push(customerKycAddress[i]);

    }

    if (moduleId == 3 && userType == "Individual") {
        if (customerKycAddress[0].addressProofTypeId == 2) {
            customerKycPersonal['identityTypeId'] = 5;
            customerKycPersonal['identityProof'] = customerKycAddress[0].addressProof;
            customerKycPersonal['identityProofNumber'] = customerKycAddress[0].addressProofNumber;
        }
    }

    await sequelize.transaction(async (t) => {

        //for mobile
        if (req.useragent.isMobile) {
            let checkClassification = await models.customerKycClassification.findOne({ where: { customerId: customerId }, transaction: t })

            //change
            await models.customerKyc.update({ currentKycModuleId: moduleId, modifiedBy, modifiedByCustomer }, { where: { id: customerKycId }, transaction: t })
            //change

            if (check.isEmpty(checkClassification)) {
                await models.customerKycClassification.create({ customerId, customerKycId: customerKycId, kycStatusFromCce: "pending", cceId: modifiedBy, createdBy, modifiedBy, modifiedByCustomer, createdByCustomer }, { transaction: t })
            }
            await models.customerKyc.update(
                { cceVerifiedBy: modifiedBy, isKycSubmitted: true, modifiedBy, modifiedByCustomer },
                { where: { customerId: customerId }, transaction: t })
        }
        //for mobile


        let personalId = await models.customerKycPersonalDetail.findOne({ where: { customerId: customerId }, transaction: t });

        await models.customer.update({ firstName: customerKycBasicDetails.firstName, lastName: customerKycBasicDetails.lastName, panCardNumber: customerKycBasicDetails.panCardNumber, panType: customerKycBasicDetails.panType, panImage: customerKycBasicDetails.panImage, userType: customerKycBasicDetails.userType, organizationTypeId: customerKycBasicDetails.organizationTypeId, dateOfIncorporation: customerKycBasicDetails.dateOfIncorporation, modifiedBy, modifiedByCustomer }, { where: { id: customerId }, transaction: t })

        if (moduleId == 1) {
            await models.customerKycPersonalDetail.update(customerKycPersonal, { where: { customerId: customerId }, transaction: t });

            await models.customerKycPersonalDetail.update(
                {
                    firstName: customerKycBasicDetails.firstName,
                    lastName: customerKycBasicDetails.lastName,
                    panCardNumber: customerKycBasicDetails.panCardNumber
                }
                , { where: { customerId: customerId }, transaction: t });

            await models.customer.update(
                {
                    firstName: customerKycBasicDetails.firstName,
                    lastName: customerKycBasicDetails.lastName,
                    panCardNumber: customerKycBasicDetails.panCardNumber,
                    panType: customerKycBasicDetails.panType,
                    panImage: customerKycBasicDetails.panImage
                }
                , { where: { id: customerId }, transaction: t });

        }
        if (moduleId == 3) {
            if (userType == "Individual") {
                await models.customerKycPersonalDetail.update(customerKycPersonal, { where: { customerId: customerId }, transaction: t });
            } else {
                await models.customerKycOrganizationDetail.update(customerOrganizationDetail, { where: { customerId: customerId }, transaction: t })
            }
        }

        await models.customerKycAddressDetail.bulkCreate(addressArray, { updateOnDuplicate: ["addressType", "address", "landmark", "stateId", "cityId", "pinCode", "addressProofTypeId", "addressProof", "addressProofNumber", "modifiedBy"] }, { transaction: t })

        await models.customerKyc.update({ modifiedBy, modifiedByCustomer, customerKycCurrentStage: "4" }, { where: { customerId }, transaction: t });

        //for approved the status by default
        if (isFromCustomerWebsite && !check.isEmpty(getCustomerInfo.internalBranchId)) {
            await models.customerKyc.update(
                { isVerifiedByCce: true, cceVerifiedBy: cceId, isKycSubmitted: true, isScrapKycSubmitted: true },
                { where: { customerId: customerId }, transaction: t })

            await models.customerKycClassification.update({ kycRatingFromCce: 4, kycStatusFromCce: "approved", createdBy, modifiedBy, createdByCustomer, modifiedByCustomer, }, { where: { customerId }, transaction: t })
        }
        //for approved the status by default

    })
    let { customerKycCurrentStage } = await models.customerKyc.findOne({ where: { customerId } });

    let KycClassification = await models.customerKycClassification.findOne({ where: { customerId: customerId } });
    let kycRating = await models.customerKyc.findOne({ where: { customerId: customerId } })

    let ratingStage = 1;
    if (moduleId == 1 && KycClassification && (KycClassification.kycStatusFromCce == "pending" || !KycClassification.kycStatusFromCce)) {
        ratingStage = 1
    } else if (moduleId == 1 && KycClassification && KycClassification.kycStatusFromCce == "approved") {
        ratingStage = 2
    } else if (moduleId == 3 && KycClassification && (KycClassification.scrapKycStatusFromCce == "pending" || !KycClassification.scrapKycStatusFromCce)) {
        ratingStage = 1
    } else if (moduleId == 3 && KycClassification && KycClassification.scrapKycStatusFromCce == "approved") {
        ratingStage = 2
    }

    if (!KycClassification) {
        ratingStage = 1
    }

    return { status: 200, success: true, message: `Success`, customerId, customerKycId, customerKycCurrentStage, KycClassification, ratingStage, moduleId, userType }


}


module.exports = {
    customerKycAdd: customerKycAdd,
    customerKycEdit: customerKycEdit
}