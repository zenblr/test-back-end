const models = require("../../models");
const sequelize = models.sequelize;

const Sequelize = models.Sequelize;
const Op = Sequelize.Op;
const { createReferenceCode } = require("../../utils/referenceCode");

const request = require("request");
const moment = require("moment");
const CONSTANT = require("../../utils/constant");
const uniqid = require('uniqid');
const check = require("../../lib/checkLib");
const { paginationWithFromTo } = require("../../utils/pagination");
let sms = require('../../utils/sendSMS');
let { sendOtpToLeadVerification, sendOtpForLogin, forgetPasswordOtp, sendUpdateLocationCollectMessage, sendUpdateLocationHandoverMessage } = require('../../utils/SMS');
const { VIEW_ALL_CUSTOMER } = require('../../utils/permissionCheck');
const qs = require('qs');
const getMerchantData = require('../auth/getMerchantData')
const jwt = require('jsonwebtoken');
const { JWT_SECRETKEY, JWT_EXPIRATIONTIME_CUSTOMER } = require('../../utils/constant');
const { ADMIN_PANEL, CUSTOMER_WEBSITE } = require('../../utils/sourceFrom')
const { getCustomerCityById, getCustomerStateById } = require('../../service/customerAddress')
const { createCustomer } = require('../../service/digiGold')


exports.getOtp = async (req, res, next) => {
  let getOtp = await models.customerOtp.findAll({
    order: [
      ['id', 'desc']
    ]
  });
  return res.status(200).json({ data: getOtp })
}

exports.addCustomer = async (req, res, next) => {
  let { firstName, lastName, referenceCode, panCardNumber, stateId, cityId, statusId, comment, pinCode, internalBranchId, source, panType, panImage, leadSourceId, moduleId } = req.body;
  // cheanges needed here
  let createdBy = req.userData.id;
  let modifiedBy = req.userData.id;

  let getMobileNumber = await models.customerOtp.findOne({
    where: { referenceCode, isVerified: true },
  });
  if (check.isEmpty(getMobileNumber)) {
    return res.status(404).json({ message: "Your Mobile number is not verified" });
  }
  let mobileNumber = getMobileNumber.mobileNumber;

  let customerExist = await models.customer.findOne({
    where: { mobileNumber: mobileNumber },
  });
  if (!check.isEmpty(customerExist)) {
    return res.status(404).json({ message: "This Mobile number already Exists" });
  }

  let getModulePoint = await models.module.findOne({ where: { id: moduleId } })

  let digiGoldModulePoint = await models.module.findOne({ where: { id: 4 } })

  let modulePoint = getModulePoint.modulePoint | digiGoldModulePoint.modulePoint

  let getStageId = await models.stage.findOne({ where: { stageName: "lead" } });
  let stageId = getStageId.id;
  let email = "nimap@infotech.com";
  let password = `${firstName}@1234`;

  let { sourcePoint } = await models.source.findOne({ where: { sourceName: 'ADMIN_PANEL' } })
  const customerUniqueId = uniqid.time().toUpperCase();

  await sequelize.transaction(async (t) => {
    const customer = await models.customer.create(
      { firstName, lastName, password, mobileNumber, email, panCardNumber, stateId, cityId, stageId, pinCode, internalBranchId, statusId, comment, createdBy, modifiedBy, isActive: true, source, panType, moduleId, panImage, leadSourceId, allModulePoint: modulePoint, sourceFrom: sourcePoint, customerUniqueId },
      { transaction: t }
    );

    // if (moduleId == 1 || moduleId == 3) {
    //   await models.appraiserRequest.create({ customerId: customer.id, moduleId, createdBy, modifiedBy }, { transaction: t })
    // }

    const merchantData = await getMerchantData();


    let state = await getCustomerStateById(stateId, null);
    let city = await getCustomerCityById(cityId, null);

    const data = qs.stringify({
      'mobileNumber': mobileNumber,
      // 'emailId': email,
      'uniqueId': customerUniqueId,
      'userName': firstName + " " + lastName,
      // 'userAddress': address,
      'userCity': city.cityUniqueCode,
      // 'userState': stateId,
      'userState': state.stateUniqueCode,
      // 'userPincode': pinCode,
      // 'dateOfBirth':dateOfBirth,
      // 'gender':gender,
      // 'utmSource': utmSource,
      // 'utmMedium': utmMedium,
      // 'utmCampaign': utmCampaign
    })

    // const result = await models.axios({
    //   method: 'POST',
    //   url: `${process.env.DIGITALGOLDAPI}/merchant/v1/users/`,
    //   headers: {
    //     'Content-Type': 'application/x-www-form-urlencoded',
    //     'Authorization': `Bearer ${merchantData.accessToken}`,
    //   },
    //   data: data
    // });

    if (panCardNumber != null && panImage != null) {
      await models.digiKycApplied.create({ customerId: customer.id, status: 'pending' })

      await models.customer.update({ digiKycStatus: 'waiting' }, { where: { id: customer.id }, transaction: t })
    }

    const result = await createCustomer(data)

    if (!result.isSuccess) {
      t.rollback()
      return res.status(422).json({ err: result.message });
    }


  });
  return res.status(200).json({ messgae: `Customer created` });
};


