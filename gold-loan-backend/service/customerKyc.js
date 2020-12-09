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

            await models.customer.update({
                firstName, lastName, panCardNumber: panCardNumber, panType, panImage, modifiedBy, modifiedByCustomer,
                //dob changes
                dateOfBirth: date,
                gender: gender,
                age: age,
                //dob changes
            }, { where: { id: customerId }, transaction: t })

            let customerKycAdd = await models.customerKyc.create({ currentKycModuleId: moduleId, isAppliedForKyc: true, customerKycCurrentStage: '4', customerId: getCustomerInfo.id, createdBy, modifiedBy, createdByCustomer, modifiedByCustomer }, { transaction: t })

            let abcd = await models.customerKycPersonalDetail.create({
                customerId: getCustomerInfo.id,
                customerKycId: customerKycAdd.id,
                firstName: firstName,
                lastName: lastName,
                panCardNumber: panCardNumber,
                profileImage: profileImage,
                alternateMobileNumber: alternateMobileNumber,
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
            //for create appraiser Request
            if (isFromCustomerWebsite) {
                let appraiserRequest = await models.appraiserRequest.create({ customerId, moduleId, createdBy, modifiedBy }, { transaction: t })
            }
            //for create appraiser Request

            //for approved the status by default
            if (isFromCustomerWebsite && getCustomerInfo.internalBranchId != null) {
                await models.customerKyc.update(
                    { isVerifiedByCce: true, modifiedByCustomer, isKycSubmitted: true, isScrapKycSubmitted: true },
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
            let customerKycAdd = await models.customerKyc.create({
                isAppliedForKyc: true, customerId: getCustomerInfo.id, createdBy, modifiedBy, createdByCustomer, modifiedByCustomer, customerKycCurrentStage: "2", currentKycModuleId: moduleId,
                //dob changes
                dateOfBirth: dateOfBirth,
                gender: gender,
                age: age,
                //dob changes
            }, { transaction: t })


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
                    alternateMobileNumber: alternateMobileNumber,
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
        where: { id: customerId, statusId: 1 },
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

        let checkClassification = await models.customerKycClassification.findOne({ where: { customerId: customerId }, transaction: t })
        //for mobile
        if (req.useragent.isMobile && !isFromCustomerWebsite) {

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

        //for customer kyc website
        if (isFromCustomerWebsite) {
            await models.customerKyc.update({ currentKycModuleId: moduleId, modifiedBy, modifiedByCustomer }, { where: { id: customerKycId }, transaction: t })

            if (check.isEmpty(checkClassification)) {
                await models.customerKycClassification.create({ customerId, customerKycId: customerKycId, kycStatusFromCce: "pending", cceId: modifiedBy, createdBy, modifiedBy, modifiedByCustomer, createdByCustomer }, { transaction: t })
            }

            if (getCustomerInfo.internalBranchId != null) {
                await models.customerKyc.update(
                    { isVerifiedByCce: true, modifiedByCustomer, isKycSubmitted: true, isScrapKycSubmitted: true },
                    { where: { customerId: customerId }, transaction: t })

                await models.customerKycClassification.update({ kycRatingFromCce: 4, kycStatusFromCce: "approved", createdBy, modifiedBy, createdByCustomer, modifiedByCustomer, }, { where: { customerId }, transaction: t })
            }
        }
        //for customer kyc website


        let personalId = await models.customerKycPersonalDetail.findOne({ where: { customerId: customerId }, transaction: t });

        await models.customer.update({
            firstName: customerKycBasicDetails.firstName, lastName: customerKycBasicDetails.lastName, panCardNumber: customerKycBasicDetails.panCardNumber, panType: customerKycBasicDetails.panType, panImage: customerKycBasicDetails.panImage, userType: customerKycBasicDetails.userType, organizationTypeId: customerKycBasicDetails.organizationTypeId, dateOfIncorporation: customerKycBasicDetails.dateOfIncorporation, modifiedBy, modifiedByCustomer,
            //dob changes
            age: customerKycPersonal.age,
            gender: customerKycPersonal.gender,
            dateOfBirth: customerKycPersonal.dateOfBirth
            //dob changes

        }, { where: { id: customerId }, transaction: t })

        //dob changes
        delete customerKycPersonal.age;
        delete customerKycPersonal.gender;
        delete customerKycPersonal.dateOfBirth;
        //dob changes

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
        if (isFromCustomerWebsite && getCustomerInfo.internalBranchId != null) {
            await models.customerKyc.update(
                { isVerifiedByCce: true, modifiedByCustomer, isKycSubmitted: true, isScrapKycSubmitted: true },
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

let getKycInfo = async (customerId) => {

    let appraiserRequestData = await models.appraiserRequest.findAll({
        where: {
            customerId: customerId
        },
        order: [["updatedAt", "DESC"]]
    })
    let customerKycReview = await models.customer.findOne({
        where: { id: customerId },
        attributes: ['id', 'firstName', 'lastName', 'panCardNumber', 'mobileNumber', 'panType', 'panImage', 'moduleId', 'userType', 'dateOfIncorporation', 'kycStatus', 'scrapKycStatus', 'gender', 'age', 'dateOfBirth'],
        include: [{
            model: models.customerKycPersonalDetail,
            as: 'customerKycPersonal',
            attributes: ['id', 'customerId', 'firstName', 'lastName', 'profileImage', 'alternateMobileNumber', 'panCardNumber', 'martialStatus', 'occupationId', 'identityTypeId', 'identityProofNumber', 'identityProof', 'spouseName', 'signatureProof'],
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
            attributes: ['id', 'customerKycId', 'customerId', 'addressType', 'address', 'stateId', 'cityId', 'pinCode', 'addressProofTypeId', 'addressProofNumber', 'addressProof', 'landmark'],
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
        }, {
            model: models.customerKycOrganizationDetail,
            as: "organizationDetail",
            attributes: ['customerId', 'customerKycId', 'email', 'alternateEmail', 'landLineNumber', 'gstinNumber', 'cinNumber', 'constitutionsDeed', 'gstCertificate']
        },
        {
            model: models.organizationType,
            as: "organizationType",
            attributes: ['id', 'organizationType']
        },
        {
            model: models.customerKyc,
            as: 'customerKyc',
            attributes: ['id', 'currentKycModuleId']
        },
        {
            model: models.customerKycClassification,
            as: 'customerKycClassification'
        }
        ]
    })

    //dob changes
    if (customerKycReview != null && customerKycReview.customerKycPersonal != null) {
        customerKycReview.dataValues.customerKycPersonal.dataValues.age = customerKycReview.age
        customerKycReview.dataValues.customerKycPersonal.dataValues.gender = customerKycReview.gender
        customerKycReview.dataValues.customerKycPersonal.dataValues.dateOfBirth = customerKycReview.dateOfBirth
    }
    //dob changes

    let userType = null;
    let moduleId = null;
    if (!check.isEmpty(customerKycReview.customerKyc)) {
        moduleId = customerKycReview.customerKyc.currentKycModuleId;
    }
    if (moduleId == 3) {

        userType = customerKycReview.userType;
    }
    let customerKycId = null

    if (!check.isEmpty(customerKycReview.customerKyc)) {
        customerKycId = customerKycReview.customerKyc.id
    }
    return { status: 200, success: true, customerKycReview, moduleId, userType, customerId, customerKycId }

}

let updateCompleteKycModule = async (oldCompleteKycPoint, moduleId) => {
    let whereCondition
    if (moduleId == 3) {
        whereCondition = { id: { [Op.not]: [1, 4] } }
    } else if (moduleId == 1) {
        whereCondition = { id: { [Op.not]: [4] } }
    } else if (moduleId == 4) {
        whereCondition = { id: { [Op.in]: [4, 2] } }
    } else if (moduleId == 2) {
        whereCondition = { id: { [Op.in]: [2] } }
    }

    let kycCompletePoint = oldCompleteKycPoint
    let allModulePoint = await models.module.findAll({
        where: whereCondition
    })
    for (let i = 0; i < allModulePoint.length; i++) {
        const element = allModulePoint[i].modulePoint;
        kycCompletePoint = kycCompletePoint | element
    }
    return kycCompletePoint
}

let updateCustomerUniqueId = async (checkCustomerUniqueId) => {
    let customerUniqueId = checkCustomerUniqueId
    if (check.isEmpty(checkUniqueId.customerUniqueId)) {
        customerUniqueId = uniqid.time().toUpperCase();
    } else {
        customerUniqueId = customerUniqueId
    }

    return customerUniqueId
}

let kycBasicDetails = async (req) => {
    let { mobileNumber, moduleId } = req.body
    let numberExistInCustomer = await models.customer.findOne({
        where: { mobileNumber },
        include: {
            model: models.customerKyc,
            as: 'customerKyc'
        }
    });
    if (check.isEmpty(numberExistInCustomer)) {
        // return res.status(404).json({ message: "Your Mobile number does not exist, please add lead first" });
        return { status: 404, success: false, message: `Your Mobile number does not exist, please add lead first` }
    }

    if (!check.isEmpty(numberExistInCustomer.customerKyc)) {
        let currentModuleId = numberExistInCustomer.customerKyc.currentKycModuleId;

        if (currentModuleId != moduleId) {
            if (moduleId == 3) {
                if (numberExistInCustomer.kycStatus != "approved") {
                    // return res.status(404).json({ message: "kindly complete loan kyc" });
                    return { status: 404, success: false, message: `kindly complete loan kyc` }
                }
            }
            if (moduleId == 1) {
                if (numberExistInCustomer.scrapKycStatus != "approved") {
                    // return res.status(404).json({ message: "kindly complete scrap kyc" });
                    return { status: 404, success: false, message: `kindly complete scrap kyc` }
                } else {
                    await models.customerKyc.update({ currentKycModuleId: moduleId }, { where: { id: numberExistInCustomer.customerKyc.id } })
                }
            }

        }

    }

    let status = await models.status.findOne({ where: { statusName: "confirm" } })
    if (check.isEmpty(status)) {
        // return res.status(404).json({ message: "Status confirm is not there in status table" });
        return { status: 404, success: false, message: `Status confirm is not there in status table` }
    }
    let statusId = status.id

    let checkStatusCustomer = await models.customer.findOne({
        where: { statusId, id: numberExistInCustomer.id },
        attributes: ['firstName', 'lastName', 'panCardNumber', 'panType', 'panCardNumber', 'panImage', 'userType', 'moduleId', 'organizationTypeId', 'dateOfIncorporation', 'scrapKycStatus', 'dateOfBirth', 'gender', 'age'],
        include: [{
            model: models.organizationType,
            as: "organizationType",
            attributes: ['id', 'organizationType']
        },
        {
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
        },
        {
            model: models.customerKycOrganizationDetail,
            as: "organizationDetail",
            attributes: ['customerId', 'customerKycId', 'email', 'alternateEmail', 'landLineNumber', 'gstinNumber', 'cinNumber', 'constitutionsDeed', 'gstCertificate']
        },
        {
            model: models.customerKycPersonalDetail,
            as: 'customerKycPersonal',
            attributes: ['id', 'customerId', 'firstName', 'lastName', 'profileImage', 'alternateMobileNumber', 'panCardNumber', 'martialStatus', 'occupationId', 'identityTypeId', 'identityProofNumber', 'identityProof', 'spouseName', 'signatureProof'],
            include: [{
                model: models.occupation,
                as: 'occupation'
            }, {
                model: models.identityType,
                as: 'identityType'
            }]
        }
        ]
    })

    //dob changes
    if (checkStatusCustomer != null && checkStatusCustomer.customerKycPersonal != null) {
        checkStatusCustomer.dataValues.customerKycPersonal.dataValues.age = checkStatusCustomer.age
        checkStatusCustomer.dataValues.customerKycPersonal.dataValues.gender = checkStatusCustomer.gender
        checkStatusCustomer.dataValues.customerKycPersonal.dataValues.dateOfBirth = checkStatusCustomer.dateOfBirth
    }
    //dob changes

    //check kyc status  scrap == approve 
    // check user type == corporate == you cant apply loan == due to corporeate kyc

    if (checkStatusCustomer.scrapKycStatus == "approved") {
        if (checkStatusCustomer.userType == "Corporate") {
            // return res.status(400).json({ message: "Please create new customer since you have completed Corporate kyc" });
            return { status: 404, success: false, message: `Please create new customer since you have completed Corporate kyc` }
        }
    }

    if (check.isEmpty(checkStatusCustomer)) {
        // return res.status(400).json({ message: "Please proceed after confirm your lead stage status" });
        return { status: 404, success: false, message: `Please proceed after confirm your lead stage status` }
    }
    // return res.status(200).json({ message: "Success", customerInfo: checkStatusCustomer });
    return { status: 200, message: `Success`, success: true, customerInfo: checkStatusCustomer }

}

let submitKycInfo = async (req) => {
    let { firstName, lastName, mobileNumber, panCardNumber, panType, panImage, moduleId, organizationTypeId, dateOfIncorporation, userType } = req.body;

    console.log(userType);

    let status = await models.status.findOne({ where: { statusName: "confirm" } })
    if (check.isEmpty(status)) {
        // return res.status(404).json({ message: "Status confirm is not there in status table" });
        return { status: 404, success: false, message: `Status confirm is not there in status table` }
    }
    let statusId = status.id
    let getCustomerInfo = await models.customer.findOne({
        where: { mobileNumber: mobileNumber, statusId },
        attributes: ['id', 'firstName', 'lastName', 'stateId', 'cityId', 'pinCode', 'panType', 'panImage'],
    })
    if (panCardNumber) {
        let findPanCardNumber = await models.customer.findOne({
            where: {
                id: { [Op.not]: getCustomerInfo.id },
                panCardNumber: { [Op.iLike]: panCardNumber },
                isActive: true
            }
        });
        if (!check.isEmpty(findPanCardNumber)) {
            // return res.status(400).json({ message: "Pan Card Number already exists! " })
            return { status: 404, success: false, message: `Pan Card Number already exists!` }

        }
    }


    if (check.isEmpty(getCustomerInfo)) {
        // return res.status(404).json({ message: "Your status is not confirm" });
        return { status: 404, success: false, message: `Your status is not confirm` }

    }
    let findCustomerKyc = await models.customerKyc.findOne({ where: { customerId: getCustomerInfo.id, isKycSubmitted: true } });

    if (findCustomerKyc && findCustomerKyc.isKycSubmitted == true && moduleId == 1) {
        // return res.status(404).json({ message: "This customer Kyc is already submitted." });
        return { status: 404, success: false, message: `This customer Kyc is already submitted.` }

    }

    let findCustomerScrapKyc = await models.customerKyc.findOne({ where: { customerId: getCustomerInfo.id, isScrapKycSubmitted: true } });
    if (findCustomerScrapKyc && findCustomerScrapKyc.isScrapKycSubmitted == true && moduleId == 3) {
        // return res.status(404).json({ message: "This customer Kyc is already submitted." });
        return { status: 404, success: false, message: `This customer Kyc is already submitted.` }

    }

    let KycStage = await models.customerKyc.findOne({ where: { customerId: getCustomerInfo.id } })

    if (!check.isEmpty(KycStage)) {
        let name
        if (KycStage.customerKycCurrentStage == "2") {

            let { id, stateId, cityId, pinCode } = await models.customer.findOne({ where: { id: KycStage.customerId, isActive: true } });

            // return res.status(200).json({
            //     customerId: KycStage.customerId,
            //     customerKycId: KycStage.id,
            //     customerKycCurrentStage: KycStage.customerKycCurrentStage,
            //     stateId: stateId,
            //     cityId: cityId,
            //     pinCode: pinCode,
            //     moduleId: moduleId,
            //     userType: userType
            // })

            return {
                status: 200, success: true,
                data: {
                    customerId: KycStage.customerId,
                    customerKycId: KycStage.id,
                    customerKycCurrentStage: KycStage.customerKycCurrentStage,
                    stateId: stateId,
                    cityId: cityId,
                    pinCode: pinCode,
                    moduleId: moduleId,
                    userType: userType
                }
            }


        } else if (KycStage.customerKycCurrentStage == "3") {

            if (moduleId == 1) {
                let { firstName, lastName } = await models.customerKycPersonalDetail.findOne({ where: { customerId: KycStage.customerId } })
                name = `${firstName} ${lastName}`;

                // return res.status(200).json({
                //     customerId: KycStage.customerId,
                //     customerKycId: KycStage.id,
                //     name,
                //     customerKycCurrentStage: KycStage.customerKycCurrentStage,
                //     moduleId: moduleId,
                //     userType: userType,
                // })
                return {
                    status: 200,
                    success: true,
                    data: {
                        customerId: KycStage.customerId,
                        customerKycId: KycStage.id,
                        name,
                        customerKycCurrentStage: KycStage.customerKycCurrentStage,
                        moduleId: moduleId,
                        userType: userType
                    }
                }

            } else if (moduleId == 3) {
                if (userType == "Individual") {
                    let { firstName, lastName } = await models.customerKycPersonalDetail.findOne({ where: { customerId: KycStage.customerId } })
                    name = `${firstName} ${lastName}`;

                    // return res.status(200).json({
                    //     customerId: KycStage.customerId,
                    //     customerKycId: KycStage.id,
                    //     name,
                    //     customerKycCurrentStage: KycStage.customerKycCurrentStage,
                    //     moduleId: moduleId,
                    //     userType: userType

                    // })

                    return {
                        status: 200,
                        success: true,
                        data: {
                            customerId: KycStage.customerId,
                            customerKycId: KycStage.id,
                            name,
                            customerKycCurrentStage: KycStage.customerKycCurrentStage,
                            moduleId: moduleId,
                            userType: userType
                        }
                    }

                } else {
                    // return res.status(200).json({
                    //     customerId: KycStage.customerId,
                    //     customerKycId: KycStage.id,
                    //     customerKycCurrentStage: KycStage.customerKycCurrentStage,
                    //     moduleId: moduleId,
                    //     userType: userType
                    // })
                    return {
                        status: 200,
                        success: true,
                        data: {
                            customerId: KycStage.customerId,
                            customerKycId: KycStage.id,
                            customerKycCurrentStage: KycStage.customerKycCurrentStage,
                            moduleId: moduleId,
                            userType: userType
                        }
                    }
                }
            }

        } else if (KycStage.customerKycCurrentStage == "4") {
            let customerKycReview = await models.customer.findOne({
                where: { id: KycStage.customerId },
                attributes: ['id', 'firstName', 'lastName', 'panCardNumber', 'mobileNumber', 'panType', 'panImage', 'userType', 'organizationTypeId', 'dateOfIncorporation', 'dateOfBirth', 'gender', 'age'],
                include: [{
                    model: models.customerKycPersonalDetail,
                    as: 'customerKycPersonal',
                    required: false,
                    attributes: ['id', 'customerId', 'firstName', 'lastName', 'profileImage', 'alternateMobileNumber', 'panCardNumber', 'martialStatus', 'occupationId', 'identityTypeId', 'identityProofNumber', 'identityProof', 'spouseName', 'signatureProof'],
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
                },
                {
                    model: models.customerKycOrganizationDetail,
                    as: 'organizationDetail',
                    required: false,
                    attributes: ['customerId', 'customerKycId', 'email', 'alternateEmail', 'landLineNumber', 'gstinNumber', 'cinNumber', 'constitutionsDeed', 'gstCertificate']
                },
                {
                    model: models.organizationType,
                    as: "organizationType",
                    attributes: ['id', 'organizationType']
                },
                ]
            })

            //dob changes
            if (customerKycReview != null && customerKycReview.customerKycPersonal != null) {
                customerKycReview.dataValues.customerKycPersonal.dataValues.age = customerKycReview.age
                customerKycReview.dataValues.customerKycPersonal.dataValues.gender = customerKycReview.gender
                customerKycReview.dataValues.customerKycPersonal.dataValues.dateOfBirth = customerKycReview.dateOfBirth
            }
            //dob changes

            // return res.status(200).json({
            //     customerId: KycStage.customerId,
            //     customerKycId: KycStage.id,
            //     customerKycCurrentStage: KycStage.customerKycCurrentStage,
            //     customerKycReview,
            //     moduleId: moduleId,
            //     userType: userType

            // })

            return {
                status: 200,
                success: true,
                data: {
                    customerId: KycStage.customerId,
                    customerKycId: KycStage.id,
                    customerKycCurrentStage: KycStage.customerKycCurrentStage,
                    customerKycReview,
                    moduleId: moduleId,
                    userType: userType
                }
            }
        }
    }


    let createdBy = req.userData.id;
    let modifiedBy = req.userData.id;
    let kyc = await sequelize.transaction(async (t) => {

        let customerKycAdd = await models.customerKyc.create({ isAppliedForKyc: true, customerId: getCustomerInfo.id, createdBy, modifiedBy, customerKycCurrentStage: "2", currentKycModuleId: moduleId }, { transaction: t })


        await models.customer.update({ firstName: firstName, lastName: lastName, panCardNumber: panCardNumber, panType: panType, panImage: panImage, organizationTypeId, dateOfIncorporation, userType: userType, moduleId: moduleId }, { where: { id: getCustomerInfo.id }, transaction: t })
        let createCustomerKyc
        let createOrganizationDetail
        if (moduleId == 3) {
            if (userType == "Corporate") {
                createOrganizationDetail = await models.customerKycOrganizationDetail.create({
                    customerId: getCustomerInfo.id,
                    customerKycId: customerKycAdd.id,
                    createdBy,
                    modifiedBy,
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
                }, { transaction: t });
            }

        }
        if (moduleId == 1) {
            createCustomerKyc = await models.customerKycPersonalDetail.create({
                customerId: getCustomerInfo.id,
                customerKycId: customerKycAdd.id,
                firstName: firstName,
                lastName: lastName,
                panCardNumber: panCardNumber,
                createdBy,
                modifiedBy,
            }, { transaction: t });
        }

        return customerKycAdd
    })

    // return res.status(200).json({
    //     customerId: getCustomerInfo.id,
    //     customerKycId: kyc.id,
    //     customerKycCurrentStage: kyc.customerKycCurrentStage,
    //     stateId: getCustomerInfo.stateId,
    //     cityId: getCustomerInfo.cityId,
    //     pinCode: getCustomerInfo.pinCode,
    //     moduleId: moduleId,
    //     userType: userType

    // })

    return {
        status: 200,
        success: true,
        data: {
            customerId: getCustomerInfo.id,
            customerKycId: kyc.id,
            customerKycCurrentStage: kyc.customerKycCurrentStage,
            stateId: getCustomerInfo.stateId,
            cityId: getCustomerInfo.cityId,
            pinCode: getCustomerInfo.pinCode,
            moduleId: moduleId,
            userType: userType
        }
    }
}

let kycAddressDeatil = async (req) => {

    let { customerId, customerKycId, identityProof, identityTypeId, identityProofNumber, address, moduleId, userType } = req.body
    let createdBy = req.userData.id;
    let modifiedBy = req.userData.id;

    let name;
    let customerDetail
    if (moduleId == 1) {
        if (identityProof.length == 0) {
            // return res.status(404).json({ message: "Identity proof file must be required." });
            return { status: 404, success: false, message: `Identity proof file must be required.` }
        }
        let findIdentityNumber = await models.customerKycPersonalDetail.findOne({ where: { identityProofNumber: identityProofNumber } });
        if (!check.isEmpty(findIdentityNumber)) {
            // return res.status(400).json({ message: "Identity Proof Number already exists! " })
            return { status: 404, success: false, message: `Identity Proof Number already exists!` }

        }
        customerDetail = await models.customerKycPersonalDetail.findOne({ where: { customerKycId: customerKycId } })
        name = `${customerDetail.firstName} ${customerDetail.lastName}`;
    }
    console.log(address[0].addressProofNumber);
    if (moduleId == 3 && address[0].addressProofNumber && address[0].addressProofTypeId == 2) {
        let findIdentityNumber = await models.customerKycPersonalDetail.findOne({ where: { identityProofNumber: address[0].addressProofNumber } });

        if (!check.isEmpty(findIdentityNumber)) {
            // return res.status(400).json({ message: "Address Proof Number already exists! " })
            return { status: 404, success: false, message: `Address Proof Number already exists!` }

        }
    }

    if (address.length > 1) {
        if (moduleId == 3 && address[1].addressProofNumber && address[0].addressProofTypeId == 2) {
            let findIdentityNumber = await models.customerKycPersonalDetail.findOne({ where: { identityProofNumber: address[1].addressProofNumber } });
            if (!check.isEmpty(findIdentityNumber)) {
                // return res.status(400).json({ message: "Address Proof Number already exists! " })
                return { status: 404, success: false, message: `Address Proof Number already exists!` }

            }
        }
    }


    // if (identityProof.length == 0) {
    //     return res.status(404).json({ message: "Identity proof file must be required." });
    // }
    if (moduleId == 1) {
        if (address[0].addressProof.length == 0 || address[1].addressProof.length == 0) {
            // return res.status(404).json({ message: "Address proof file must be required." });
            return { status: 404, success: false, message: `Address proof file must be required.` }

        }
    } else if (moduleId == 3) {
        if (userType == "Individual") {
            if (address[0].addressProof.length == 0) {
                // return res.status(404).json({ message: "Address proof file must be required." });
                return { status: 404, success: false, message: `Address proof file must be required.` }

            }
        }
        if (userType == "Corporate") {
            if (address[0].addressProof.length == 0 || address[1].addressProof.length == 0) {
                // return res.status(404).json({ message: "Address proof file must be required." });
                return { status: 404, success: false, message: `Address proof file must be required.` }

            }
        }

    }

    let findCustomerKyc = await models.customerKycAddressDetail.findOne({ where: { customerKycId: customerKycId } })

    if (!check.isEmpty(findCustomerKyc)) {
        // return res.status(404).json({ message: "This customer address details is already filled." });
        return { status: 404, success: false, message: `This customer address details is already filled.` }

    }

    // let findIdentityNumber = await models.customerKycPersonalDetail.findOne({ where: { identityProofNumber: identityProofNumber } });
    // if (!check.isEmpty(findIdentityNumber)) {
    //     return res.status(400).json({ message: "Identity Proof Number already exists! " })
    // }


    let addressArray = []
    for (let i = 0; i < address.length; i++) {

        address[i]['customerId'] = customerId
        address[i]['customerKycId'] = customerKycId
        address[i]['createdBy'] = createdBy
        address[i]['modifiedBy'] = modifiedBy
        addressArray.push(address[i])
    }

    // let customerDetail = await models.customerKycPersonalDetail.findOne({ where: { customerKycId: customerKycId } })
    // let name = `${customerDetail.firstName} ${customerDetail.lastName}`;

    await sequelize.transaction(async t => {
        if (moduleId == 1) {
            await models.customerKycPersonalDetail.update({
                identityProof: identityProof,
                identityTypeId: identityTypeId,
                identityProofNumber: identityProofNumber,
                modifiedBy: modifiedBy
            }, { where: { customerId: customerId }, transaction: t });

            await models.customerKyc.update({ modifiedBy, customerKycCurrentStage: "3" }, { where: { customerId }, transaction: t });
            await models.customerKycAddressDetail.bulkCreate(addressArray, { returning: true, transaction: t });

        } else {

            // if(identityTypeId == 2){
            //     await models.customerKycPersonalDetail.update({
            //         identityProof: identityProof,
            //         identityTypeId: identityTypeId,
            //         identityProofNumber: identityProofNumber,
            //         modifiedBy: modifiedBy
            //     }, { where: { customerId: customerId }, transaction: t });
            // }

            await models.customerKyc.update({ modifiedBy, customerKycCurrentStage: "3" }, { where: { customerId }, transaction: t });
            await models.customerKycAddressDetail.bulkCreate(addressArray, { returning: true, transaction: t });
        }
        // await models.customerKycPersonalDetail.update({
        //     identityProof: identityProof,
        //     identityTypeId: identityTypeId,
        //     identityProofNumber: identityProofNumber,
        //     modifiedBy: modifiedBy
        // }, { where: { customerId: customerId }, transaction: t });

        // await models.customerKyc.update({ modifiedBy, customerKycCurrentStage: "3" }, { where: { customerId }, transaction: t });
        // await models.customerKycAddressDetail.bulkCreate(addressArray, { returning: true, transaction: t });

    })

    let { customerKycCurrentStage } = await models.customerKyc.findOne({ where: { customerId } });

    // return res.status(200).json({ customerId, customerKycId, name, customerKycCurrentStage, moduleId, userType })
    return { status: 200, success: true, customerId, customerKycId, name, customerKycCurrentStage, moduleId, userType }

}

let kycPersonalDetail = async (req) => {

    let { customerId, customerKycId, profileImage, dateOfBirth, age, alternateMobileNumber, gender, martialStatus, occupationId, spouseName, signatureProof, email, alternateEmail, landLineNumber, gstinNumber, cinNumber, constitutionsDeed, gstCertificate, moduleId, userType } = req.body

    let createdBy = req.userData.id;
    let modifiedBy = req.userData.id;

    let customer = await models.customer.findOne({ where: { id: customerId } })

    if (moduleId == 1) {

        if (customer.mobileNumber == alternateMobileNumber) {
            // return res.status(400).json({ message: "Your alternate Mobile number is same as your previous Mobile number " });
            return { status: 400, success: false, message: `Your alternate Mobile number is same as your previous Mobile number` }
        }
        let findAlternateNumberExist = await models.customerKycPersonalDetail.findOne({ where: { alternateMobileNumber } })

        if (!check.isEmpty(findAlternateNumberExist)) {
            // return res.status(400).json({ message: "Your alternate Mobile number is already exist." });
            return { status: 400, success: false, message: `Your alternate Mobile number is already exist.` }

        }
    } else if (moduleId == 3) {

        if (userType == "Corporate") {
            let customerEmail = await models.customer.findOne({ where: { email } });

            let customerOrganizationEmail = await models.customerKycOrganizationDetail.findOne({ where: { email } });

            if (!check.isEmpty(customerEmail) || !check.isEmpty(customerOrganizationEmail)) {
                // return res.status(400).json({ message: "your email id is already exists." });
                return { status: 400, success: false, message: `Your email id is already exists.` }

            }

            if (alternateEmail) {

                if (email == alternateEmail) {
                    // return res.status(400).json({ message: "your email id and alternate email id is same." });
                    return { status: 400, success: false, message: `Your email id and alternate email id is same.` }

                }

                let customerAlternateEmail = await models.customer.findOne({ where: { email: alternateEmail } });

                let customerOrganizationAlternateEmail = await models.customerKycOrganizationDetail.findOne({ where: { alternateEmail } });

                let customerOrganizationEmailVerify = await models.customerKycOrganizationDetail.findOne({ where: { email: alternateEmail } });

                if (!check.isEmpty(customerAlternateEmail) || !check.isEmpty(customerOrganizationAlternateEmail) || !check.isEmpty(customerOrganizationEmailVerify)) {
                    // return res.status(400).json({ message: "your alternate email id is already exists." });
                    return { status: 400, success: false, message: `Your alternate email id is already exists.` }

                }
            }

            if (landLineNumber) {
                let customerLandline = await models.customerKycOrganizationDetail.findOne({ where: { landLineNumber } });

                if (!check.isEmpty(customerLandline)) {
                    // return res.status(400).json({ message: "your land line number is already exists." });
                    return { status: 400, success: false, message: `Your land line number is already exists.` }

                }
            }
        }
    }


    await sequelize.transaction(async t => {
        let details;

        //dob changes
        await models.customer.update({
            dateOfBirth: dateOfBirth,
            gender: gender,
            age: age
        }, { where: { id: customerId }, transaction: t })
        //dob changes

        if (moduleId == 1) {
            details = await models.customerKycPersonalDetail.update({
                profileImage: profileImage,
                alternateMobileNumber: alternateMobileNumber,
                martialStatus: martialStatus,
                occupationId: occupationId,
                spouseName: spouseName,
                signatureProof: signatureProof,
                modifiedBy: modifiedBy
            }, { where: { customerId: customerId }, transaction: t });
        } else if (moduleId == 3) {
            if (userType == "Individual") {
                details = await models.customerKycPersonalDetail.update({
                    profileImage: profileImage,
                    alternateMobileNumber: alternateMobileNumber,
                    martialStatus: martialStatus,
                    occupationId: occupationId,
                    spouseName: spouseName,
                    signatureProof: signatureProof,
                    modifiedBy: modifiedBy
                }, { where: { customerId: customerId }, transaction: t });
            }
            if (userType == "Corporate") {
                details = await models.customerKycOrganizationDetail.update({
                    email: email,
                    alternateEmail: alternateEmail,
                    landLineNumber: landLineNumber,
                    gstinNumber: gstinNumber,
                    cinNumber: cinNumber,
                    constitutionsDeed: constitutionsDeed,
                    gstCertificate: gstCertificate,
                    modifiedBy: modifiedBy
                }, { where: { customerId: customerId }, transaction: t });
            }

        }

        await models.customerKyc.update({ modifiedBy, customerKycCurrentStage: "4" }, { where: { customerId }, transaction: t });

    })

    let customerKycReview;
    if (moduleId == 1) {
        customerKycReview = await models.customer.findOne({
            where: { id: customerId },
            attributes: ['id', 'firstName', 'lastName', 'panCardNumber', 'mobileNumber', 'panType', 'panImage', 'dateOfBirth', 'gender', 'age'],
            include: [{
                model: models.customerKycPersonalDetail,
                as: 'customerKycPersonal',
                attributes: ['id', 'customerId', 'firstName', 'lastName', 'profileImage', 'alternateMobileNumber', 'panCardNumber', 'martialStatus', 'occupationId', 'identityTypeId', 'identityProofNumber', 'identityProof', 'spouseName', 'signatureProof'],
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

        if (customerKycReview != null && customerKycReview.customerKycPersonal != null) {
            customerKycReview.dataValues.customerKycPersonal.dataValues.age = customerKycReview.age
            customerKycReview.dataValues.customerKycPersonal.dataValues.gender = customerKycReview.gender
            customerKycReview.dataValues.customerKycPersonal.dataValues.dateOfBirth = customerKycReview.dateOfBirth
        }
    } else if (moduleId == 3) {
        customerKycReview = await models.customer.findOne({
            where: { id: customerId },
            attributes: ['id', 'firstName', 'lastName', 'panCardNumber', 'mobileNumber', 'userType', 'organizationTypeId', 'dateOfIncorporation', 'moduleId', 'panType', 'panImage', 'gender', 'age', 'dateOfBirth'],
            include: [
                {
                    model: models.customerKycPersonalDetail,
                    as: 'customerKycPersonal',
                    required: false,
                    attributes: ['id', 'customerId', 'firstName', 'lastName', 'profileImage', 'alternateMobileNumber', 'panCardNumber', 'martialStatus', 'occupationId', 'identityTypeId', 'identityProofNumber', 'identityProof', 'spouseName', 'signatureProof'],
                    include: [{
                        model: models.occupation,
                        as: 'occupation'
                    }, {
                        model: models.identityType,
                        as: 'identityType'
                    }]
                },
                {
                    model: models.customerKycOrganizationDetail,
                    as: 'organizationDetail',
                    required: false,
                    attributes: ['id', 'customerId', 'customerKycId', 'email', 'alternateEmail', 'landLineNumber', 'gstinNumber', 'cinNumber', 'constitutionsDeed', 'gstCertificate'],
                },
                {
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
                },
                {
                    model: models.organizationType,
                    as: "organizationType",
                    attributes: ['id', 'organizationType']
                }]
        })

        if (customerKycReview != null && customerKycReview.customerKycPersonal != null) {
            customerKycReview.dataValues.customerKycPersonal.dataValues.age = customerKycReview.age
            customerKycReview.dataValues.customerKycPersonal.dataValues.gender = customerKycReview.gender
            customerKycReview.dataValues.customerKycPersonal.dataValues.dateOfBirth = customerKycReview.dateOfBirth
        }
    }

    let { customerKycCurrentStage } = await models.customerKyc.findOne({ where: { customerId } });

    // return res.status(200).json({ customerId, customerKycId, customerKycCurrentStage, customerKycReview, moduleId, userType })
    return { status: 200, success: true, customerId, customerKycId, customerKycCurrentStage, customerKycReview, moduleId, userType }

}

let digiOrEmiKyc = async (req) => {
    try {
        const id = req.userData.id;
        const { panNumber, panAttachment, aadharNumber, aadharAttachment } = req.body;
        const merchantData = await getMerchantData();
        let customerDetails = await models.customer.findOne({
            where: { id, isActive: true },
        });
        let customerUniqueId = customerDetails.customerUniqueId;

        if (customerUniqueId == null) {
            customerUniqueId = uniqid.time().toUpperCase();
        }

        if (check.isEmpty(customerDetails)) {
            // return res.status(404).json({ message: "Customer Does Not Exists" });
            return { status: 404, success: false, message: `Customer Does Not Exists` }
        }
        let base64Image
        if (/;base64/i.test(panAttachment)) {
            base64Image = panAttachment.split(';base64,').pop();
        } else {
            const getAwsResp = await models.axios({
                method: 'GET',
                url: panAttachment,
                responseType: 'arraybuffer'
            });
            base64Image = Buffer.from(getAwsResp.data, 'binary').toString('base64');
        }
        const dir = 'public/uploads/digitalGoldKyc';
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
        const panPath = `public/uploads/digitalGoldKyc/pan-${customerUniqueId}.jpeg`;
        fs.writeFileSync(panPath, base64Image, { encoding: 'base64' });
        const data = new FormData();
        data.append('panNumber', panNumber);
        data.append('panAttachment', fs.createReadStream(panPath));

        const result = await models.axios({
            method: 'POST',
            url: `${process.env.DIGITALGOLDAPI}/merchant/v1/users/${customerUniqueId}/kyc`,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${merchantData.accessToken}`,
                ...data.getHeaders(),
            },
            data: data
        })
        if (result.data.statusCode === 200) {
            fs.unlinkSync(panPath)
            await sms.sendMessageForKycUpdate(customerDetails.mobileNumber);
        }
        // return res.status(200).json(result.data);
        return { status: 200, success: true, data: { data: result.data }, customerUniqueId }
    } catch (err) {
        let errorData = errorLogger(JSON.stringify(err), req.url, req.method, req.hostname, req.body);

        if (err.response) {
            // return res.status(422).json(err.response.data);
            return { status: 422, success: false, message: err.response.data }
        } else {
            // console.log('Error', err.message);
            return { status: 404, success: false, message: err.message }

        }
    };
}

let allKycCompleteInfo = async (customerInfo) => {

    let kycCompletePoint = customerInfo.kycCompletePoint

    let kycApproval = {
        goldLoan: false,
        goldEmi: false,
        goldScrap: false,
        digiGold: false
    }

    let goldPoint = await models.module.findOne({ where: { id: 1 } })
    let checkGoldKyc = kycCompletePoint & goldPoint.modulePoint
    if (checkGoldKyc != 0) {
        kycApproval.goldLoan = true
    }

    let goldEmi = await models.module.findOne({ where: { id: 2 } })
    let checkEmiKyc = kycCompletePoint & goldEmi.modulePoint
    if (checkEmiKyc != 0) {
        kycApproval.goldEmi = true
    }

    let goldScrap = await models.module.findOne({ where: { id: 3 } })
    let checkSprapKyc = kycCompletePoint & goldScrap.modulePoint
    if (checkSprapKyc != 0) {
        kycApproval.goldScrap = true
    }

    let digiGold = await models.module.findOne({ where: { id: 4 } })
    let checkDigiGoldKyc = kycCompletePoint & digiGold.modulePoint
    if (checkDigiGoldKyc != 0) {
        kycApproval.digiGold = true
    }

    return kycApproval
}

module.exports = {
    customerKycAdd: customerKycAdd,
    customerKycEdit: customerKycEdit,
    getKycInfo: getKycInfo,
    updateCompleteKycModule: updateCompleteKycModule,
    updateCustomerUniqueId: updateCustomerUniqueId,
    kycBasicDetails: kycBasicDetails,
    submitKycInfo: submitKycInfo,
    kycAddressDeatil: kycAddressDeatil,
    kycPersonalDetail: kycPersonalDetail,
    digiOrEmiKyc: digiOrEmiKyc,
    allKycCompleteInfo: allKycCompleteInfo
}