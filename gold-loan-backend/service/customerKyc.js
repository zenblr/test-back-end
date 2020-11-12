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

    let { firstName, lastName, customerId, profileImage, dateOfBirth, age, alternateMobileNumber, gender, martialStatus, occupationId, spouseName, signatureProof, identityProof, identityTypeId, identityProofNumber, address, panCardNumber, panType, panImage } = body
    // var date = dateOfBirth.split("-").reverse().join("-");
    var date = dateOfBirth

    let status = await models.status.findOne({ where: { statusName: "confirm" } })
    if (check.isEmpty(status)) {
        // return res.status(404).json({ message: "Status confirm is not there in status table" });
        return { status: 404, message: `Status confirm is not there in status table` }
    }

    let checkKycExist = await models.customerKyc.findOne({ where: { customerId: customerId } })
    if (checkKycExist) {
        // return res.status(404).json({ message: "You are Already Applied for Kyc!" });
        return { status: 404, message: `You are Already Applied for Kyc!` }

    }
    let statusId = status.id
    let getCustomerInfo = await models.customer.findOne({
        where: { id: customerId, statusId },
        attributes: ['id', 'firstName', 'lastName', 'stateId', 'cityId', 'pinCode', 'panType', 'panImage'
            , 'panCardNumber'],
    })
    if (check.isEmpty(getCustomerInfo)) {
        // return res.status(404).json({ message: "Your status is not confirm" });
        return { status: 404, message: `Your status is not confirm` }

    }

    let findIdentityNumber = await models.customerKycPersonalDetail.findOne({ where: { identityProofNumber: identityProofNumber } });
    if (!check.isEmpty(findIdentityNumber)) {
        // return res.status(400).json({ message: "Identity Proof Number already exists! " })
        return { status: 404, message: `Identity Proof Number already exists!` }
    }
    if (panCardNumber) {
        let findPanCardNumber = await models.customer.findOne({
            where: {
                id: { [Op.not]: customerId },
                panCardNumber: panCardNumber
            }
        });
        if (!check.isEmpty(findPanCardNumber)) {
            // return res.status(400).json({ message: "Pan Card Number already exists! " });
            return { status: 404, message: `Pan Card Number already exists!` }

        }
    }


    let kycInfo = await sequelize.transaction(async t => {

        await models.customer.update({ firstName, lastName, panCardNumber: panCardNumber, panType, panImage }, { where: { id: customerId }, transaction: t })

        let customerKycAdd = await models.customerKyc.create({ currentKycModuleId: 1, isAppliedForKyc: true, customerKycCurrentStage: '4', customerId: getCustomerInfo.id, createdBy, modifiedBy, isKycSubmitted: true }, { transaction: t })

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

    // return res.status(200).json({ message: 'Success', customerId, customerKycId: kycInfo.id })

    return { status: 200, message: `Success`, customerId, customerKycId: kycInfo.id }

}


module.exports = {
    customerKycAdd: customerKycAdd
}