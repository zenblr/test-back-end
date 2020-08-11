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

    await sequelize.transaction(async (t) => {
        let personalId = await models.customerKycPersonalDetail.findOne({ where: { customerId: customerId }, transaction: t });

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
    return res.status(200).json({ message: 'success' })
    // let { customerKycCurrentStage } = await models.customerKyc.findOne({ where: { customerId } });

    // let KycClassification = await models.customerKycClassification.findOne({ where: { customerId: customerId } })


    // console.log(KycClassification);

}

exports.getAssignedCustomer = async (req, res, next) => {
    let { search, offset, pageSize } = paginationWithFromTo(req.query.search, req.query.from, req.query.to);
    let id = req.userData.id;
    let query = {}
    let searchQuery = {
        [Op.and]: [query, {
            [Op.or]: {
                "$customer.first_name$": { [Op.iLike]: search + '%' },
                "$customer.last_name$": { [Op.iLike]: search + '%' },
                "$customer.customer_unique_id$": { [Op.iLike]: search + '%' },
            },
        }],
        appraiserId: id
    };
    let includeArray = [{
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
            },
            {
                model: models.customerLoanMaster,
                as: "masterLoan",
                include: [
                    {
                        model: models.customerLoan,
                        as: 'customerLoan',
                        attributes: ['id'],
                        // where: { loanType: 'secured' }
                    }
                ]
            }]
    }]
    let data = await models.customerAssignAppraiser.findAll({
        where: searchQuery,
        attributes: ['appraiserId', 'appoinmentDate', 'startTime', 'endTime'],
        subQuery: false,
        include: includeArray,
        order: [
            ['id', 'DESC'],
        ],
        offset: offset,
        limit: pageSize
    })

    let tempData = []
    for (let i = 0; i < data.length; i++) {
        let singleCustomer = extend(data[i].dataValues);
        if (singleCustomer.customer.masterLoan.length > 1) {
            let customer = extend(singleCustomer.customer.dataValues);
            let masterLoans = customer.masterLoan.slice();
            delete singleCustomer.customer;
            for (let j = 0; j < masterLoans.length; j++) {
                let masterLoan = extend(masterLoans[j].dataValues);
                singleCustomer['customer'] = { ...customer };
                delete singleCustomer.customer.masterLoan;
                singleCustomer.customer['masterLoan'] = [masterLoan];//.slice();
                tempData.push({ ...singleCustomer });
            }
        } else {
            tempData.push(singleCustomer);
        }

    }
    data = tempData;

    let count = await models.customerAssignAppraiser.findAll({
        where: searchQuery,
        subQuery: false,
        include: includeArray,
    });
    let tempCount = []
    for (let i = 0; i < count.length; i++) {
        let singleCustomer = extend(count[i].dataValues);
        if (singleCustomer.customer.masterLoan.length > 1) {
            let customer = extend(singleCustomer.customer.dataValues);
            let masterLoans = customer.masterLoan.slice();
            delete singleCustomer.customer;
            for (let j = 0; j < masterLoans.length; j++) {
                let masterLoan = extend(masterLoans[j].dataValues);
                singleCustomer['customer'] = { ...customer };
                delete singleCustomer.customer.masterLoan;
                singleCustomer.customer['masterLoan'] = [masterLoan];//.slice();
                tempCount.push({ ...singleCustomer });
            }
        } else {
            tempCount.push(singleCustomer);
        }
    }
    count = tempCount;

    if (data.length === 0) {
        return res.status(200).json([]);
    } else {
        return res.status(200).json({ message: 'success', count: count.length, data })
    }


}