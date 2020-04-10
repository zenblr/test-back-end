const { body } = require("express-validator");

exports.branchValidation = [

  body("name")
    .exists()
    .withMessage("name is required"),
            
  body("cityId")
    .exists()
    .withMessage("CityId is required")
    .isLength({max:30})
    .withMessage('Maximum length is 30'),

  body("stateId")
    .exists()
    .withMessage("StateId is required")
    .isLength({max:30})
    .withMessage('Maximum length is 30'),

  body("pinCode")
    .exists()
    .withMessage("Pin code is required")
    .custom((value) => {
     var  regex=`([0-9]{6}|[0-9]{3}\s[0-9]{3})`

        if(!regex.test(value)){
          return Promise.reject("Invalid pincode code")
        }  else{
          return true;
        }
        }),

  body("address")
    .exists()
    .withMessage("Address is required")
    .isLength({max:250})
    .withMessage('Maximum length is 250'),

];


