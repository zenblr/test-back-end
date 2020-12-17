const qs = require('qs');
const models = require('../../../models');
const getMerchantData = require('../auth/getMerchantData');
const sequelize = models.sequelize;
const Sequelize = models.Sequelize;
const Op = Sequelize.Op;
const check = require('../../../lib/checkLib');
const uniqid = require('uniqid');
const jwt = require('jsonwebtoken');
const { JWT_SECRETKEY, JWT_EXPIRATIONTIME } = require('../../../utils/constant');
const errorLogger = require('../../../utils/errorLogger');
const { getCustomerCityById, getCustomerStateById } = require('../../../service/customerAddress')


exports.getCustomerPassbookDetails = async (req, res) => {
  try {
    const id = req.userData.id;
    console.log("id", id)
    let customerDetails = await models.customer.findOne({
      where: { id, isActive: true },
    });

    let availableBalance = await models.digiGoldCustomerBalance.findOne({
      where: { customerId: id, isActive: true },
    });
    
    if (check.isEmpty(customerDetails)) {
      return res.status(404).json({ message: "Customer Does Not Exists" });
    };


    const customerUniqueId = customerDetails.customerUniqueId;
    const merchantData = await getMerchantData();
    const result = await models.axios({
      method: 'GET',
      url: `${process.env.DIGITALGOLDAPI}/merchant/v1/users/${customerUniqueId}/passbook`,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${merchantData.accessToken}`,
      },
    });
    return res.status(200).json(result.data);
  } catch (err) {
    console.log(err);
    let errorData = errorLogger(JSON.stringify(err), req.url, req.method, req.hostname, req.body);

    if (err.response) {
      return res.status(422).json(err.response.data);
    } else {
      console.log('Error', err.message);
    }
  };
}

exports.getCustomerDetails = async (req, res) => {
  try {
    const id = req.userData.id;
    const merchantData = await getMerchantData();

    let customerDetails = await models.customer.findOne({
      where: { id, isActive: true },
    });
    if (check.isEmpty(customerDetails)) {
      return res.status(404).json({ message: "Customer Does Not Exists" });
    }
    const customerUniqueId = customerDetails.customerUniqueId;
    const result = await models.axios({
      method: 'GET',
      url: `${process.env.DIGITALGOLDAPI}/merchant/v1/users/${customerUniqueId}`,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${merchantData.accessToken}`,
      },
    });
    const name = result.data.result.data.userName.split(' ');
    result.data.result.data.firstName = name[0];
    result.data.result.data.lastName = name[1];
    result.data.result.data.mobileNumber = customerDetails.mobileNumber;
    return res.status(200).json(result.data);
  } catch (err) {
    let errorData = errorLogger(JSON.stringify(err), req.url, req.method, req.hostname, req.body);

    if (err.response) {
      return res.status(422).json(err.response.data);
    } else {
      console.log('Error', err.message);
    }
  };
}

exports.updateCustomerDetails = async (req, res) => {
  try {
    const id = req.userData.id;
    const { email, firstName, lastName, cityId, stateId, pinCode, address, mobileNumber, dateOfBirth, gender,
      nomineeName, nomineeDateOfBirth, nomineeRelation } = req.body;
    let customerDetails = await models.customer.findOne({
      where: { id, isActive: true },
    });
    if (check.isEmpty(customerDetails)) {
      return res.status(404).json({ message: "Customer Does Not Exists" });
    }

    let city = await getCustomerCityById(cityId);
    let state = await getCustomerStateById(stateId);
  
    const customerUniqueId = customerDetails.customerUniqueId;
    const merchantData = await getMerchantData();
    const data = qs.stringify({
      'mobileNumber': mobileNumber,
      'emailId': email,
      'userName': firstName + " " + lastName,
      'userAddress': address,
       'userCity': city.cityUniqueCode,
      // 'userState': stateId,
      'userState': state.stateUniqueCode,
      'userPincode': pinCode,
      'dateOfBirth': dateOfBirth,
      'gender': gender,
      'nomineeName': nomineeName,
      'nomineeDateOfBirth': nomineeDateOfBirth,
      'nomineeRelation': nomineeRelation
    })
    await sequelize.transaction(async (t) => {
      await models.customer.update(
        {
          firstName, lastName, mobileNumber, email, pinCode,
          stateId, cityId, customerAddress: address, dateOfBirth, gender, isActive: true
        },
        { where: { id }, transaction: t }
      );

      if (nomineeName && nomineeDateOfBirth && nomineeRelation) {

        let customerNomineeData = await models.digiGoldCustomerNomineeDetails.findOne({ where: { customerId: id, isActive: true } });

        if (check.isEmpty(customerNomineeData)) {
          await models.digiGoldCustomerNomineeDetails.create({ customerId: id, nomineeName: nomineeName, nomineeDob: nomineeDateOfBirth, nomineeRelation: nomineeRelation }, { transaction: t })
        } else {
          await models.customer.update(
            { nomineeName: nomineeName, nomineeDob: nomineeDateOfBirth, nomineeRelation: nomineeRelation },
            { where: { id }, transaction: t }
          );
        }
      }
    });
    const result = await models.axios({
      method: 'PUT',
      url: `${process.env.DIGITALGOLDAPI}/merchant/v1/users/${customerUniqueId}`,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
        'Authorization': `Bearer ${merchantData.accessToken}`,
      },
      data: data
    });
    return res.status(200).json(result.data);
  } catch (err) {
    let errorData = errorLogger(JSON.stringify(err), req.url, req.method, req.hostname, req.body);

    if (err.response) {
      return res.status(422).json(err.response.data);
    } else {
      console.log('Error', err.message);
    }
  };
}

exports.createCustomerInAugmontDb = async (req, res) => {
  try {
    const id = req.userData.id;
    const merchantData = await getMerchantData();

    const customer = await models.customer.findOne({ where: { id, isActive: true } });
    let state = await getCustomerStateById(stateId);
    let city = await getCustomerCityById(cityId);
    let customerUniqueId;
    await sequelize.transaction(async (t) => {
      if (!customer.customerUniqueId) {
        customerUniqueId = uniqid.time().toUpperCase();
        await models.customer.update({ customerUniqueId }, { where: { id }, transaction: t });
      } else {
        customerUniqueId = customer.customerUniqueId;
      }
    });

    const data = qs.stringify({
      'mobileNumber': customer.mobileNumber,
      // 'emailId': email,
      'uniqueId': customerUniqueId,
      'userName': customer.firstName + " " + customer.lastName,
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
    const result = await models.axios({
      method: 'POST',
      url: `${process.env.DIGITALGOLDAPI}/merchant/v1/users/`,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Bearer ${merchantData.accessToken}`,
      },
      data: data
    });

    return res.status(200).json({ message: "Success" });

  } catch (err) {
    let errorData = errorLogger(JSON.stringify(err), req.url, req.method, req.hostname, req.body);

    if (err.response) {
      return res.status(422).json(err.response.data);
    } else {
      console.log('Error', err.message);
    }
  }

}

