const models = require('../../models');
const sequelize = models.sequelize;
const Sequelize = models.Sequelize;
const Op = Sequelize.Op;
const request = require("request");
const { createReferenceCode } = require("../../utils/referenceCode");
const CONSTANT = require("../../utils/constant");
const moment = require("moment");
const { paginationWithFromTo } = require("../../utils/pagination");
const extend = require('extend')
const check = require("../../lib/checkLib");

exports.submitAppKyc = async (req, res, next) => {
    let modifiedBy = req.userData.id;
    let createdBy = req.userData.id;

    let { firstName, lastName, customerId, profileImage, dateOfBirth, age, alternateMobileNumber, gender, martialStatus, occupationId, spouseName, signatureProof, identityProof, identityTypeId, identityProofNumber, address, panCardNumber, panType, panImage } = req.body
    // var date = dateOfBirth.split("-").reverse().join("-");
    var date = dateOfBirth

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

    let findIdentityNumber = await models.customerKycPersonalDetail.findOne({ where: { identityProofNumber: identityProofNumber } });
    if (!check.isEmpty(findIdentityNumber)) {
        return res.status(400).json({ message: "Identity Proof Number already exists! " })
    }
    if (panCardNumber) {
        let findPanCardNumber = await models.customer.findOne({
            where: {
                id: { [Op.not]: customerId },
                panCardNumber: panCardNumber
            }
        });
        if (!check.isEmpty(findPanCardNumber)) {
            return res.status(400).json({ message: "Pan Card Number already exists! " });
        }
    }


    let kycInfo = await sequelize.transaction(async t => {

        await models.customer.update({ firstName, lastName, panCardNumber: panCardNumber, panType, panImage }, { where: { id: customerId }, transaction: t })

        let customerKycAdd = await models.customerKyc.create({ currentKycModuleId: 1, isAppliedForKyc: true, customerKycCurrentStage: '4', customerId: getCustomerInfo.id, createdBy, modifiedBy }, { transaction: t })

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

    return res.status(200).json({ message: 'Success', customerId, customerKycId: kycInfo.id })



}

exports.editAppKyc = async (req, res, next) => {

    let { customerId, customerKycId, customerKycPersonal, customerKycAddress } = req.body;
    let { kycRatingFromCce, kycStatusFromCce, reasonFromCce } = req.body
    let cceId = req.userData.id
    let modifiedBy = req.userData.id;
    let createdBy = req.userData.id;


    let customerRating = await models.customerKycClassification.findOne({ where: { customerId } })

    if (customerRating.kycStatusFromCce == "approved") {
        return res.status(400).json({ message: `You cannot change status from approved` })
    }

    // let findCustomerKyc = await models.customerKyc.findOne({ where: { id: customerKycId } })
    // if (check.isEmpty(findCustomerKyc)) {
    //     return res.status(404).json({ message: "This customer kyc detailes is not filled." });
    // }
    customerKycPersonal['modifiedBy'] = modifiedBy

    let addressArray = []
    for (let i = 0; i < customerKycAddress.length; i++) {

        customerKycAddress[i]['modifiedBy'] = modifiedBy
        addressArray.push(customerKycAddress[i])
    }

    if (customerKycPersonal.panCardNumber) {
        let findPanCardNumber = await models.customer.findOne({
            where: {
                id: { [Op.not]: customerId },
                panCardNumber: { [Op.iLike]: customerKycPersonal.panCardNumber },
                isActive: true
            }
        });
        if (!check.isEmpty(findPanCardNumber)) {
            return res.status(400).json({ message: "Pan Card Number already exists! " })
        }
    }

    await sequelize.transaction(async (t) => {
        let personalId = await models.customerKycPersonalDetail.findOne({ where: { customerId: customerId }, transaction: t });

        await models.customer.update({
            firstName: customerKycPersonal.firstName,
            lastName: customerKycPersonal.lastName,
            panCardNumber: customerKycPersonal.panCardNumber,
            panType: customerKycPersonal.panType,
            panImage: customerKycPersonal.panImage
        }, { where: { id: customerId }, transaction: t })

        await models.customerKycPersonalDetail.update(customerKycPersonal, { where: { customerId: customerId }, transaction: t });

        await models.customerKycAddressDetail.bulkCreate(addressArray, { updateOnDuplicate: ["addressType", "address", "stateId", "cityId", "pinCode", "addressProofTypeId", "addressProof", "addressProofNumber", "modifiedBy"] }, { transaction: t })

        await models.customerKyc.update({ modifiedBy, customerKycCurrentStage: "4" }, { where: { customerId }, transaction: t });

        if (kycStatusFromCce !== "approved") {
            if (reasonFromCce.length == 0) {
                return res.status(400).json({ message: `If you are not approved the customer kyc you have to give a reason.` })
            }

            await models.customerKyc.update(
                { cceVerifiedBy: cceId, isKycSubmitted: true },
                { where: { customerId: customerId }, transaction: t })

            await models.customerKycClassification.update({ customerId, customerKycId, kycRatingFromCce, kycStatusFromCce, reasonFromCce, cceId }, { where: { customerId }, transaction: t })

        } else {
            if ((kycRatingFromCce == 1 || kycRatingFromCce == 2 || kycRatingFromCce == 3) && kycStatusFromCce == "approved") {
                return res.status(400).json({ message: `Please check rating.` })
            }
            reasonFromCce = ""

            await models.customerKyc.update(
                { isVerifiedByCce: true, cceVerifiedBy: cceId, isKycSubmitted: true },
                { where: { customerId: customerId }, transaction: t })

            await models.customerKycClassification.update({ customerId, customerKycId, kycRatingFromCce, kycStatusFromCce, reasonFromCce, cceId }, { where: { customerId }, transaction: t })

        }
    })
    return res.status(200).json({ message: 'Success' })
    // let { customerKycCurrentStage } = await models.customerKyc.findOne({ where: { customerId } });

    // let KycClassification = await models.customerKycClassification.findOne({ where: { customerId: customerId } })


    // console.log(KycClassification);

}

exports.getAssignedCustomer = async (req, res, next) => {
    let { search, offset, pageSize } = paginationWithFromTo(req.query.search, req.query.from, req.query.to);
    let id = req.userData.id;
    let query = {}

    let goldModule = await models.module.findOne({ where: { moduleName: 'gold loan' } })
    let start = new Date();
    start.setHours(5, 30, 0, 0);
    let end = new Date();
    end.setHours(23, 59, 59, 999);
    end = new Date(moment(end).utcOffset("+05:30"))
    console.log(start, end)
    let searchQuery = {
        [Op.and]: [query, {
            [Op.or]: [{
                "$customer.first_name$": { [Op.iLike]: search + '%' },
                "$customer.last_name$": { [Op.iLike]: search + '%' },
                // "$customer.customer_unique_id$": { [Op.iLike]: search + '%' }
            }],
        }],
        [Op.or]: [
            {
                "$masterLoan.loan_stage_id$": { [Op.notIn]: [13] }
            },
            {
                "$masterLoan.packet_submitted_date$": {
                    [Op.between]: [start, end]
                }
            },
            {
                status: "incomplete"
            }
        ],
        appraiserId: id,
        moduleId: goldModule.id,
    };

    let includeArray = [
        {
            model: models.customer,
            as: 'customer',
            subQuery: false,
            include: [
                {
                    model: models.customerKyc,
                    as: "customerKyc",
                    attributes: ['id']
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
            ]
        }, {
            model: models.customerLoanMaster,
            as: "masterLoan",
            include: [
                {
                    model: models.partRelease,
                    as: 'partRelease',
                    attributes: ['id', 'amountStatus', 'partReleaseStatus', 'newLoanAmount']
                },
                {
                    model: models.customerLoan,
                    as: 'customerLoan',
                },
                {
                    model: models.customerLoanDocument,
                    as: 'customerLoanDocument',
                    attributes: { exclude: ['createdAt', 'modifiedBy', 'createdAt', 'updatedAt', 'isActive'] },

                },
                {
                    model: models.loanStage,
                    as: 'loanStage',
                    attributes: ['id', 'name']
                },
                {
                    model: models.customerLoanMaster,
                    as: 'parentLoan',
                    attributes: ['id'],
                    include: [
                        {
                            model: models.partRelease,
                            as: 'partRelease',
                            attributes: ['id', 'amountStatus', 'partReleaseStatus', 'newLoanAmount']
                        }
                    ]
                }
            ]
        }
    ]

    let data = await models.appraiserRequest.findAll({
        where: searchQuery,
        attributes: ['id', 'appraiserId', 'appoinmentDate', 'startTime', 'endTime', 'status'],
        subQuery: false,
        include: includeArray,
        order: [
            ['id', 'DESC'],
            [models.customer, { model: models.customerKycAddressDetail, as: 'customerKycAddress' }, 'id', 'asc'],
            [{ model: models.customerLoanMaster, as: 'masterLoan' }, { model: models.customerLoan, as: 'customerLoan' }, 'id', 'asc']
        ],
        // offset: offset,
        // limit: pageSize
    })

    let count = await models.appraiserRequest.findAll({
        where: searchQuery,
        subQuery: false,
        include: includeArray,
    });


    if (data.length === 0) {
        return res.status(200).json([]);
    } else {
        return res.status(200).json({ message: 'Success', count: count.length, data })
    }


}

exports.checkDuplicatePan = async (req, res, next) => {
    let { customerId, panCardNumber, identityProofNumber } = req.body
    if (panCardNumber == undefined) {
        panCardNumber = null
    }
    let checkPan = await models.customer.findOne({
        where: { panCardNumber: panCardNumber }
    })

    let checkAadhar = await models.customerKycPersonalDetail.findOne({
        where: { identityProofNumber: identityProofNumber }
    })

    if (customerId == null) {
        if (!check.isEmpty(checkPan) && !check.isEmpty(panCardNumber)) {
            return res.status(400).json({ message: 'Duplicate PAN card' })
        } else if (!check.isEmpty(checkAadhar)) {
            return res.status(400).json({ message: 'Duplicate Aadhar card' })
        } else {
            return res.status(200).json({ message: 'Success' })
        }
    } else {
        if (!check.isEmpty(checkPan) && checkPan.id != customerId && !check.isEmpty(panCardNumber)) {
            return res.status(400).json({ message: 'Duplicate PAN card' })
        } else if (!check.isEmpty(checkAadhar) && checkAadhar.customerId != customerId) {
            return res.status(400).json({ message: 'Duplicate Aadhar card' })
        } else {
            return res.status(200).json({ message: 'Success' })
        }
    }
}


exports.checkDuplicateAadhar = async (req, res, next) => {
    let { customerId, identityProofNumber } = req.body

    let checkAadhar = await models.customerKycPersonalDetail.findOne({
        where: { identityProofNumber: identityProofNumber }
    })
    if (customerId == null) {
        if (!check.isEmpty(checkAadhar)) {
            return res.status(400).json({ message: 'Duplicate Aadhar card' })
        } else {
            return res.status(200).json({ message: 'Success' })
        }
    } else {
        if (checkAadhar.customerId != customerId) {
            return res.status(400).json({ message: 'Duplicate Aadhar card' })
        } else {
            return res.status(200).json({ message: 'Success' })
        }
    }
}

exports.checkLoanAppraiser = async (req, res, next) => {
    let { appraiserRequestId } = req.body

    let appraiserId = req.userData.id;
    let getAppraiserRequest = await models.appraiserRequest.findOne({ where: { id: appraiserRequestId, appraiserId: appraiserId } });

    if (check.isEmpty(getAppraiserRequest)) {
        return res.status(400).json({ message: `This customer is not assign to you` })
    }
    return res.status(200).json({ message: 'Success' })
}