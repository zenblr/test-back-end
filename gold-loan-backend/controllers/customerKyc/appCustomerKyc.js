const models = require('../../models');
const sequelize = models.sequelize;
const Sequelize = models.Sequelize;
const Op = Sequelize.Op;
const request = require("request");
const { createReferenceCode } = require("../../utils/referenceCode");
const CONSTANT = require("../../utils/constant");
const moment = require("moment");
const { paginationWithFromTo } = require("../../utils/pagination");

const check = require("../../lib/checkLib");

exports.submitAppKyc = async (req, res, next) => {
    let modifiedBy = req.userData.id;
    let createdBy = req.userData.id;

    let { customerId, profileImage, dateOfBirth, age, alternateMobileNumber, gender, martialStatus, occupationId, spouseName, signatureProof, identityProof, identityTypeId, identityProofNumber, address } = req.body
    var date = dateOfBirth.split("-").reverse().join("-");

    let status = await models.status.findOne({ where: { statusName: "confirm" } })
    if (check.isEmpty(status)) {
        return res.status(404).json({ message: "Status confirm is not there in status table" });
    }

    let checkKycExist = await models.customerKyc.findOne({ where: { customerId: customerId } })
    if (checkKycExist) {
        return res.status(404).json({ message: "You are Already Applied for Kyc!" });
    }
    let statusId = status.id
    let getCustomerInfo = await models.customer.findOne({
        where: { id: customerId, statusId },
        attributes: ['id', 'firstName', 'lastName', 'stateId', 'cityId', 'pinCode', 'panType', 'panImage'
            , 'panCardNumber'],
    })
    if (check.isEmpty(getCustomerInfo)) {
        return res.status(404).json({ message: "Your status is not confirm" });
    }

    let kycInfo = await sequelize.transaction(async t => {

        let customerKycAdd = await models.customerKyc.create({ isAppliedForKyc: true, customerKycCurrentStage: '4', customerId: getCustomerInfo.id, createdBy, modifiedBy }, { transaction: t })

        let abcd = await models.customerKycPersonalDetail.create({
            customerId: getCustomerInfo.id,
            customerKycId: customerKycAdd.id,
            firstName: getCustomerInfo.firstName,
            lastName: getCustomerInfo.lastName,
            panCardNumber: getCustomerInfo.panCardNumber,
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

    return res.status(200).json({ message: 'success', customerId, customerKycId: kycInfo.id })



}

// exports.editAppKyc = async (req, res, next) => {
//     let modifiedBy = req.userData.id;
//     let createdBy = req.userData.id;

//     let { customerId, profileImage, dateOfBirth, age, alternateMobileNumber, gender, martialStatus, occupationId, spouseName, signatureProof, identityProof, identityTypeId, identityProofNumber, address, customerKycId } = req.body
//     var date = dateOfBirth.split("-").reverse().join("-");


//         // let customerKycAdd = await models.customerKyc.create({ isAppliedForKyc: true, customerKycCurrentStage: '4', customerId: getCustomerInfo.id, createdBy, modifiedBy }, { transaction: t })
//         let modifiedBy = req.userData.id;
//         customerKycPersonal['modifiedBy'] = modifiedBy;
//         customerKycPersonal['dateOfBirth'] = date;
    
//         let addressArray = []
//         for (let i = 0; i < customerKycAddress.length; i++) {
    
//             customerKycAddress[i]['modifiedBy'] = modifiedBy
//             addressArray.push(customerKycAddress[i])
//         }
    
//         await sequelize.transaction(async (t) => {
//             let personalId = await models.customerKycPersonalDetail.findOne({ where: { customerId: customerId }, transaction: t });
    
//             await models.customerKycPersonalDetail.update(customerKycPersonal, { where: { customerId: customerId }, transaction: t });
    
//             await models.customerKycAddressDetail.bulkCreate(addressArray, { updateOnDuplicate: ["addressType", "address", "stateId", "cityId", "pinCode", "addressProofTypeId", "addressProof", "addressProofNumber", "modifiedBy"] }, { transaction: t })
    
    
//         })
    
//         return res.status(200).json({ message: `successful` })

// }

exports.getAssignedCustomer = async (req, res, next) => {
    const id = req.userData.id
    let getAppraisal = await models.customerAssignAppraiser.findAll({
        where: { appraiserId: id },
        order: [
            // [models.customerKycAddressDetail, 'id', 'asc']
        ],
        attributes: ['appraiserId', 'appoinmentDate', 'startTime', 'endTime'],
        include: [
            {
                model: models.customer,
                as: 'customer',
                attributes: { exclude: ['customerUniqueId', 'internalBranchId', 'password', 'createdBy', 'modifiedBy', 'createdAt', 'updatedAt', 'isActive', 'lastLogin'] },
                include: [
                    {
                        model: models.customerKyc,
                        as: "customerKyc",
                        attributes: ['id']
                    },
                    {
                        model: models.customerKycClassification,
                        as: "customerKycClassification",
                    },
                    {
                        model: models.state,
                        as: 'state'
                    },
                    {
                        model: models.city,
                        as: 'city'
                    },
                    {
                        model: models.status,
                        as: 'status',
                        attributes: ['id', 'statusName']
                    },
                    {
                        model: models.customerKycClassification,
                        as: 'customerKycClassification',
                        attributes: ['id', 'kycStatusFromCce', 'kycStatusFromOperationalTeam']
                    }
                ]
            },
        ]
    })


    return res.status(200).json({ message: 'message', data: getAppraisal })

}