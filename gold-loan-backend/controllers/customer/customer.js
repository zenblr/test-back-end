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
  let { firstName, lastName, referenceCode, panCardNumber, stateId, cityId, address, statusId, } = req.body;
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
    return res
      .status(404)
      .json({ message: "This Mobile number already Exists" });
  }

  let getStageId = await models.stage.findOne({ where: { stageName: "lead" } });
  let stageId = getStageId.id;
  let email = "nimap@infotech.com";
  let password = firstName;

  await sequelize.transaction(async (t) => {
    const customer = await models.customer.create(
      { firstName, lastName, password, mobileNumber, email, panCardNumber, stateId, cityId, stageId, statusId, createdBy, modifiedBy, isActive: true },
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
  await models.customerOtp.create({ mobileNumber, otp, createdTime, expiryTime, referenceCode });

  request(
    `${CONSTANT.SMSURL}username=${CONSTANT.SMSUSERNAME}&password=${CONSTANT.SMSPASSWORD}&type=0&dlr=1&destination=${mobileNumber}&source=nicalc&message=For refrence code ${referenceCode} your OTP is ${otp}`
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
  await models.customerOtp.create({
    mobileNumber,
    otp,
    createdTime,
    expiryTime,
    referenceCode,
  });
  request(
    `${CONSTANT.SMSURL}username=${CONSTANT.SMSUSERNAME}&password=${CONSTANT.SMSPASSWORD}&type=0&dlr=1&destination=${mobileNumber}&source=nicalc&message=For refrence code ${referenceCode} your OTP is ${otp}`
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

  let { cityId, stateId, statusId } = req.body;
  let customerExist = await models.customer.findOne({ where: { id: customerId } });
  if (check.isEmpty(customerExist)) {
    return res.status(404).json({ message: "Customer does not exist" });
  }
  await sequelize.transaction(async (t) => {
    const customer = await models.customer.update(
      { cityId, stateId, statusId, modifiedBy },
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


exports.getAllCustomers = async (req, res, next) => {
  let { stageName } = req.query;
  const { search, offset, pageSize } = paginationWithFromTo(
    req.query.search,
    req.query.from,
    req.query.to
  );
  let stage = await models.stage.findOne({ where: { stageName } });

  console.log(search, offset, pageSize, stage.id);

  const searchQuery = [
    {
      [Op.or]: {
        first_name: { [Op.iLike]: search + "%" },
        last_name: { [Op.iLike]: search + "%" },
      },
    },
  ];
  let allCustomers = await models.customer.findAll({
    where: searchQuery,
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
        where: { id: stage.id },
      },
      {
        model: models.status,
        as: "status",
      },
    ],
    order: [["id", "DESC"]],
    offset: offset,
    limit: pageSize,
  });
  let count = await models.customer.findAll({
    where: { isActive: true },
    include: [
      {
        model: models.stage,
        as: "stage",
        where: { id: stage.id },
      },
    ],
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


exports.filterCustomer = async (req, res) => {
  var { cityId, stateId, statusId } = req.query;
  const query = {};

  if (cityId) {
    cityId = req.query.cityId.split(",");
    query.cityId = cityId;
  }
  if (statusId) {
    statusId = req.query.statusId.split(",");
    query.statusId = statusId;
  }

  if (stateId) {
    query.stateId = stateId;
  }

  let customerFilterData = await models.customer.findAll({
    where: query,
    isActive: true,
  });
  if (!customerFilterData[0]) {
    return res.status(404).json({ message: "data not found" });
  }
  return res.status(200).json({ customerFilterData });
};