exports.registerCustomerSendOtp = async (req, res, next) => {
  const { mobileNumber, firstName } = req.body;

  let customerExist = await models.customer.findOne({
    where: { mobileNumber, isActive: true },
  });

  if (!check.isEmpty(customerExist)) {
    return res.status(200).json({ message: `Mobile number is already exist.` });
  }

  await models.customerOtp.destroy({ where: { mobileNumber } });

  const referenceCode = await createReferenceCode(5);
  let otp;
  if (process.env.NODE_ENV == "development" || process.env.NODE_ENV == "test" || process.env.NODE_ENV == "new") {
    otp = 1234
  } else {
    otp = Math.floor(1000 + Math.random() * 9000);
  }
  let createdTime = new Date();
  let expiryTime = moment(createdTime).add(10, "m");

  await models.customerOtp.create({ mobileNumber, otp, createdTime, expiryTime, referenceCode, });
  var expiryTimeToUser = moment(moment(expiryTime).utcOffset("+05:30"))
  await sendOtpToLeadVerification(mobileNumber, firstName, otp, expiryTimeToUser)

  // let message = await `Dear customer, Your OTP for completing the order request is ${otp}.`
  // await sms.sendSms(mobileNumber, message);


  return res.status(200).json({ message: `OTP has been sent to registered mobile number.`, referenceCode, });
};

exports.customerSignUp = async (req, res, next) => {

  const { mobileNumber, firstName } = req.body;
  let customerExist = await models.customer.findOne({
    where: { mobileNumber, isActive: true },
  });

  if (check.isEmpty(customerExist)) {

    //To check in Registered customer from customer website
    // let registerCustomerExist = await models.customerRegister.findOne({
    //   where: { mobileNumber: mobileNumber },
    // });
    // if (!check.isEmpty(registerCustomerExist)) {
    //   return res.status(404).json({ message: "You have already applied for the registration." });
    // }

    await models.customerOtp.destroy({ where: { mobileNumber } });

    const referenceCode = await createReferenceCode(5);
    let otp;
    if (process.env.NODE_ENV == "development" || process.env.NODE_ENV == "test" || process.env.NODE_ENV == "new") {
      otp = 1234
    } else {
      otp = Math.floor(1000 + Math.random() * 9000);
    }
    let createdTime = new Date();
    let expiryTime = moment(createdTime).add(10, "m");

    await models.customerOtp.create({ mobileNumber, otp, createdTime, expiryTime, referenceCode, });
    var expiryTimeToUser = moment(moment(expiryTime).utcOffset("+05:30"))
    await sendOtpToLeadVerification(mobileNumber, 'customer', otp, expiryTimeToUser)

    return res.status(200).json({ message: `OTP has been sent to registered mobile number.`, referenceCode, isCustomer: false });
  } else {

    const referenceCode = await createReferenceCode(5);
    let otp;
    if (process.env.NODE_ENV == "development" || process.env.NODE_ENV == "test" || process.env.NODE_ENV == "new") {
      otp = 1234
    } else {
      otp = Math.floor(1000 + Math.random() * 9000);
    }
    let createdTime = new Date();
    let expiryTime = moment(createdTime).add(10, "m");
    await models.customerOtp.create({ mobileNumber, otp, createdTime, expiryTime, referenceCode });
    expiryTime = moment(moment(expiryTime).utcOffset("+05:30"))
    let smsLink = process.env.BASE_URL_CUSTOMER
    await sendOtpForLogin(customerExist.mobileNumber, customerExist.firstName, otp, expiryTime, smsLink)

    return res.status(200).json({ message: `OTP has been sent to registered mobile number.`, referenceCode, isCustomer: true });

  }

}


