const models = require('../../models');
const sequelize = models.sequelize;
const Sequelize = models.Sequelize;
const Op = Sequelize.Op;
const request = require("request");
const { createReferenceCode } = require("../../utils/referenceCode");
const CONSTANT = require("../../utils/constant");
const moment = require("moment");

const check = require("../../lib/checkLib");



exports.sendOtpKycNumber = async (req, res, next) => {

    // let { mobileNumber } = req.body
    // let numberExistInCustomer = await models.customer.findOne({ where: { mobileNumber } })
    // if (check.isEmpty(numberExistInCustomer)) {
    //     return res.status(404).json({ message: "Your Mobile number does not exist, please add lead first" });
    // }

    // let status = await models.status.findOne({ where: { statusName: "confirm" } })
    // if (check.isEmpty(status)) {
    //     return res.status(404).json({ message: "Status confirm is not there in status table" });
    // }
    // let statusId = status.id
    // let checkStatusCustomer = await models.customer.findOne({ where: { statusId, id: numberExistInCustomer.id } })
    // if (check.isEmpty(checkStatusCustomer)) {
    //     return res.status(404).json({ message: "Please proceed after confirming your lead stage status" });
    // }
    // await models.customerOtp.destroy({ where: { mobileNumber } });

    // const referenceCode = await createReferenceCode(5);
    // let otp = Math.floor(1000 + Math.random() * 9000);
    // let createdTime = new Date();
    // let expiryTime = moment.utc(createdTime).add(10, "m");

    // await models.customerOtp.create({ mobileNumber, otp, createdTime, expiryTime, referenceCode });
    // request(
    //     `${CONSTANT.SMSURL}username=${CONSTANT.SMSUSERNAME}&password=${CONSTANT.SMSPASSWORD}&type=0&dlr=1&destination=${mobileNumber}&source=nicalc&message=For refrence code ${referenceCode} your OTP is ${otp}`
    // );

    // return res.status(200).json({ message: `Otp send to your entered mobile number.`, referenceCode, });
}


exports.verifyCustomerKycNumber = async (req, res, next) => {
    // let { referenceCode, otp } = req.body;
    // var todayDateTime = new Date();

    // let verifyUser = await models.customerOtp.findOne({
    //     where: {
    //         referenceCode,
    //         otp,
    //         expiryTime: {
    //             [Op.gte]: todayDateTime,
    //         },
    //     },
    // });
    // if (check.isEmpty(verifyUser)) {
    //     return res.status(404).json({ message: `Invalid otp.` });
    // }

    // let verifyFlag = await models.customerOtp.update(
    //     { isVerified: true },
    //     { where: { id: verifyUser.id } }
    // );

    // let customerInfo = await models.customer.findOne({
    //     where: { mobileNumber: verifyUser.mobileNumber },
    //     attributes: ['firstName', 'lastName', 'panCardNumber']
    // })

    // return res.status(200).json({ message: "Success", referenceCode, customerInfo });
}


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
        attributes: ['firstName', 'lastName', 'panCardNumber']
    })
    if (check.isEmpty(checkStatusCustomer)) {
        return res.status(404).json({ message: "Please proceed after confirming your lead stage status" });
    }
    return res.status(200).json({ message: "Success", customerInfo: checkStatusCustomer });
}


exports.submitCustomerKycinfo = async (req, res, next) => {

    let { firstName, lastName, mobileNumber, panCardNumber } = req.body

    let status = await models.status.findOne({ where: { statusName: "confirm" } })
    if (check.isEmpty(status)) {
        return res.status(404).json({ message: "Status confirm is not there in status table" });
    }
    let statusId = status.id
    let getCustomerInfo = await models.customer.findOne({
        where: { mobileNumber: mobileNumber, statusId },
        attributes: ['id', 'firstName', 'lastName', 'stateId', 'cityId']
    })
    if (check.isEmpty(getCustomerInfo)) {
        return res.status(404).json({ message: "Your status is not confirm" });
    }

    let findCustomerKyc = await models.customerKycPersonalDetail.findOne({ where: { customerId: getCustomerInfo.id } })
    if (!check.isEmpty(findCustomerKyc)) {
        return res.status(404).json({ message: "This customer Kyc information is already created." });
    }
    let createdBy = req.userData.id;
    let modifiedBy = req.userData.id;

    let createCustomerKyc = await models.customerKycPersonalDetail.create({
        customerId: getCustomerInfo.id,
        firstName: getCustomerInfo.firstName,
        lastName: getCustomerInfo.lastName,
        panCardNumber: panCardNumber,
        createdBy,
        modifiedBy
    });
    return res.status(200).json({
        customerId: getCustomerInfo.id,
        customerKycId: createCustomerKyc.id,
        stateId: getCustomerInfo.stateId,
        cityId: getCustomerInfo.cityId
    })
}


