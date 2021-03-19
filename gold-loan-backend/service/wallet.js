const qs = require('qs');
const uniqid = require('uniqid');
const crypto = require('crypto');
const moment = require('moment');
const path = require('path');
const models = require('../models');
const check = require('../lib/checkLib');
const { paginationWithFromTo } = require('../utils/pagination');
// let sms = require('../../../utils/sendSMS');
const numToWords = require('../utils/numToWords');
const sequelize = models.sequelize;
const Sequelize = models.Sequelize;
const Op = Sequelize.Op
const getMerchantData = require('../controllers/auth/getMerchantData');
let sms = require('../utils/SMS');
// var stringify = require('json-stringify');
const { postMerchantOrder, getUserData, postBuy } = require('./digiGold')

//To get wallet transaction detail by id
let walletTransactionDetailById = async (walletTransactionId) => {

  let transactionData = await models.walletTransactionDetails.findOne({
    where: { id: walletTransactionId },
    include: {
      model: models.customer,
      as: 'customer',
      attributes: ['customerUniqueId', 'firstName', 'lastName', 'mobileNumber']
    }
  });
  return transactionData;
}

let walletBuy = async (customerId, lockPrice, metalType, blockId, modeOfPayment, quantity, orderAmount, orderId, quantityBased, tempWalletId, temporderDetailId) => {
  try {

    let customerDetails = await models.customer.findOne({ where: { id: customerId } });

    const customerUniqueId = customerDetails.customerUniqueId;
    const merchantData = await getMerchantData();


    const getUser = await getUserData(customerUniqueId)

    // const getUser = await models.axios({
    //   method: 'GET',
    //   url: `${process.env.DIGITALGOLDAPI}/merchant/v1/users/${customerUniqueId}`,
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Accept': 'application/json',
    //     'Authorization': `Bearer ${merchantData.accessToken}`,
    //   },
    // });
    const getUserDetails = getUser.data.result.data;
    const transactionId = uniqid(merchantData.merchantId, customerUniqueId);

    const data = {
      'lockPrice': lockPrice,
      'emailId': getUserDetails.userEmail,
      'metalType': metalType,
      'merchantTransactionId': transactionId,
      'userName': getUserDetails.userName,
      'userCity': getUserDetails.userCityId,
      'userState': getUserDetails.userStateId,
      'userPincode': null,
      'uniqueId': customerUniqueId,
      'blockId': blockId,
      'modeOfPayment': modeOfPayment,
      'mobileNumber': customerDetails.mobileNumber
    };

    if (quantityBased == true) {
      data.quantity = quantity;
    } else {
      data.amount = orderAmount;
    }

    console.log(qs.stringify(data));

    const result = await postBuy(data)
    // const result = await models.axios({
    //   method: 'POST',
    //   url: `${process.env.DIGITALGOLDAPI}/merchant/v1/buy`,
    //   headers: {
    //     'Content-Type': 'application/x-www-form-urlencoded',
    //     'Authorization': `Bearer ${merchantData.accessToken}`,
    //   },
    //   data: qs.stringify(data)
    // })
    const customerName = customerDetails.firstName + " " + customerDetails.lastName;

    if (result.isSuccess) {

      await sequelize.transaction(async (t) => {
        let currentBal = Number(customerDetails.currentWalletBalance) - Number(result.data.result.data.totalAmount);

        let newCurrentBal = currentBal.toFixed(2);


        await models.customer.update({ currentWalletBalance: Number(newCurrentBal) }, { where: { id: customerId } })

        let orderUniqueId = `dg_buy${Math.floor(1000 + Math.random() * 9000)}`;

        let walletData = await models.walletDetails.create({ customerId: customerId, amount: result.data.result.data.totalAmount, paymentDirection: "debit", description: result.data.message, productTypeId: 4, transactionDate: moment(), walletTempDetailId: tempWalletId }, { transaction: t });

        let orderDetail = await models.digiGoldOrderDetail.create({ tempOrderId: temporderDetailId, customerId: customerId, orderTypeId: 1, orderId: orderUniqueId, metalType: result.data.result.data.metalType, quantity: quantity, lockPrice: lockPrice, blockId: blockId, amount: result.data.result.data.totalAmount, rate: result.data.result.data.rate, quantityBased: quantityBased, modeOfPayment: modeOfPayment, goldBalance: result.data.result.data.goldBalance, silverBalance: result.data.result.data.silverBalance, merchantTransactionId: result.data.result.data.merchantTransactionId, transactionId: result.data.result.data.transactionId, orderStatus: "pending", totalAmount: result.data.result.data.totalAmount, walletBalance: Number(newCurrentBal), walletId: walletData.id, isSellableGold: false, isSellableSilver: false }, { transaction: t });

        await models.digiGoldTempOrderDetail.update({ isOrderPlaced: true }, { where: { id: orderId }, transaction: t });

        let CustomerBalanceData = await models.digiGoldCustomerBalance.findOne({ where: { customerId: customerId, isActive: true } })
        if (CustomerBalanceData) {
          await models.digiGoldCustomerBalance.update({ currentGoldBalance: result.data.result.data.goldBalance, currentSilverBalance: result.data.result.data.silverBalance }, { where: { customerId: customerId }, transaction: t });
        } else {
          await models.digiGoldCustomerBalance.create({ customerId: customerId, currentGoldBalance: result.data.result.data.goldBalance, currentSilverBalance: result.data.result.data.silverBalance }, { transaction: t });
        }
        await models.digiGoldOrderTaxDetail.create({ orderDetailId: orderDetail.id, totalTaxAmount: result.data.result.data.totalTaxAmount, cgst: result.data.result.data.taxes.taxSplit[0].cgst, sgst: result.data.result.data.taxes.taxSplit[0].scgst, isActive: true }, { transaction: t });
      })

      await sms.sendMessageForBuy(customerName, customerDetails.mobileNumber, result.data.result.data.quantity, result.data.result.data.metalType, result.data.result.data.totalAmount);

      return result.data;

    } else if (!result.isSuccess) {
      return { err }
    }

  } catch (err) {
    if (err.response.data.statusCode == 422) {
      if (err.response.data.errors.userKyc.length) {
        return err.response.data
      }
    }
    // console.log(err.response.data.errors);
    // console.log(err.result.data.statusCode)
    // if(err.result.data.statusCode == 422){
    //   if(err.result.data.errors && result.data.errors.userKyc.code ==  4557){
    //     console.log(result.data.errors.userKyc.code);
    //     return result.data.errors.userKyc.code
    //   }
    // }


  }
}