exports.sendOtp = async (req, res, next) => {
  const { mobileNumber, type, id } = req.body;

  let customerExist = await models.customer.findOne({
    where: { mobileNumber, isActive: true },
  });

  if (check.isEmpty(customerExist)) {
    return res.status(200).json({ message: `Mobile number is not Exist.` });
  }

  await models.customerOtp.destroy({ where: { mobileNumber } });

  const referenceCode = await createReferenceCode(5);
  let otp;
  if (process.env.NODE_ENV == "development" || process.env.NODE_ENV == "test" || process.env.NODE_ENV == "new") {
    otp = 1234
  } else {
    // otp = Math.floor(1000 + Math.random() * 9000);
    otp = 1234
  }
  let createdTime = new Date();
  let expiryTime = moment(createdTime).add(10, "m");
  await models.customerOtp.create({ mobileNumber, otp, createdTime, expiryTime, referenceCode, });
  expiryTime = moment(moment(expiryTime).utcOffset("+05:30"));

  if (type == "login") {
    let smsLink = process.env.BASE_URL_CUSTOMER
    await sendOtpForLogin(customerExist.mobileNumber, customerExist.firstName, otp, expiryTime, smsLink)
  } else if (type == "forget") {
    let smsLink = process.env.BASE_URL_CUSTOMER
    await forgetPasswordOtp(customerExist.mobileNumber, customerExist.firstName, otp, expiryTime, smsLink)
  } else if (type == "updateLocationCollect") {
    let receiverUser = await models.user.findOne({ where: { id: id } })
    await sendUpdateLocationCollectMessage(customerExist.mobileNumber, otp, customerExist.firstName, receiverUser.firstName);
  } if (type == "updateLocationHandover") {
    let receiverUser = await models.user.findOne({ where: { id: id } })
    await sendUpdateLocationHandoverMessage(customerExist.mobileNumber, otp, customerExist.firstName, receiverUser.firstName);
  }

  // let message = await `Dear customer, Your OTP for completing the order request is ${otp}.`
  // await sms.sendSms(mobileNumber, message);
  // request(
  //   `${CONSTANT.SMSURL}username=${CONSTANT.SMSUSERNAME}&password=${CONSTANT.SMSPASSWORD}&type=0&dlr=1&destination=${mobileNumber}&source=nicalc&message=For refrence code ${referenceCode} your OTP is ${otp}. This otp is valid for only 10 minutes`
  // );

  return res
    .status(200)
    .json({
      message: `OTP has been sent to registered mobile number.`,
      referenceCode,
    });
};


exports.verifyOtp = async (req, res, next) => {
  let { referenceCode, otp } = req.body;
  var todayDateTime = new Date();
  // console.log('abc')
  let verifyUser = await models.customerOtp.findOne({
    where: {
      referenceCode,
      otp,
      expiryTime: {
        [Op.gte]: todayDateTime,
      },
    },
  });
  if (check.isEmpty(verifyUser)) {
    return res.status(404).json({ message: `INVALID OTP.` });
  }

  let verifyFlag = await models.customerOtp.update(
    { isVerified: true },
    { where: { id: verifyUser.id } }
  );

  return res.status(200).json({ message: "Success", referenceCode });
};


exports.editCustomer = async (req, res, next) => {
  // changes need here
  let modifiedBy = req.userData.id;
  const { customerId } = req.params;

  let { cityId, stateId, pinCode, internalBranchId, statusId, comment, source, panType, panCardNumber, panImage, leadSourceId, moduleId } = req.body;
  let { id } = await models.status.findOne({ where: { statusName: "confirm" } })

  let customerExist = await models.customer.findOne({ where: { id: customerId } });
  if (id == customerExist.statusId) {
    return res.status(400).json({ message: `This customer status is confirm, You cannot change any information of that customer.` })
  }
  if (check.isEmpty(customerExist)) {
    return res.status(404).json({ message: "Customer does not exist" });
  }
  await sequelize.transaction(async (t) => {
    const customer = await models.customer.update(
      { cityId, stateId, statusId, comment, pinCode, internalBranchId, modifiedBy, source, panType, panCardNumber, panImage, leadSourceId },
      { where: { id: customerId }, transaction: t }
    );
  });
  return res.status(200).json({ messgae: `User Updated` });
};

