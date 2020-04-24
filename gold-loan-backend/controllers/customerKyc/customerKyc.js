const models = require('../../models');
const sequelize = models.sequelize;
const Sequelize = models.Sequelize;
const Op = Sequelize.Op;
const request = require("request");
const { createReferenceCode } = require("../../utils/referenceCode");
const CONSTANT = require("../../utils/constant");
const moment = require("moment");

const check = require("../../lib/checkLib");



exports.verifyCustomerKycNumber = async (req, res, next) => {

    let { mobileNumber } = req.body
    let numberExistInCustomer = await models.customer.findOne({ where: { mobileNumber } })
    if (check.isEmpty(numberExistInCustomer)) {
        return res.status(404).json({ message: "Your Mobile number is not exist. please first apply for lead stage" });
    }
    let status = await models.status.findOne({ where: { statusName: "confirm" } })
    if (check.isEmpty(status)) {
        return res.status(404).json({ message: "Status confirm is not there in status table" });
    }
    let statusId = status.id
    let checkStatusCustomer = await models.customer.findOne({ where: { statusId, id: numberExistInCustomer.id } })
    if (check.isEmpty(checkStatusCustomer)) {
        return res.status(404).json({ message: "Please proceed after confirming your lead stage status" });
    }
    await models.customerOtp.destroy({ where: { mobileNumber } });

    const referenceCode = await createReferenceCode(5);
    let otp = Math.floor(1000 + Math.random() * 9000);
    let createdTime = new Date();
    let expiryTime = moment.utc(createdTime).add(10, "m");

    await models.customerOtp.create({ mobileNumber, otp, createdTime, expiryTime, referenceCode });
    request(
        `${CONSTANT.SMSURL}username=${CONSTANT.SMSUSERNAME}&password=${CONSTANT.SMSPASSWORD}&type=0&dlr=1&destination=${mobileNumber}&source=nicalc&message=For refrence code ${referenceCode} your OTP is ${otp}`
    );

    return res.status(200).json({ message: `Otp send to your entered mobile number.`, referenceCode, });
}


exports.submitCustomerKycinfo = async (req, res, next) => {
    let { referenceCode } = req.body

    let verifyCustomer = await models.customerOtp.findOne({ where: { referenceCode, isVerified: true } });
    if (check.isEmpty(verifyCustomer)) {
        return res.status(404).json({ message: "Your Mobile Number is not verified" });
    }
    let status = await models.status.findOne({ where: { statusName: "confirm" } })
    if (check.isEmpty(status)) {
        return res.status(404).json({ message: "Status confirm is not there in status table" });
    }
    let statusId = status.id
    let getCustomerInfo = await models.customer.findOne({ where: { mobileNumber: verifyCustomer.mobileNumber, statusId } })
    if (check.isEmpty(getCustomerInfo)) {
        return res.status(404).json({ message: "Your status is not confirm" });
    }
    let { id, firstName, lastName, panCardNumber } = getCustomerInfo

    let findCustomerKyc = await models.kycCustomerPersonalDetail.findOne({ where: { customerId: id } })
    if (!check.isEmpty(findCustomerKyc)) {
        return res.status(404).json({ message: "Info is already created." });
    }
    let createdBy = req.userData.id;
    let modifiedBy = req.userData.id;

    let createCustomerKyc = await models.kycCustomerPersonalDetail.create({ customerId: id, firstName, lastName, panCardNumber, createdBy, modifiedBy });
    return res.status(200).json({ customerId: id, customerKycId: createCustomerKyc.id })
}


exports.submitCustomerKycAddress = async (req, res, next) => {

    let { customerId, customerKycId, identityProof, identityTypeId, address } = req.body

    let findCustomerKyc = await models.kycCustomerAddressDetail.findOne({ where: { customerKycId: customerKycId } })

    if (!check.isEmpty(findCustomerKyc)) {
        return res.status(404).json({ message: "This customer address details is already filled." });
    }

    let addressArray = []
    for (let i = 0; i < address.length; i++) {

        address[i]['customerId'] = customerId
        address[i]['customerKycId'] = customerKycId
        addressArray.push(address[i])
    }

    await sequelize.transaction(async t => {
        await models.kycCustomerPersonalDetail.update({ identityProof: identityProof, identityTypeId: identityTypeId }, { where: { id: customerKycId }, transaction: t });

        await models.kycCustomerAddressDetail.bulkCreate(addressArray, { returning: true, transaction: t });
    })
    return res.status(200).json({ customerId, customerKycId })
}


exports.submitCustomerKycPersonalDetail = async (req, res, next) => {

    let { customerId, customerKycId, profileImage, dateOfBirth, alternateMobileNumber, gender, martialStatus, occupationId, spouseName, signatureProof } = req.body

    let customer = await models.customer.findOne({ where: { id: customerId } })

    if (customer.mobileNumber == alternateMobileNumber) {
        return res.status(200).json({ message: "Your alternate Mobile number is same as your previous Mobile bumber " });
    }
    let findAlternateNumberExist = await models.kycCustomerPersonalDetail.findOne({ where: { alternateMobileNumber } })

    if (!check.isEmpty(findAlternateNumberExist)) {
        return res.status(404).json({ message: "Your alternate Mobile number is already exist." });
    }

    let details = await models.kycCustomerPersonalDetail.update({
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

    let { customerId, customerKycId, bankName, bankBranchName, accountType, accountHolderName, accountNumber, ifcCode, passbookProof } = req.body
    let findCustomerKyc = await models.kycCustomerBankDetail.findOne({ where: { customerKycId: customerKycId } })

    if (!check.isEmpty(findCustomerKyc)) {
        return res.status(404).json({ message: "This customer bank details is already filled." });
    }
    await models.kycCustomerBankDetail.create({
        customerId: customerId,
        customerKycId: customerKycId,
        bankName: bankName,
        bankBranchName: bankBranchName,
        accountType: accountType,
        accountHolderName: accountHolderName,
        accountNumber: accountNumber,
        ifcCode: ifcCode,
        passbookProof: passbookProof
    })

    let customerKycReview = await models.kycCustomerPersonalDetail.findOne({
        where: { id: customerKycId },
        include: [{
            model: models.kycCustomerAddressDetail,
            as: 'customerKycAddress'
        }, {
            model: models.kycCustomerBankDetail,
            as: 'customerKycBank'
        }]
    })

    return res.status(200).json({ customerKycReview })

}


// exports.submitKyc = async (req, res, next) => {
//     let { customerId, customerKycId } = req.body;

// }