const qs = require('qs');
const models = require('../../../models');
const getMerchantData = require('../auth/getMerchantData');
const check = require('../../../lib/checkLib');
const errorLogger = require('../../../utils/errorLogger');
const { getCustomerCityById, getCustomerStateById } = require('../../../service/customerAddress')


exports.createCustomerAddress = async (req, res) => {
  try {
    const { name, mobileNumber, email, address, stateId, cityId, pinCode } = req.body;
    const id = req.userData.id;
    let customerDetails = await models.customer.findOne({
      where: { id, isActive: true },
    });
    if (check.isEmpty(customerDetails)) {
      return res.status(404).json({ message: "Customer Does Not Exists" });
    }
    let state = await getCustomerStateById(stateId);
    let city = await getCustomerCityById(cityId);

    const customerUniqueId = customerDetails.customerUniqueId;
    const merchantData = await getMerchantData();
    const data = qs.stringify({
      'name': name,
      'mobileNumber': mobileNumber,
      'email': email,
      'address': address,
      'state': state.stateUniqueCode,
      'city': city.cityUniqueCode,
      'pincode': pinCode
    })
    const result = await models.axios({
      method: 'POST',
      url: `${process.env.DIGITALGOLDAPI}/merchant/v1/users/${customerUniqueId}/address`,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Bearer ${merchantData.accessToken}`,
      },
      data: data
    })
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

exports.getCustomerAddressList = async (req, res) => {
  try {
    const id = req.userData.id;
    let customerDetails = await models.customer.findOne({
      where: { id, isActive: true },
    });
    if (check.isEmpty(customerDetails)) {
      return res.status(404).json({ message: "Customer Does Not Exists" });
    }
    const customerUniqueId = customerDetails.customerUniqueId;
    const merchantData = await getMerchantData();
    const result = await models.axios({
      method: 'GET',
      url: `${process.env.DIGITALGOLDAPI}/merchant/v1/users/${customerUniqueId}/address`,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${merchantData.accessToken}`,
      },
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

exports.deleteCustomerAddress = async (req, res) => {
  try {
    const { userAddressId } = req.params;
    const id = req.userData.id;
    let customerDetails = await models.customer.findOne({
      where: { id, isActive: true },
    });
    if (check.isEmpty(customerDetails)) {
      return res.status(404).json({ message: "Customer Does Not Exists" });
    }
    const customerUniqueId = customerDetails.customerUniqueId;
    const merchantData = await getMerchantData();
    const result = await models.axios({
      method: 'DELETE',
      url: `${process.env.DIGITALGOLDAPI}/merchant/v1/users/${customerUniqueId}/address/${userAddressId}`,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${merchantData.accessToken}`,
      },
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