exports.addBranch = async (req, res, next) => {

  let { internalBranchId, customerId } = req.body
  let modifiedBy = req.userData.id
  let findClassification = await models.customerKycClassification.findOne({ where: { customerId: customerId } })


  await sequelize.transaction(async (t) => {

    const customer = await models.customer.update(
      { internalBranchId },
      { where: { id: customerId }, transaction: t }
    );

    if (!check.isEmpty(findClassification)) {
      await models.customerKyc.update(
        { isVerifiedByCce: true, modifiedByCustomer: customerId, isKycSubmitted: true, isScrapKycSubmitted: true },
        { where: { customerId: customerId }, transaction: t })

      await models.customerKycClassification.update({ kycRatingFromCce: 4, kycStatusFromCce: "approved", modifiedBy }, { where: { customerId }, transaction: t })
    }

  })

  return res.status(200).json({ message: 'Success' })

}

exports.deactivateCustomer = async (req, res, next) => {
  const { customerId, isActive } = req.query;
  let customerExist = await models.customer.findOne({
    where: { id: customerId },
  });
  if (check.isEmpty(customerExist)) {
    return res.status(404).json({ message: "Customer is not exist" });
  }
  await models.customer.update(
    { isActive: isActive },
    { where: { id: customerId } }
  );
  return res.status(200).json({ message: `Updated` });
};


