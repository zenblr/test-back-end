const qs = require('qs');
const models = require('../../../models');
const getMerchantData = require('../auth/getMerchantData');
const check = require('../../../lib/checkLib');
const uniqid = require('uniqid');
const pagination = require('../../../utils/pagination');
// let sms = require('../../../utils/sendSMS');
let sms = require('../../../utils/SMS');
const errorLogger = require('../../../utils/errorLogger');

exports.sellProduct = async (req, res) => {
  try {
    const { metalType, quantity, lockPrice, blockId, userBankId, accountName, bankId, accountNumber, ifscCode } = req.body;
    const id = req.userData.id;

    let customerDetails = await models.customer.findOne({
      where: { id, isActive: true },
    });

    if (check.isEmpty(customerDetails)) {
      return res.status(404).json({ message: "Customer Does Not Exists" });
    }

    let getCustomerBalance = await getCustomerBalanceDetail(id);
    console.log(getCustomerBalance);
    if (metalType == "gold") {
      let nonSellableAmount;
      if (quantity >= getCustomerBalance.sellableGoldBalance) {

        let configSettingName = "digi gold sellable hour"
        let getConfigSetting = await models.digiGoldConfigDetails.getConfigDetail(configSettingName);

        nonSellableAmount = getCustomerBalance.currentGoldBalance - getCustomerBalance.sellableGoldBalance;
        return res.status(400).json({ message: `Our policy dose not allow customer to sell gold and silver within ${getConfigSetting.configSettingValue} hours of purchasing it. You have purhased ${nonSellableAmount} grams of ${metalType} in last ${getConfigSetting.configSettingValue} hours. Please try again later.` });
      }
    }
    if (metalType == "silver") {
      if (quantity >= getCustomerBalance.sellableSilverBalance) {

        let configSettingName = "digi gold sellable hour"
        let getConfigSetting = await models.digiGoldConfigDetails.getConfigDetail(configSettingName);

        nonSellableAmount = getCustomerBalance.currentSilverBalance - getCustomerBalance.sellableSilverBalance;
        return res.status(400).json({ message: `Our policy dose not allow customer to sell gold and silver within ${getConfigSetting.configSettingValue} hours of purchasing it. You have purhased ${nonSellableAmount} grams of ${metalType} in last ${getConfigSetting.configSettingValue} hours. Please try again later.` });
      }
    }

    const customerUniqueId = customerDetails.customerUniqueId;
    const merchantData = await getMerchantData();
    const transactionId = uniqid(merchantData.merchantId, customerUniqueId);
    const data = qs.stringify({
      'lockPrice': lockPrice,
      'metalType': metalType,
      'quantity': quantity,
      //  'amount': amount,
      'merchantTransactionId': transactionId,
      'uniqueId': customerUniqueId,
      'blockId': blockId,
      'userBank[userBankId]': userBankId,
      'userBank[accountName]': accountName,
      'userBank[bankId]': bankId,
      'userBank[accountNumber]': accountNumber,
      'userBank[ifscCode]': ifscCode,
      'mobileNumber': customerDetails.mobileNumber
    })
    const result = await models.axios({
      method: 'POST',
      url: `${process.env.DIGITALGOLDAPI}/merchant/v1/sell`,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Bearer ${merchantData.accessToken}`,
      },
      data: data
    })
    if (result.data.statusCode === 200) {

      await models.digiGoldCustomerBalance.update({currentGoldBalance: result.data.result.data.goldBalance, currentSilverBalance: result.data.result.data.silverBalance}, {where: {customerId: id}});

      await sms.sendMessageForSell(customerDetails.mobileNumber, result.data.result.data.quantity, result.data.result.data.metalType, result.data.result.data.totalAmount);
    }
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

exports.getSellDetailsWithTransId = async (req, res) => {
  try {
    const { transactionId } = req.params;
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
      url: `${process.env.DIGITALGOLDAPI}/merchant/v1/sell/${transactionId}/${customerUniqueId}`,
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

exports.getAllSellDetails = async (req, res) => {
  try {
    const id = req.userData.id;
    const { search, pageSize, pageNumber } = pagination.paginationWithPageNumberPageSize(req.query.search, req.query.page, req.query.count);
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
      url: `${process.env.DIGITALGOLDAPI}/merchant/v1/${customerUniqueId}/sell?name=${search}&page=${pageNumber}&count=${pageSize}`,
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

async function getCustomerBalanceDetail(customerId) {

  let getCustomerBalance = await models.digiGoldCustomerBalance.findOne({
    where: {
      customerId,
      isActive: true
    }
  });

  if (getCustomerBalance) {
    return getCustomerBalance;
  } else {

    let customerDetails = await models.customer.findOne({
      where: { id, isActive: true },
    });

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
    result.data.result.data

    getCustomerBalance = await models.digiGoldCustomerBalance.create({
      customerId: customerId,
      currentGoldBalance: result.data.result.data.goldGrms,
      currentSilverBalance: result.data.result.data.silverGrms,
      sellableGoldBalance: result.data.result.data.goldGrms,
      sellableSilverBalance: result.data.result.data.silverGrms
    });

    return getCustomerBalance;
  }
}