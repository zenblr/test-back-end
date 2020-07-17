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
    // console.log(req.userData.id)

    let { customerId, profileImage, dateOfBirth, age, alternateMobileNumber, gender, martialStatus, occupationId, spouseName, signatureProof, identityProof, identityTypeId, identityProofNumber, address } = req.body

    let date = new Date(dateOfBirth)
    //console.log(date)

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
    //console.log(getCustomerInfo.panCardNumber)
    if (check.isEmpty(getCustomerInfo)) {
        return res.status(404).json({ message: "Your status is not confirm" });
    }

    let kycInfo = await sequelize.transaction(async t => {

        let customerKycAdd = await models.customerKyc.create({ isAppliedForKyc: true, customerId: getCustomerInfo.id, createdBy, modifiedBy }, { transaction: t })
        //console.log(customerKycAdd.id)

        await models.customerKycPersonalDetail.create({
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

            address[i]['customerId'] =  getCustomerInfo.id
            address[i]['customerKycId'] = customerKycAdd.id
            address[i]['createdBy'] = createdBy
            address[i]['modifiedBy'] = modifiedBy
            addressArray.push(address[i])
        }

        await models.customerKycAddressDetail.bulkCreate(addressArray, { returning: true, transaction: t });
        return customerKycAdd
    })

    // let customerKycReview = await models.customer.findOne({
    //     where: { id: customerId },
    //     attributes: ['id', 'firstName', 'lastName', 'panCardNumber', 'mobileNumber', 'panType', 'panImage'],
    //     include: [{
    //         model: models.customerKycPersonalDetail,
    //         as: 'customerKycPersonal',
    //         attributes: ['id', 'customerId', 'firstName', 'lastName', 'profileImage', 'dateOfBirth', 'alternateMobileNumber', 'panCardNumber', 'gender', 'age', 'martialStatus', 'occupationId', 'identityTypeId', 'identityProofNumber', 'identityProof', 'spouseName', 'signatureProof'],
    //         include: [{
    //             model: models.occupation,
    //             as: 'occupation'
    //         }, {
    //             model: models.identityType,
    //             as: 'identityType'
    //         }]
    //     }, {
    //         model: models.customerKycAddressDetail,
    //         as: 'customerKycAddress',
    //         attributes: ['id', 'customerKycId', 'customerId', 'addressType', 'address', 'stateId', 'cityId', 'pinCode', 'addressProofTypeId', 'addressProofNumber', 'addressProof'],
    //         include: [{
    //             model: models.state,
    //             as: 'state'
    //         }, {
    //             model: models.city,
    //             as: 'city'
    //         }, {
    //             model: models.addressProofType,
    //             as: 'addressProofType'
    //         }],
    //         order: [["id", "ASC"]]
    //     }]
    // })

    return res.status(200).json({ customerId, customerKycId: kycInfo.id })



}

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


    return res.status(200).json({ message: getAppraisal })

}