exports.getAllCustomersForLead = async (req, res, next) => {
  let { stageName, cityId, stateId, statusId, modulePoint, completeKycModule } = req.query;
  const { search, offset, pageSize } = paginationWithFromTo(
    req.query.search,
    req.query.from,
    req.query.to
  );

  // let stage = await models.stage.findOne({ where: { stageName } });

  let query = {};
  if (cityId) {
    cityId = req.query.cityId.split(",");
    query.cityId = cityId;
  }
  if (statusId) {
    statusId = req.query.statusId.split(",");
    query.statusId = statusId;
  }
  if (stateId) {
    stateId = req.query.stateId.split(",");
    query.stateId = stateId;
  }

  const searchQuery = {
    [Op.and]: [query, {
      [Op.or]: {
        first_name: { [Op.iLike]: search + "%" },
        last_name: { [Op.iLike]: search + "%" },
        mobile_number: { [Op.iLike]: search + "%" },
        pan_card_number: { [Op.iLike]: search + "%" },
        pinCode: sequelize.where(
          sequelize.cast(sequelize.col("customer.pin_code"), "varchar"),
          {
            [Op.iLike]: search + "%"
          },
        ),
        "$internalBranch.name$": {
          [Op.iLike]: search + "%",
        },
        "$status.status_name$": {
          [Op.iLike]: search + "%",
        },
        "$city.name$": {
          [Op.iLike]: search + "%",
        },
        "$state.name$": {
          [Op.iLike]: search + "%",
        },
        "$module.module_name$": {
          [Op.iLike]: search + "%",
        },
      },
    }],
    isActive: true,
  };

  if (!check.isEmpty(modulePoint)) {
    let moduleArray = modulePoint.split(',')
    if (moduleArray.length == 1) {
      query.all_module_point = Sequelize.or(
        Sequelize.where(Sequelize.literal(`all_module_point & ${moduleArray[0]}`), '!=', 0)
      )
    } else if (moduleArray.length == 2) {
      query.all_module_point = Sequelize.or(
        Sequelize.where(Sequelize.literal(`all_module_point & ${moduleArray[0]}`), '!=', 0),
        Sequelize.where(Sequelize.literal(`all_module_point & ${moduleArray[1]}`), '!=', 0)
      )
    } else if (moduleArray.length == 3) {
      query.all_module_point = Sequelize.or(
        Sequelize.where(Sequelize.literal(`all_module_point & ${moduleArray[0]}`), '!=', 0),
        Sequelize.where(Sequelize.literal(`all_module_point & ${moduleArray[1]}`), '!=', 0),
        Sequelize.where(Sequelize.literal(`all_module_point & ${moduleArray[2]}`), '!=', 0)
      )
    } else if (moduleArray.length == 4) {
      query.all_module_point = Sequelize.or(
        Sequelize.where(Sequelize.literal(`all_module_point & ${moduleArray[0]}`), '!=', 0),
        Sequelize.where(Sequelize.literal(`all_module_point & ${moduleArray[1]}`), '!=', 0),
        Sequelize.where(Sequelize.literal(`all_module_point & ${moduleArray[2]}`), '!=', 0),
        Sequelize.where(Sequelize.literal(`all_module_point & ${moduleArray[3]}`), '!=', 0)
      )
    }
  }

  if (!check.isEmpty(completeKycModule)) {
    let completeKycModuleArray = completeKycModule.split(',')
    if (completeKycModuleArray.length == 1) {
      query.kyc_complete_point = Sequelize.or(
        Sequelize.where(Sequelize.literal(`kyc_complete_point & ${completeKycModuleArray[0]}`), '!=', 0)
      )
    } else if (completeKycModuleArray.length == 2) {
      query.kyc_complete_point = Sequelize.or(
        Sequelize.where(Sequelize.literal(`kyc_complete_point & ${completeKycModuleArray[0]}`), '!=', 0),
        Sequelize.where(Sequelize.literal(`kyc_complete_point & ${completeKycModuleArray[1]}`), '!=', 0)
      )
    } else if (completeKycModuleArray.length == 3) {
      query.kyc_complete_point = Sequelize.or(
        Sequelize.where(Sequelize.literal(`kyc_complete_point & ${completeKycModuleArray[0]}`), '!=', 0),
        Sequelize.where(Sequelize.literal(`kyc_complete_point & ${completeKycModuleArray[1]}`), '!=', 0),
        Sequelize.where(Sequelize.literal(`kyc_complete_point & ${completeKycModuleArray[2]}`), '!=', 0)
      )
    } else if (completeKycModuleArray.length == 4) {
      query.kyc_complete_point = Sequelize.or(
        Sequelize.where(Sequelize.literal(`kyc_complete_point & ${completeKycModuleArray[0]}`), '!=', 0),
        Sequelize.where(Sequelize.literal(`kyc_complete_point & ${completeKycModuleArray[1]}`), '!=', 0),
        Sequelize.where(Sequelize.literal(`kyc_complete_point & ${completeKycModuleArray[2]}`), '!=', 0),
        Sequelize.where(Sequelize.literal(`kyc_complete_point & ${completeKycModuleArray[3]}`), '!=', 0)
      )
    }
  }

  let includeArray = [{
    model: models.customerKyc,
    as: "customerKyc",
    attributes: ['isKycSubmitted', 'isScrapKycSubmitted']
  }, {
    model: models.state,
    as: "state",
  },
  {
    model: models.city,
    as: "city",
  },
  // {
  //   model: models.stage,
  //   as: "stage",
  //   where: { id: stage.id },
  // },
  {
    model: models.status,
    as: "status",
  },
  {
    model: models.internalBranch,
    as: "internalBranch"
  },
  {
    model: models.lead,
    as: "lead",
    attributes: ['id', 'leadName'],
  },
  {
    model: models.module,
    as: 'module',
    attributes: ['id', 'moduleName']
  }

  ]
  let internalBranchId = req.userData.internalBranchId
  if (!check.isPermissionGive(req.permissionArray, VIEW_ALL_CUSTOMER)) {
    searchQuery.internalBranchId = internalBranchId
  }

  // if (req.userData.userTypeId != 4) {
  // }

  let allCustomers = await models.customer.findAll({
    where: searchQuery,
    attributes: { exclude: ['createdBy', 'modifiedBy', 'isActive'] },
    order: [["updatedAt", "desc"]],
    offset: offset,
    limit: pageSize,
    include: includeArray,
  });
  let count = await models.customer.findAll({
    where: searchQuery,
    include: includeArray,
  });
  if (allCustomers.length == 0) {
    return res.status(200).json({ data: [] });
  }
  return res.status(200).json({ count: count.length, data: allCustomers });
};


