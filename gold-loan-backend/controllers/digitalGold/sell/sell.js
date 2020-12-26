const qs = require('qs');
const models = require('../../../models');
const getMerchantData = require('../auth/getMerchantData');
const check = require('../../../lib/checkLib');
const uniqid = require('uniqid');
const pagination = require('../../../utils/pagination');
// let sms = require('../../../utils/sendSMS');
let sms = require('../../../utils/SMS');
const errorLogger = require('../../../utils/errorLogger');
const sequelize = models.sequelize;
const Sequelize = models.Sequelize;
const Op = Sequelize.Op;
const moment = require('moment');



exports.sellProduct = async (req, res) => {
  try {
    const { metalType, quantity, lockPrice, blockId, userBankId, accountName, bankId, accountNumber, ifscCode, modeOfPayment, branchName, amount } = req.body;
    const id = req.userData.id;

    // return;
    let createdBy = req.userData.id;
    let modifiedBy = req.userData.id;
    
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
      if (quantity > getCustomerBalance.sellableGoldBalance) {
        let configSettingName = "digiGoldSellableHour"
        let getConfigSetting = await models.digiGoldConfigDetails.getConfigDetail(configSettingName);

        nonSellableAmount = getCustomerBalance.currentGoldBalance - getCustomerBalance.sellableGoldBalance;
        return res.status(400).json({ message: `Our policy dose not allow customer to sell gold and silver within ${getConfigSetting.configSettingValue} hours of purchasing it. You have purhased ${nonSellableAmount} gram of ${metalType} in last ${getConfigSetting.configSettingValue} hours. Please try again later.` });
      }
    }
    if (metalType == "silver") {
      if (quantity > getCustomerBalance.sellableSilverBalance) {

        let configSettingName = "digiGoldSellableHour"
        let getConfigSetting = await models.digiGoldConfigDetails.getConfigDetail(configSettingName);

        nonSellableAmount = getCustomerBalance.currentSilverBalance - getCustomerBalance.sellableSilverBalance;
        return res.status(400).json({ message: `Our policy dose not allow customer to sell gold and silver within ${getConfigSetting.configSettingValue} hours of purchasing it. You have purhased ${nonSellableAmount} gram of ${metalType} in last ${getConfigSetting.configSettingValue} hours. Please try again later.` });
      }
    }

    let tempId = await models.digiGoldTempOrderDetail.create(
      {
        customerId: id, orderTypeId: 2, totalAmount: amount, metalType: metalType, quantity: quantity,
        lockPrice: lockPrice, blockId: blockId, amount: amount, modeOfPayment: modeOfPayment, isActive: true, createdBy, modifiedBy
      }
    );

    let customerBal = await models.digiGoldCustomerBalance.findOne({ where: { customerId: id } });
    let orderUniqueId = `dg_sell${Math.floor(1000 + Math.random() * 9000)}`;
    let paymentBankType;
    if (modeOfPayment == "bankAccount") {
      paymentBankType = "userbank";
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
        'mobileNumber': customerDetails.mobileNumber,
        'paymentBankType': paymentBankType
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

        let updatesSellableGoldBal;
        let updatedSellableSilverBal;

        await sequelize.transaction(async (t) => {

          if (result.data.result.data.metalType == "gold") {
            updatesSellableGoldBal = Number(customerBal.sellableGoldBalance) - Number(result.data.result.data.quantity);

            await models.digiGoldCustomerBalance.update({ currentGoldBalance: result.data.result.data.goldBalance, currentSilverBalance: result.data.result.data.silverBalance, sellableGoldBalance: updatesSellableGoldBal }, { where: { customerId: id }, transaction: t });

          } else if (result.data.result.data.metalType == "silver") {
            updatedSellableSilverBal = Number(customerBal.sellableSilverBalance) - Number(result.data.result.data.quantity)

            await models.digiGoldCustomerBalance.update({ currentGoldBalance: result.data.result.data.goldBalance, currentSilverBalance: result.data.result.data.silverBalance, sellableSilverBalance: updatedSellableSilverBal }, { where: { customerId: id }, transaction: t });
          }

          // let amountOfWallet;
          // if(customerDetails.walletFreeBalance){
          //  amountOfWallet = Number(customerDetails.walletFreeBalance) + Number(amount);

          // }else{
          //  amountOfWallet = Number(amount)
          // }
          // await models.customer.update({ walletFreeBalance: amountOfWallet }, { where: { id: customerDetails.id }, transaction: t });

          let orderDetail = await models.digiGoldOrderDetail.create({
            tempOrderId: tempId.id, customerId: id, orderTypeId: 2, orderId: orderUniqueId, totalAmount: result.data.result.data.totalAmount, metalType: metalType, quantity: quantity, rate: result.data.result.data.rate, merchantTransactionId: result.data.result.data.merchantTransactionId, transactionId: result.data.result.data.transactionId, goldBalance: result.data.result.data.goldBalance, silverBalance: result.data.result.data.silverBalance,
            lockPrice: lockPrice, blockId: blockId, amount: result.data.result.data.totalAmount, modeOfPayment: modeOfPayment, isActive: true, createdBy, modifiedBy, walletBalance: customerDetails.currentWalletBalance
          }, { transaction: t });

          await models.digiGoldTempOrderDetail.update(
            { isOrderPlaced: true, modifiedBy }, { where: { id: tempId.id }, transaction: t });

          await models.digiGoldOrderBankDetail.create({ orderDetailId: orderDetail.id, accountNumber: accountNumber, bankId: bankId, ifscCode: ifscCode, userBankId: userBankId, bankName: branchName, isActive: true }, { transaction: t });

          await sms.sendMessageForSell(customerDetails.mobileNumber, result.data.result.data.quantity, result.data.result.data.metalType, result.data.result.data.totalAmount);

        })
      }
      return res.status(200).json(result.data);
    } else if (modeOfPayment == "augmontWallet") {
      paymentBankType = "partnerbank";
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
        // 'userBank[userBankId]': userBankId,
        // 'userBank[accountName]': accountName,
        // 'userBank[bankId]': bankId,
        // 'userBank[accountNumber]': accountNumber,
        // 'userBank[ifscCode]': ifscCode,
        'mobileNumber': customerDetails.mobileNumber,
        'paymentBankType': paymentBankType

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
        let walletData;
        await sequelize.transaction(async (t) => {

          let updatesSellableGoldBal;
          let updatedSellableSilverBal;

          if (result.data.result.data.metalType == "gold") {
            updatesSellableGoldBal = Number(customerBal.sellableGoldBalance) - Number(result.data.result.data.quantity);

            await models.digiGoldCustomerBalance.update({ currentGoldBalance: result.data.result.data.goldBalance, currentSilverBalance: result.data.result.data.silverBalance, sellableGoldBalance: updatesSellableGoldBal }, { where: { customerId: id }, transaction: t });

          } else if (result.data.result.data.metalType == "silver") {
            updatedSellableSilverBal = Number(customerBal.sellableSilverBalance) - Number(result.data.result.data.quantity)

            await models.digiGoldCustomerBalance.update({ currentGoldBalance: result.data.result.data.goldBalance, currentSilverBalance: result.data.result.data.silverBalance, sellableSilverBalance: updatedSellableSilverBal }, { where: { customerId: id }, transaction: t });
          }

          walletData = await models.walletDetails.create({ customerId: id, amount: result.data.result.data.totalAmount, paymentDirection: "credit", description: "sell metal", productTypeId: 4, transactionDate: moment() }, { transaction: t })

          let amountOfWallet;
          let currentWalletBalance;
          if (customerDetails.walletFreeBalance ) {
            amountOfWallet = Number(customerDetails.walletFreeBalance) + Number(amount)
          } else {
            amountOfWallet = Number(amount);
          }

          if (customerDetails.currentWalletBalance ){
            currentWalletBalance = Number(customerDetails.currentWalletBalance) + Number(amount)
          }else{
            currentWalletBalance = Number(amount)
          }
          

          let orderDetail = await models.digiGoldOrderDetail.create({
            tempOrderId: tempId.id, customerId: id, orderTypeId: 2, orderId: orderUniqueId, totalAmount: result.data.result.data.totalAmount, metalType: metalType, quantity: quantity, rate: result.data.result.data.rate, merchantTransactionId: result.data.result.data.merchantTransactionId, transactionId: result.data.result.data.transactionId, goldBalance: result.data.result.data.goldBalance, silverBalance: result.data.result.data.silverBalance,
            lockPrice: lockPrice, blockId: blockId, amount: result.data.result.data.totalAmount, modeOfPayment: modeOfPayment, isActive: true, createdBy, modifiedBy, walletBalance: amountOfWallet, walletId: walletData.id
          }, { transaction: t });

          await models.digiGoldTempOrderDetail.update(
            { isOrderPlaced: true, modifiedBy }, { where: { id: tempId.id }, transaction: t });

          await models.customer.update(
            { walletFreeBalance: amountOfWallet, currentWalletBalance: currentWalletBalance }, { where: { id: customerDetails.id }, transaction: t });
        })

        await sms.sendMessageForSell(customerDetails.mobileNumber, result.data.result.data.quantity, result.data.result.data.metalType, result.data.result.data.totalAmount);
        console.log("success")
      }
      return res.status(200).json(result.data);
    }

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
      where: { id: customerId, isActive: true },
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