exports.submitCustomerKycAddress = async (req, res, next) => {

    let { customerId, customerKycId, identityProof, identityTypeId, address } = req.body

    if(identityProof.length == 0 ){
        return res.status(404).json({ message: "Identity proof file must be required." });
    }
    if(address[0].addressProof.length == 0 || address[1].addressProof.length == 0){
        return res.status(404).json({ message: "Address proof file must be required." });
    }
    let findCustomerKyc = await models.customerKycAddressDetail.findOne({ where: { customerKycId: customerKycId } })

    if (!check.isEmpty(findCustomerKyc)) {
        return res.status(404).json({ message: "This customer address details is already filled." });
    }
    

    let addressArray = []
    for (let i = 0; i < address.length; i++) {

        address[i]['customerId'] = customerId
        address[i]['customerKycId'] = customerKycId
        addressArray.push(address[i])
    }
    let { firstName, lastName } = await models.customerKycPersonalDetail.findOne({ where: { id: customerKycId } })
    let name = `${firstName} ${lastName}`;

    await sequelize.transaction(async t => {
        await models.customerKycPersonalDetail.update({ identityProof: identityProof, identityTypeId: identityTypeId }, { where: { id: customerKycId }, transaction: t });

        await models.customerKycAddressDetail.bulkCreate(addressArray, { returning: true, transaction: t });
    })

    
    return res.status(200).json({ customerId, customerKycId, name })
}


exports.submitCustomerKycPersonalDetail = async (req, res, next) => {

    let { customerId, customerKycId, profileImage, dateOfBirth, alternateMobileNumber, gender, martialStatus, occupationId, spouseName, signatureProof } = req.body

    let customer = await models.customer.findOne({ where: { id: customerId } })

    if (customer.mobileNumber == alternateMobileNumber) {
        return res.status(200).json({ message: "Your alternate Mobile number is same as your previous Mobile bumber " });
    }
    let findAlternateNumberExist = await models.customerKycPersonalDetail.findOne({ where: { alternateMobileNumber } })

    if (!check.isEmpty(findAlternateNumberExist)) {
        return res.status(404).json({ message: "Your alternate Mobile number is already exist." });
    }

    let details = await models.customerKycPersonalDetail.update({
        profileImage: profileImage,
        dateOfBirth: dateOfBirth,
        alternateMobileNumber, alternateMobileNumber,
        gender: gender,
        martialStatus: martialStatus,
        occupationId: occupationId,
        spouseName: spouseName,
        signatureProof: signatureProof
    }, { where: { id: customerKycId } });
    console.log(details)

    return res.status(200).json({ customerId, customerKycId })


}


exports.submitCustomerKycBankDetail = async (req, res, next) => {

    let { customerId, customerKycId, bankName, bankBranchName, accountType, accountHolderName, accountNumber, ifscCode, passbookProof } = req.body
    let findCustomerKyc = await models.customerKycBankDetail.findOne({ where: { customerKycId: customerKycId } })

    if (!check.isEmpty(findCustomerKyc)) {
        return res.status(404).json({ message: "This customer bank details is already filled." });
    }
    await models.customerKycBankDetail.create({
        customerId: customerId,
        customerKycId: customerKycId,
        bankName: bankName,
        bankBranchName: bankBranchName,
        accountType: accountType,
        accountHolderName: accountHolderName,
        accountNumber: accountNumber,
        ifscCode: ifscCode,
        passbookProof: passbookProof
    })

    let customerKycReview = await models.customerKycPersonalDetail.findOne({
        where: { id: customerKycId },
        include: [{
            model: models.customerKycAddressDetail,
            as: 'customerKycAddress'
        }, {
            model: models.customerKycBankDetail,
            as: 'customerKycBank'
        }]
    })

    return res.status(200).json({ customerKycReview, customerId, customerKycId })

}


exports.submitAllKycInfo = async (req, res, next) => {

    let { customerId, customerKycId } = req.body;

    let findCustomerKyc = await models.customerKycPersonalDetail.findOne({ where: { id: customerKycId } })
    if (check.isEmpty(findCustomerKyc)) {
        return res.status(404).json({ message: "This customer kyc detailes is not filled." });
    }
    let abc =await models.customer.update({ isKycSubmitted: true }, { where: { id: customerId } })
    return res.status(200).json({ message: `successful`, customerId, customerKycId })
}