exports.getSingleCustomer = async (req, res, next) => {
  const { customerId } = req.params;
  let singleCustomer = await models.customer.findOne({
    where: {
      id: customerId,
    },
    include: [
      {
        model: models.state,
        as: "state",
      },
      {
        model: models.module,
        as: "module",
      },
      {
        model: models.city,
        as: "city",
      },
      {
        model: models.stage,
        as: "stage",
      },
      {
        model: models.status,
        as: "status",
      },
      {
        model: models.lead,
        as: "lead",
        attributes: ['id', 'leadName']
      }
    ],
  });
  if (check.isEmpty(singleCustomer)) {
    return res.status(404).json({ message: "Customer not found" });
  }
  return res.status(200).json({ singleCustomer })
};


exports.getCustomerUniqueId = async (req, res) => {
  let customer = await models.customer.findAll({
    attributes: ['id', 'customerUniqueId', 'firstName', 'lastName'],
    where: { kycStatus: "approved" }
  })
  let assignCustomer = await models.customerAssignAppraiser.findAll({
    attributes: ['id', 'customerUniqueId']
  })
  let arrayDiff = function (a, b) {
    return a.filter(function (i) { return !b.find((c) => { return c.customerUniqueId == i.customerUniqueId }) });
  };
  let getDiff = (a, b) => {
    let c = arrayDiff(a, b);
    let d = arrayDiff(b, a);
    return [...c, ...d]
  }

  let diff = getDiff(customer, assignCustomer)
  return res.status(200).json({ data: diff })
}


exports.getAllCustomerForCustomerManagement = async (req, res) => {
  let { cityId, stateId } = req.query;

  const { search, offset, pageSize } = paginationWithFromTo(
    req.query.search,
    req.query.from,
    req.query.to
  );
  let stageId = await models.loanStage.findOne({ where: { name: 'disbursed' } })

  let query = {};
  if (cityId) {
    cityId = req.query.cityId.split(",");
    query.cityId = cityId;
  }
  if (stateId) {
    stateId = req.query.stateId.split(",");
    query.stateId = stateId;
  }

  const searchQuery = {
    [Op.and]: [query, {
      [Op.or]: {
        first_name: { [Op.iLike]: search + "%" },
        last_name: { [Op.iLike]: search + "%" },
        customer_unique_id: { [Op.iLike]: search + "%" },
        mobile_number: { [Op.iLike]: search + "%" },
        pan_card_number: { [Op.iLike]: search + "%" },
        "$city.name$": {
          [Op.iLike]: search + "%",
        },
        "$state.name$": {
          [Op.iLike]: search + "%",
        }
      },
    }],
    isActive: true,
  };

  let includeArray = [{
    model: models.customerLoanMaster,
    as: 'masterLoan',
    where: { isLoanCompleted: true },
    attributes: [],
  }, {
    model: models.state,
    as: "state",
  }, {
    model: models.city,
    as: "city",
  }, {
    model: models.customerKycPersonalDetail,
    as: 'customerKycPersonal',
    attributes: ['profileImage']
  }]
  let internalBranchId = req.userData.internalBranchId

  if (!check.isPermissionGive(req.permissionArray, VIEW_ALL_CUSTOMER)) {
    searchQuery.internalBranchId = internalBranchId
  }

  // if (req.userData.userTypeId != 4) {
  //   searchQuery.internalBranchId = internalBranchId
  // }

  let allCustomers = await models.customer.findAll({
    where: searchQuery,
    attributes: { exclude: ['mobileNumber', 'createdAt', 'updatedAt', 'createdBy', 'modifiedBy', 'isActive'] },
    order: [["id", "DESC"]],
    offset: offset,
    subQuery: false,
    limit: pageSize,
    include: includeArray,
  });
  let count = await models.customer.findAll({
    where: searchQuery,
    include: includeArray,
    subQuery: false
  });
  if (allCustomers.length === 0) {
    return res.status(200).json({ data: [] });
  } else {
    return res.status(200).json({ message: 'Success', data: allCustomers, count: count.length });
  }
}


