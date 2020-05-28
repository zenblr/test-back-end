const models = require("../../models");
const sequelize = models.sequelize;

const Sequelize = models.Sequelize;
const Op = Sequelize.Op;
const { createReferenceCode } = require("../../utils/referenceCode");

const request = require("request");
const moment = require("moment");
const CONSTANT = require("../../utils/constant");

const check = require("../../lib/checkLib");
const { paginationWithFromTo } = require("../../utils/pagination");


exports.addCustomer = async (req, res, next) => {
  let { firstName, lastName, referenceCode, panCardNumber, stateId, cityId, address, statusId, comment, pinCode, internalBranchId } = req.body;
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

  let getStageId = await models.stage.findOne({ where: { stageName: "lead" } });
  let stageId = getStageId.id;
  let email = "nimap@infotech.com";
  let password = `${firstName}@1234`;

  await sequelize.transaction(async (t) => {
    const customer = await models.customer.create(
      { firstName, lastName, password, mobileNumber, email, panCardNumber, stateId, cityId, stageId, pinCode, internalBranchId, statusId, comment, createdBy, modifiedBy, isActive: true },
      { transaction: t }
    );
    if (check.isEmpty(address.length)) {
      for (let i = 0; i < address.length; i++) {
        let data = await models.customerAddress.create(
          {
            customerId: customer.id,
            address: address[i].address,
            landMark: address[i].landMark,
            stateId: address[i].stateId,
            cityId: address[i].cityId,
            postalCode: address[i].postalCode,
          },
          { transaction: t }
        );
      }
    }
  });
  return res.status(200).json({ messgae: `Customer created` });
};


exports.registerCustomerSendOtp = async (req, res, next) => {
  const { mobileNumber } = req.body;

  let customerExist = await models.customer.findOne({
    where: { mobileNumber, isActive: true },
  });

  if (!check.isEmpty(customerExist)) {
    return res.status(200).json({ message: `Mobile number is already exist.` });
  }

  await models.customerOtp.destroy({ where: { mobileNumber } });

  const referenceCode = await createReferenceCode(5);
  let otp = Math.floor(1000 + Math.random() * 9000);
  let createdTime = new Date();
  let expiryTime = moment.utc(createdTime).add(10, "m");
  await models.customerOtp.create({ mobileNumber, otp, createdTime, expiryTime, referenceCode, });

  request(
    `${CONSTANT.SMSURL}username=${CONSTANT.SMSUSERNAME}&password=${CONSTANT.SMSPASSWORD}&type=0&dlr=1&destination=${mobileNumber}&source=nicalc&message=For refrence code ${referenceCode} your OTP is ${otp}. This otp is valid for only 10 minutes`
  );

  return res
    .status(200)
    .json({
      message: `Otp send to your entered mobile number.`,
      referenceCode,
    });
};


exports.sendOtp = async (req, res, next) => {
  const { mobileNumber } = req.body;

  let customerExist = await models.customer.findOne({
    where: { mobileNumber, isActive: true },
  });

  if (check.isEmpty(customerExist)) {
    return res.status(200).json({ message: `Mobile number is not Exist.` });
  }

  await models.customerOtp.destroy({ where: { mobileNumber } });

  const referenceCode = await createReferenceCode(5);
  let otp = Math.floor(1000 + Math.random() * 9000);
  let createdTime = new Date();
  let expiryTime = moment.utc(createdTime).add(10, "m");
  await models.customerOtp.create({ mobileNumber, otp, createdTime, expiryTime, referenceCode, });
  request(
    `${CONSTANT.SMSURL}username=${CONSTANT.SMSUSERNAME}&password=${CONSTANT.SMSPASSWORD}&type=0&dlr=1&destination=${mobileNumber}&source=nicalc&message=For refrence code ${referenceCode} your OTP is ${otp}. This otp is valid for only 10 minutes`
  );

  return res
    .status(200)
    .json({
      message: `Otp send to your entered mobile number.`,
      referenceCode,
    });
};


exports.verifyOtp = async (req, res, next) => {
  let { referenceCode, otp } = req.body;
  var todayDateTime = new Date();

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
    return res.status(404).json({ message: `Invalid otp.` });
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

  let { cityId, stateId, pinCode, internalBranchId, statusId, comment } = req.body;

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
      { cityId, stateId, statusId, comment, pinCode, internalBranchId, modifiedBy },
      { where: { id: customerId }, transaction: t }
    );
  });
  return res.status(200).json({ messgae: `User Updated` });
};


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
  let { stageName, cityId, stateId, statusId } = req.query;
  const { search, offset, pageSize } = paginationWithFromTo(
    req.query.search,
    req.query.from,
    req.query.to
  );
  let stage = await models.stage.findOne({ where: { stageName } });

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
        }
      },
    }],
    isActive: true,
  };
  let includeArray = [{
    model: models.customerKyc,
    as: "customerKyc",
    attributes: ['isKycSubmitted']
  }, {
    model: models.state,
    as: "state",
  },
  {
    model: models.city,
    as: "city",
  },
  {
    model: models.stage,
    as: "stage",
    where: { id: stage.id },
  },
  {
    model: models.status,
    as: "status",
  },
  {
    model: models.internalBranch,
    as: "internalBranch"
  }
  ]

  let allCustomers = await models.customer.findAll({
    where: searchQuery,
    attributes: { exclude: ['mobileNumber', 'createdAt', 'updatedAt', 'createdBy', 'modifiedBy', 'isActive'] },
    order: [["id", "DESC"]],
    offset: offset,
    limit: pageSize,
    include: includeArray,
  });
  let count = await models.customer.findAll({
    where: searchQuery,
    include: includeArray,
  });

  return res.status(200).json({ data: allCustomers, count: count.length });
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
    ],
  });
  if (check.isEmpty(singleCustomer)) {
    return res.status(404).json({ message: "Customer not found" });
  }
  return res.status(200).json({ singleCustomer })
};


exports.getCustomerUniqueId = async (req, res) => {
  let customer = await models.customer.findAll({
    attributes: ['id', 'customerUniqueId'],
    include: [{
      model: models.customerKyc,
      as: 'customerKyc',
      where: { kycStatus: "approved" },
      attributes: []
    }]
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
    model: models.customerLoan,
    as: 'customerLoan',
    where: { loanStageId: stageId.id },
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
    return res.status(200).json([]);
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
        model: models.customerKycBankDetail,
        as: 'customerKycBank'
      },
      {
        model: models.customerLoan,
        as: 'customerLoan',
        where: { loanStageId: stageId.id },
        include: [{
          model: models.customerFinalLoan,
          as: 'finalLoan'
        }, {
          model: models.customerLoanNomineeDetail,
          as: 'loanNomineeDetail'
        }]
      }
    ]
  })

  return res.status(200).json({ message: "Success", data: singleCustomer })
}