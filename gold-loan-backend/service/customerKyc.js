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

let customerKycAdd = async (body, createdBy, modifiedBy) => {

    let { firstName, lastName, customerId, profileImage, dateOfBirth, age, alternateMobileNumber, gender, martialStatus, occupationId, spouseName, signatureProof, identityProof, identityTypeId, identityProofNumber, address, panCardNumber, panType, panImage, moduleId } = body
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
            , 'panCardNumber'],
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

            await models.customer.update({ firstName, lastName, panCardNumber: panCardNumber, panType, panImage }, { where: { id: customerId }, transaction: t })

            let customerKycAdd = await models.customerKyc.create({ currentKycModuleId: moduleId, isAppliedForKyc: true, customerKycCurrentStage: '4', customerId: getCustomerInfo.id, createdBy, modifiedBy, isKycSubmitted: true }, { transaction: t })

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
                modifiedBy
            }, { transaction: t });

            let addressArray = []
            for (let i = 0; i < address.length; i++) {

                address[i]['customerId'] = getCustomerInfo.id
                address[i]['customerKycId'] = customerKycAdd.id
                address[i]['createdBy'] = createdBy
                address[i]['modifiedBy'] = modifiedBy
                addressArray.push(address[i])
            }

            let data = await models.customerKycAddressDetail.bulkCreate(addressArray, { returning: true, transaction: t });

            await models.customerKycClassification.create({ customerId, customerKycId: customerKycAdd.id, kycStatusFromCce: "pending", cceId: createdBy }, { transaction: t })

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
            let customerKycAdd = await models.customerKyc.create({ isAppliedForKyc: true, customerId: getCustomerInfo.id, createdBy, modifiedBy, customerKycCurrentStage: "2", currentKycModuleId: moduleId }, { transaction: t })


            await models.customer.update({ firstName: firstName, lastName: lastName, panCardNumber: panCardNumber, panType: panType, panImage: panImage, organizationTypeId, dateOfIncorporation, userType: userType, moduleId: moduleId }, { where: { id: getCustomerInfo.id }, transaction: t })

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


module.exports = {
    customerKycAdd: customerKycAdd
}