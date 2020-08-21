const { body } = require("express-validator");
const models = require('../models');

exports.partnerBranchUserValidation = [

    body("firstName")
        .exists()
        .withMessage("first Name is required"),

    body("lastName")
        .exists()
        .withMessage("first Name is required"),

    body("partnerId")
        .exists()
        .withMessage("Partner is required")
        .isInt()
        .withMessage('It should be a number'),

    body("branchId")
        .exists()
        .withMessage("Partner Branch is required")
        .isInt()
        .withMessage('It should be a number'),

    body("pinCode")
        .exists()
        .withMessage("Pin code is required")
        .custom((value) => {

            if (!/^([0-9]{6}|[0-9]{3}\s[0-9]{3})/i.test(value)) {
                return Promise.reject("Invalid pincode")
            } else {
                return true;
            }
        }),
    body("mobileNumber")
        .exists().withMessage("Mobile Number is required"),
    body("email")
        .exists().withMessage(" E-mail is required"),
]