let walletDelivery = async (customerId, amount, modeOfPayment, orderType, cartData, totalQuantity, totalWeight, orderAddress, userAddressId, walletTempId, tempOrderDetailId, orderUniqueId) => {
  try {
    let customerDetails = await models.customer.findOne({ where: { id: customerId } });

    const customerUniqueId = customerDetails.customerUniqueId;
    const merchantData = await getMerchantData();
    const transactionId = uniqid(merchantData.merchantId, customerUniqueId);
    const getCartDetails = await models.digiGoldCart.getCartDetails(customerId);

    let data = {
      'merchantTransactionId': transactionId,
      'uniqueId': customerUniqueId,
      'user[shipping][addressId]': userAddressId,
      'merchantId': merchantData.merchantId,
      'mobileNumber': customerDetails.mobileNumber,
      'modeOfPayment': modeOfPayment
    };

    console.log(data)

    for (let [index, ele] of getCartDetails.entries()) {
      data[`product[${index}][sku]`] = ele.productSku;
      data[`product[${index}][quantity]`] = ele.quantity;
    }

    console.log(qs.stringify(data), "data");


    const result = await postMerchantOrder(data)
    // const result = await models.axios({
    //   method: 'POST',
    //   url: `${process.env.DIGITALGOLDAPI}/merchant/v1/order`,
    //   headers: {
    //     'Content-Type': 'application/x-www-form-urlencoded',
    //     'Authorization': `Bearer ${merchantData.accessToken}`,
    //   },
    //   data: qs.stringify(data)
    // })
    console.log(result.data);

    if (result.isSuccess) {
      await sequelize.transaction(async (t) => {

        await models.digiGoldCart.destroy({ where: { customerId: customerId } });

        let currentBal = Number(customerDetails.currentWalletBalance) - Number(result.data.result.data.shippingCharges);

        let newCurrentBalance = currentBal.toFixed(2);

        await models.customer.update({ currentWalletBalance: Number(newCurrentBalance) }, { where: { id: customerId }, transaction: t });

        let customerBal = await models.digiGoldCustomerBalance.findOne({ where: { customerId: customerId } });

        let updatedSellableGold = 0;
        let updatedSellableSilver = 0;
        let totalGoldWeight = 0;
        let totalSilverWeight = 0;

        for (let cart of cartData) {
          if (cart.metalType == "gold") {
            if (cart.quantity == 1) {
              totalGoldWeight += Number(cart.productWeight);
            } else if (cart.quantity > 1) {
              totalGoldWeight += Number(cart.productWeight) * Number(cart.quantity);
            }
          } else if (cart.metalType == "silver") {
            if (cart.quantity == 1) {
              totalSilverWeight += Number(cart.productWeight);
            } else if (cart.quantity > 1) {
              totalSilverWeight += Number(cart.productWeight) * Number(cart.quantity);
            }
          }
        }
        console.log(totalSilverWeight, totalGoldWeight)

        if (totalGoldWeight) {

          updatedSellableGold = Number(customerBal.sellableGoldBalance) - Number(totalGoldWeight)
          if (!updatedSellableGold || updatedSellableGold <= 0) {
            updatedSellableGold = 0;
          }
          let sellableGoldBalance = updatedSellableGold.toFixed(4);
          await models.digiGoldCustomerBalance.update({ currentGoldBalance: result.data.result.data.goldBalance, currentSilverBalance: result.data.result.data.silverBalance, sellableGoldBalance: Number(sellableGoldBalance) }, { where: { customerId: customerId }, transaction: t });
        }
        // console.log(updatedSellableGold, "updatedSellableGold");
        if (totalSilverWeight) {
          updatedSellableSilver = Number(customerBal.sellableSilverBalance) - Number(totalSilverWeight);
          if (!updatedSellableSilver || updatedSellableSilver <= 0) {
            updatedSellableSilver = 0;
          }
          let sellableSilverBalance = updatedSellableSilver.toFixed(4);
          console.log("updatedSellableSilver", updatedSellableSilver);
          await models.digiGoldCustomerBalance.update({ currentGoldBalance: result.data.result.data.goldBalance, currentSilverBalance: result.data.result.data.silverBalance, sellableSilverBalance: Number(sellableSilverBalance) }, { where: { customerId: customerId }, transaction: t });
        }

        // await models.digiGoldCustomerBalance.update({ currentGoldBalance: result.data.result.data.goldBalance, currentSilverBalance: result.data.result.data.silverBalance }, { where: { customerId: id }, transaction: t });

        let walletData = await models.walletDetails.create({ customerId: customerId, amount: result.data.result.data.shippingCharges, paymentDirection: "debit", description: "Order Delivery", productTypeId: 4, transactionDate: moment(), walletTempDetailId: walletTempId }, { transaction: t });
        console.log(walletData, "walletData");

        let orderDetail = await models.digiGoldOrderDetail.create({ tempOrderId: tempOrderDetailId, customerId: customerId, orderTypeId: 3, orderId: result.data.result.data.orderId, totalAmount: amount, blockId: orderUniqueId, amount: amount, modeOfPayment: modeOfPayment, userAddressId: userAddressId, goldBalance: result.data.result.data.goldBalance, silverBalance: result.data.result.data.silverBalance, merchantTransactionId: result.data.result.data.merchantTransactionId, transactionId: result.data.result.data.orderId, orderStatus: "pending", deliveryShippingCharges: result.data.result.data.shippingCharges, deliveryTotalQuantity: totalQuantity, deliveryTotalWeight: totalWeight, walletBalance: Number(newCurrentBalance), walletId: walletData.id, isSellableGold: true, isSellableSilver: true }, { transaction: t });
        console.log(orderDetail, "orderDetail");
        await models.digiGoldTempOrderDetail.update({ isOrderPlaced: true }, { where: { id: tempOrderDetailId }, transaction: t })

        for (let cart of cartData) {
          let productData = await models.digiGoldOrderProductDetail.create({ orderDetailId: orderDetail.id, productSku: cart.productSku, productWeight: cart.productWeight, productName: cart.productName, amount: cart.amount, productImage: cart.productImage, totalAmount: cart.totalProductAmount, metalType: cart.metalType, quantity: cart.quantity, createdBy: 1, modifiedBy: 1 }, { transaction: t });
          console.log(productData, " productData");
        }

        for (let address of orderAddress) {
          await models.digiGoldOrderAddressDetail.create({ orderDetailId: orderDetail.id, customerName: address.customerName, addressType: address.addressType, address: address.address, stateId: address.stateId, cityId: address.cityId, pinCode: address.pinCode }, { transaction: t });
          console.log(address, "addressaddressaddressaddressaddressaddress");
        }

        await sms.sendMessageForOrderPlaced(customerDetails.mobileNumber, result.data.result.data.orderId);

      })
      return result.data;
    } else if (!result.isSuccess) {
      return { err }
    }
  } catch (err) {
    return err
  }
}

