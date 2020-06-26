const { body } = require("express-validator");
const models = require('../models');
const sequelize = models.Sequelize;
const op = sequelize.Op;

exports.getCustomerDetailsValidation = [

    body("mobileNumber")
        .exists()
        .withMessage("mobile Number is required")
        .custom(async value => {

            if (!/^[0-9]{10}$/i.test(value)) {
                return Promise.reject("Invalid mobile number");
            }

        }),
]

// submit customer kyc validation

exports.submitCustomerKycInfoValidation = [

    body("mobileNumber")
        .exists()
        .withMessage("mobile Number is required")
        .custom(async value => {

            if (!/^[0-9]{10}$/i.test(value)) {
                return Promise.reject("Invalid mobile number");
            }

        }),
    // body("panCardNumber")
    //     .exists()
    //     .withMessage("pan card number is required")
    //     .custom(async value => {
    //         if (!/^([a-zA-Z]){5}([0-9]){4}([a-zA-Z]){1}?$/i.test(value)) {
    //             return Promise.reject('Invalid Pan Card Number')
    //         }
    //     })
]

// submit customerKyc address

exports.submitCustomerKycAddressValidation = [
    body("customerId")
        .exists()
        .withMessage('customer id is required'),

    body("customerKycId")
        .exists()
        .withMessage('customer kyc id is required'),

    body("identityProof")
        .exists()
        .withMessage('identity proof is required'),

    body("identityTypeId")
        .exists()
        .withMessage("identity type is required"),

    body("address")
        .exists()
        .withMessage("address is required")

]

//submit customer kyc personal Detail validation

exports.submitCustomerKycpersonalDetailValidation = [
    body("customerId")
        .exists()
        .withMessage("customer id is required"),

    body("customerKycId")
        .exists()
        .withMessage('customer kyc id is required'),

    body("profileImage")
        .exists()
        .withMessage('profile Image is required'),

    body("dateOfBirth")
        .exists()
        .withMessage('date of birth is required'),

    body("alternateMobileNumber")
        .exists()
        .withMessage("mobile Number is required")
        .custom(async value => {

            if (!/^[0-9]{10}$/i.test(value)) {
                return Promise.reject("Invalid alernate  mobile number");
            }

        }),
    body("gender")
        .exists()
        .withMessage("gender is required"),

    body("martialStatus")
        .exists()
        .withMessage("martial status is required"),
    body("spouseName")
        .exists()
        .withMessage("spouse name is required"),
    body("signatureProof")
        .exists()
        .withMessage("sinaguture Proof is required")
]
exports.submitCustomerKycBankDetailValidation = [
    body("customerId")
        .exists()
        .withMessage('customer id is required'),

    body("customerKycId")
        .exists()
        .withMessage('customer kyc id is required'),

    body("bankName")
        .exists()
        .withMessage('bank name is required'),

    body("bankBranchName")
        .exists()
        .withMessage('bank branch name is required'),

    body("accountType")
        .exists()
        .withMessage('account type is required'),

    body("accountHolderName")
        .exists()
        .withMessage('account holder name is required'),

    body("accountNumber")
        .exists()
        .withMessage("account number is required"),

    body("ifscCode")
        .exists()
        .withMessage("ifsc code is required")
        .custom(async value => {
            if (!/^[A-Za-z]{4}[a-zA-Z0-9]{7}$/i.test(value)) {
                return Promise.reject("Invalid ifsc code ")
            }
        }),
    body("passbookProof")
        .exists()
        .withMessage("pass book proof is required"),

]

exports.submitAllKycInfoValidation = [
    body("customerId")
        .exists()
        .withMessage('customer id is required'),

    body("customerKycId")
        .exists()
        .withMessage("customer kyc is required")
]