exports.getsingleCustomerManagement = async (req, res) => {
  const { customerId } = req.params;
  let stageId = await models.loanStage.findOne({ where: { name: 'disbursed' } })
  let singleCustomer = await models.customer.findOne({
    where: { id: customerId },
    include: [
      {
        model: models.customerKycPersonalDetail,
        as: 'customerKycPersonal',
        include: [{
          model: models.identityType,
          as: 'identityType',
          attributes: ['id', 'name']
        }]
      },
      {
        model: models.customerKycAddressDetail,
        as: 'customerKycAddress',
        include: [{
          model: models.state,
          as: "state"
        }, {
          model: models.city,
          as: "city"
        }]
      },
      {
        model: models.customerLoanMaster,
        as: 'masterLoan',
        where: { isLoanCompleted: true },
        order: [
          [models.customerLoan, 'id', 'asc'],
          ['id', 'DESC']
        ],
        include: [
          {
            model: models.customerLoan,
            as: 'customerLoan',
            where: { isActive: true }
          }, {
            model: models.customerLoanNomineeDetail,
            as: 'loanNomineeDetail'
          },
          {
            model: models.partRelease,
            as: 'partRelease',
            attributes: ['amountStatus', 'partReleaseStatus']
          },
          {
            model: models.fullRelease,
            as: 'fullRelease',
            attributes: ['amountStatus', 'fullReleaseStatus']
          },
          {
            model: models.customerLoanMaster,
            as: 'parentLoan',
            attributes: ['id'],
            order: [
              [models.customerLoan, 'id', 'asc'],
              ['id', 'DESC']
            ],
            include: [
              {
                model: models.customerLoan,
                as: 'customerLoan',
                attributes: ['id', 'loanUniqueId'],
                where: { isActive: true }
              }]
          }
        ]
      }
    ]
  })

  return res.status(200).json({ message: "Success", data: singleCustomer })
}

//To register customer by their own
exports.signUpCustomer = async (req, res) => {
  let { firstName, lastName, mobileNumber, email, referenceCode, otp, stateId, cityId, dateOfBirth, age } = req.body;
  let { sourcePoint } = await models.source.findOne({ where: { sourceName: 'CUSTOMER_WEBSITE' } })
  var todayDateTime = new Date();
  // console.log('abc')
  let verifyUser = await models.customerOtp.findOne({
    where: {
      referenceCode,
      otp,
      expiryTime: {
        [Op.gte]: todayDateTime,
      },
    },
  });
  if (check.isEmpty(verifyUser)) {
    return res.status(404).json({ message: `INVALID OTP.` });
  }

  let verifyFlag = await models.customerOtp.update(
    { isVerified: true },
    { where: { id: verifyUser.id } }
  );

  //To check in customer table 
  let customerExist = await models.customer.findOne({
    where: { mobileNumber: mobileNumber },
  });
  if (!check.isEmpty(customerExist)) {
    return res.status(404).json({ message: "This Mobile number already Exists" });
  }

  //To check in Registered customer from customer website
  // let registerCustomerExist = await models.customerRegister.findOne({
  //   where: { mobileNumber: mobileNumber },
  // });
  // if (!check.isEmpty(registerCustomerExist)) {
  //   return res.status(404).json({ message: "This Mobile number already Exists" });
  // }

  const customerUniqueId = uniqid.time().toUpperCase();
  const merchantData = await getMerchantData();

  let isFromApp = false
  if (req.useragent.isMobile) {
    isFromApp = true
  }

  // let createdCustomer = await models.customerRegister.create({ firstName, lastName, email, mobileNumber, isFromApp, isActive: true });
  let createdBy = 1;
  let modifiedBy = 1;
  let status = await models.status.findOne({ where: { statusName: "confirm" } })
  let data = await sequelize.transaction(async (t) => {

    let modulePoint = await models.module.findOne({ where: { id: 4 }, transaction: t })

    let customer = await models.customer.create(
      { customerUniqueId, firstName, lastName, mobileNumber, email, isActive: true, merchantId: merchantData.id, moduleId: 4, stateId, cityId, createdBy, modifiedBy, allModulePoint: modulePoint.modulePoint, statusId: status.id, sourceFrom: sourcePoint, dateOfBirth, age },
      { transaction: t }
    );
    let state = await getCustomerStateById(stateId, null);
    let city = await getCustomerCityById(cityId, null);

    const data = qs.stringify({
      'mobileNumber': mobileNumber,
      // 'emailId': email,
      'uniqueId': customerUniqueId,
      'userName': firstName + " " + lastName,
      // 'userAddress': address,
      'userCity': city.cityUniqueCode,
      // 'userState': stateId,
      'userState': state.stateUniqueCode,
      // 'userPincode': pinCode,
      // 'dateOfBirth':dateOfBirth,
      // 'gender':gender,
      // 'utmSource': utmSource,
      // 'utmMedium': utmMedium,
      // 'utmCampaign': utmCampaign
    })
    // const result = await models.axios({
    //   method: 'POST',
    //   url: `${process.env.DIGITALGOLDAPI}/merchant/v1/users/`,
    //   headers: {
    //     'Content-Type': 'application/x-www-form-urlencoded',
    //     'Authorization': `Bearer ${merchantData.accessToken}`,
    //   },
    //   data: data
    // });

    const result = await createCustomer(data)

    if (!result.isSuccess) {
      t.rollback()
      return res.status(422).json({ err: result.message });
    }

    Token = jwt.sign({
      id: customer.dataValues.id,
      mobile: customer.dataValues.mobileNumber,
      firstName: customer.dataValues.firstName,
      lastName: customer.dataValues.lastName,
      userBelongsTo: "customer"
    },
      JWT_SECRETKEY, {
      expiresIn: JWT_EXPIRATIONTIME_CUSTOMER
    });

    const decoded = jwt.verify(Token, JWT_SECRETKEY);
    const createdTime = new Date(decoded.iat * 1000).toGMTString();
    const expiryTime = new Date(decoded.exp * 1000).toGMTString();

    await models.customer.update({ lastLogin: createdTime }, {
      where: { id: decoded.id }, transaction: t
    });
    let x = await models.customerLogger.create({
      customerId: decoded.id,
      token: Token,
      expiryDate: expiryTime,
      createdDate: createdTime
    }, { transaction: t });
    return { Token }
  })

  return res.status(200).json({ messgae: `Successfully Logged In`, token: data.Token });


}