let customerBalance = async (customerData, amount) => {
  let { currentWalletBalance, walletFreeBalance } = customerData
  currentWalletBalance = Number(currentWalletBalance)
  walletFreeBalance = Number(walletFreeBalance)
  let paymentGateWayAmount = 0
  if (amount >= currentWalletBalance) {
    let checkAmount = amount - currentWalletBalance
    paymentGateWayAmount = checkAmount
    currentWalletBalance = 0
    walletFreeBalance = 0
  } else {
    currentWalletBalance = currentWalletBalance - amount
    if (currentWalletBalance < walletFreeBalance) {

      walletFreeBalance = currentWalletBalance
    }
  }

  return {
    paymentGateWayAmount,
    currentWalletBalance,
    walletFreeBalance
  }
}

let customerNonSellableMetal = async (currentMetalWeight, sellableMetal, nonSellableMetal, deliveryMetal) => {
  currentMetalWeight = currentMetalWeight - deliveryMetal

  checkRemaingBalance = deliveryMetal - nonSellableMetal

  nonSellableMetal = Math.abs(checkRemaingBalance);

  if (checkRemaingBalance > 0) {
    nonSellableMetal = 0
    sellableMetal = sellableMetal - checkRemaingBalance
  }

  return {
    sellableMetal,
    nonSellableMetal,
    currentMetalWeight
  }
}