//To get all registered customer
exports.getAllRegisteredCustomer = async (req, res) => {
  const { search, offset, pageSize } = paginationWithFromTo(
    req.query.search,
    req.query.from,
    req.query.to
  );
  let query = {};
  const searchQuery = {
    [Op.and]: [query, {
      [Op.or]: {
        mobile_number: { [Op.iLike]: search + "%" },
      },
    }],
    isActive: true,
  };

  let allCustomers = await models.customerRegister.findAll({
    where: searchQuery,
    attributes: { exclude: ['createdAt', 'updatedAt', 'createdBy', 'modifiedBy', 'isActive'] },
    order: [["id", "DESC"]],
    subQuery: false,
    offset: offset,
    limit: pageSize,
  });

  let count = await models.customerRegister.findAll({
    where: searchQuery,
    subQuery: false
  });

  if (allCustomers.length === 0) {
    return res.status(200).json({ data: [] });
  } else {
    return res.status(200).json({ message: 'Success', data: allCustomers, count: count.length });
  }
}

exports.getProductRequest = async (req, res, next) => {

  const { search, offset, pageSize } = paginationWithFromTo(
    req.query.search,
    req.query.from,
    req.query.to
  );

  let includeArray = [
    {
      model: models.customer,
      as: 'customer',
      include: [
        {
          model: models.state,
          as: 'state'
        },
        {
          model: models.city,
          as: 'city'
        }
      ]
    },
    {
      model: models.module,
      as: 'module'
    }
  ]

  let getAllProductRequest = await models.productRequest.findAll({
    // where: searchQuery,
    attributes: { exclude: ['createdBy', 'modifiedBy', 'isActive'] },
    order: [["createdAt", "desc"]],
    offset: offset,
    limit: pageSize,
    include: includeArray,
  });
  let getAllProductRequestCount = await models.productRequest.findAll({
    // where: searchQuery,
    include: includeArray,
  });

  if (allCustomers.length == 0) {
    return res.status(200).json({ data: [] });
  }
  return res.status(200).json({ count: getAllProductRequestCount.length, data: getAllProductRequest });

}