let transactionDetail = async (customerId, paymentFor, searchParam, fromParam, toParam) =>{

  if (paymentFor) {
    orderTypeData = await models.digiGoldOrderType.findOne({ where: { orderType: paymentFor } })
  }

  let query = {};

  const { search, offset, pageSize } = paginationWithFromTo(
    searchParam, fromParam, toParam
  );

  let searchQuery = {
    [Op.and]: [query, {
      [Op.or]: {
      depositStatus: sequelize.where(
          sequelize.cast(sequelize.col("walletTransactionDetails.deposit_status"), "varchar"),
          {
              [Op.iLike]: search + "%",
          }
      ),
      applicationDate: sequelize.where(
          sequelize.cast(sequelize.col("walletTransactionDetails.deposit_date"), "varchar"),
          {
              [Op.iLike]: search + "%",
          }
      ),
      mobileNumber: sequelize.where(
        sequelize.cast(sequelize.col("customer.mobile_number"), "varchar"),
        {
            [Op.iLike]: search + "%",
        }
    ),
      "$walletTransactionDetails.bank_name$": { [Op.iLike]: search + '%' },
      "$walletTransactionDetails.cheque_number$": { [Op.iLike]: search + '%' },
      "$walletTransactionDetails.branch_name$": { [Op.iLike]: search + '%' },
      "$walletTransactionDetails.transaction_unique_id$": { [Op.iLike]: search + '%' },
      "$walletTransactionDetails.ifsc_code$": { [Op.iLike]: search + '%' },
      "$walletTransactionDetails.payment_type$": { [Op.iLike]: search + '%' },
      "$walletTransactionDetails.bank_transaction_unique_id$": { [Op.iLike]: search + '%' },
      "$walletTransactionDetails.razorpay_payment_id$": { [Op.iLike]: search + '%' },
      "$customer.customer_unique_id$": { [Op.iLike]: search + '%' },
      "$customer.first_name$": { [Op.iLike]: search + '%' },
      "$customer.last_name$": { [Op.iLike]: search + '%' },

      },
    }
  ],
    // customerId: id,
    // orderTypeId: { [Op.notIn]: [4] }
  };

  if (!paymentFor) {
    searchQuery.paymentOrderTypeId = { [Op.in]: [4, 5, 6] }
    searchQuery.customerId = customerId
    searchQuery.transactionStatus = "completed"
    // searchQuery.orderTypeId = { [Op.notIn]: [4] }

  }
  if (paymentFor) {
    if (orderTypeData.id == 4) {
      searchQuery.paymentOrderTypeId = { [Op.in]: [4] }
      searchQuery.customerId = customerId,
        searchQuery.transactionStatus = "completed"
      // searchQuery.orderTypeId = { [Op.notIn]: [4] }
    }
    else if (orderTypeData.id == 5) {
      searchQuery.paymentOrderTypeId = { [Op.in]: [5] }
      searchQuery.customerId = customerId
      searchQuery.transactionStatus = "completed"
      // searchQuery.orderTypeId = { [Op.notIn]: [4] }
    } else if (orderTypeData.id == 6) {
      searchQuery.paymentOrderTypeId = { [Op.in]: [6] }
      searchQuery.customerId = customerId
      searchQuery.transactionStatus = "completed"
      // searchQuery.orderTypeId = { [Op.notIn]: [4] }
    }
  }


  let includeArray = [
    {
      model: models.walletTransactionDetails,
      as: 'walletTransactionDetails',
      include:{
        model: models.customer,
        as: "customer",
        attributes: ['customerUniqueId', 'firstName', 'lastName', 'mobileNumber', 'email']
      }
    },
    {
      model: models.digiGoldOrderDetail,
      as: 'digiGoldOrderDetail',
      include:{
        model: models.customer,
        as: "customer",
        attributes: ['customerUniqueId', 'firstName', 'lastName', 'mobileNumber', 'email']
      }
    },
    {
      model: models.customer,
      as: "customer",
      attributes: ['customerUniqueId', 'firstName', 'lastName', 'mobileNumber', 'email']
    },
    {
      model: models.orders,
      as: "goldEmiOrderDetail",
      attributes: ['blockId', 'orderUniqueId', 'proformaInvoiceNo', 'invoiceNumber','invoiceDate', 'orderReferenceNumber', 'customerId', 'productId', 'weight', 'quantity', 'currentWalletBalance']
    },
    {
      model: models.orderEmiDetails,
      as: "orderEmiDetail",
      // raw: true,
      attributes: ['orderId', 'emiAmount', 'emiBalancePayment', 'emiPaidAmount', 'paymentDescription', 'walletId'],
      include:{
        model: models.paymentTransaction,
        as: "paymentTransaction",
        attributes: ['id', 'orderEmiId', 'ordertransactionId'],
        // raw: true,
        include: {
          model: models.orderTransaction,
          as: "orderTransactionDetails",
          // raw: true,
          attributes: ['id'],
        }
      }
    }
  ]

  let transactionDetails = await models.walletDetails.findAll({
    where: searchQuery,
    order: [['updatedAt', 'DESC']],
    include: includeArray,
    offset: offset,
    limit: pageSize,
    subQuery: false,
  });


  for(let transaction of transactionDetails){
    if(transaction && transaction.orderEmiDetail && transaction.orderEmiDetail.paymentTransaction && transaction.orderEmiDetail.paymentTransaction.orderTransactionDetails){
      let id = transaction.orderEmiDetail.paymentTransaction.orderTransactionDetails.id;
  
      let transactionData = await models.orderTransaction.findOne({where: { id: id}});
      
      transaction.orderEmiDetail.paymentTransaction.orderTransactionDetails.transactionId = transactionData.transactionId;
      transaction.orderEmiDetail.paymentTransaction.orderTransactionDetails.transactionUniqueId = transactionData.transactionUniqueId;

    }
  }
  

  let count = await models.walletDetails.findAll({
    where: searchQuery,
    include: includeArray
  });

  if (check.isEmpty(transactionDetails)) {
    return {
      transactionDetails: [],
      count: 0
    }
  }

  return {
    transactionDetails,
    count
  }
}


module.exports = {
  walletBuy: walletBuy,
  walletDelivery: walletDelivery,
  customerBalance: customerBalance,
  walletTransactionDetailById: walletTransactionDetailById,
  customerNonSellableMetal: customerNonSellableMetal,
  transactionDetail: transactionDetail
}