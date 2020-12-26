const qs = require('qs');
const uniqid = require('uniqid');
const crypto = require('crypto');
const moment = require('moment');
const path = require('path');
const models = require('../../models');
const check = require('../../lib/checkLib');
const getRazorPayDetails = require('../../utils/razorpay');
const { paginationWithFromTo } = require('../../utils/pagination');
// let sms = require('../../../utils/sendSMS');
let sms = require('../../utils/SMS');
var pdf = require("pdf-creator-node");
var fs = require('fs');
const numToWords = require('../../utils/numToWords');
const errorLogger = require('../../utils/errorLogger');
const sequelize = models.sequelize;
const Sequelize = models.Sequelize;
const Op = Sequelize.Op;
const walletService = require('../../service/wallet');
const { walletBuy, walletDelivery } = require('../../service/wallet');
const getMerchantData = require('../auth/getMerchantData');


exports.makePayment = async (req, res) => {
  try {
    const id = req.userData.id;

    const { amount, paymentType, depositDate, chequeNumber, bankName, branchName, bankTransactionId, orderAmount, metalType, qtyAmtType, quantity, type, redirectOn,
      lockPrice, blockId, quantityBased, modeOfPayment,
      shippingCharges, totalQuantity, totalWeight, userAddressId, cartData, orderAddress } = req.body;

    let customerDetails = await models.customer.findOne({
      where: { id, isActive: true },
    });
    if (check.isEmpty(customerDetails)) {
      return res.status(404).json({ message: "Customer Does Not Exists" });
    };
    let transactionUniqueId = uniqid.time().toUpperCase();
    let tempWallet;

    // const checkLimit = await checkBuyLimit(id, orderAmount);
    // if(!checkLimit.success){
    //   return res.status(404).json({ message: checkLimit.message });
    // }

    if (paymentType == 'upi' || paymentType == 'netbanking' || paymentType == 'wallet' || paymentType == 'card') {

      let newAmmount = await amount * 100;
      let sendAmount = await Math.round(newAmmount);
      let tempOrderDetail;
      let razorPayOrder;

      const razorPay = await getRazorPayDetails();

      await sequelize.transaction(async (t) => {

        razorPayOrder = await razorPay.instance.orders.create(
          { amount: sendAmount, currency: "INR", payment_capture: 1 }
        );

        tempWalletDeopsit = await models.walletTempDetails.create({ customerId: id, amount: amount, paymentDirection: "credit", description: "add amount", productTypeId: 4, transactionDate: depositDate }, { transaction: t });

        tempOrderDetail = await models.walletTransactionTempDetails.create({ customerId: id, productTypeId: 4, orderTypeId: 4, walletTempId: tempWalletDeopsit.id, transactionUniqueId, razorPayTransactionId: razorPayOrder.id, paymentType, transactionAmount: amount, paymentReceivedDate: depositDate, orderAmount, metalType, qtyAmtType, quantity, type, redirectOn }, { transaction: t });

        if (type == "buy") {

          let walletData = await models.walletTempDetails.create({ customerId: id, amount: orderAmount, paymentDirection: "debit", description: "buy product", productTypeId: 1, transactionDate: moment() }, { transaction: t });

          let currentTempBal = Number(customerDetails.currentWalletBalance) - Number(orderAmount);

          let tempOrderData = await models.digiGoldTempOrderDetail.create({ customerId: id, orderTypeId: 1, totalAmount: orderAmount, metalType, quantity, lockPrice, blockId, amount: orderAmount, quantityBased, modeOfPayment: modeOfPayment, createdBy: 1, modifiedBy: 1, walletTempId: walletData.id, walletBalance: currentTempBal, razorpayOrderId: razorPayOrder.id }, { transaction: t });

        } else if (type == "delivery") {

          let walletData = await models.walletTempDetails.create({ customerId: id, amount: orderAmount, paymentDirection: "debit", description: "delivery", productTypeId: 3, transactionDate: moment() }, { transaction: t });

          let orderUniqueId = `dg_delivery${Math.floor(1000 + Math.random() * 9000)}`;
          let currentTempWalletBal = Number(customerDetails.currentWalletBalance) - Number(orderAmount);

          tempOrderDetail = await models.digiGoldTempOrderDetail.create({ customerId: id, orderTypeId: 3, totalAmount: orderAmount, blockId: orderUniqueId, amount: orderAmount, modeOfPayment: modeOfPayment, createdBy: 1, modifiedBy: 1, deliveryShippingCharges: shippingCharges, deliveryTotalQuantity: totalQuantity, deliveryTotalWeight: totalWeight, userAddressId, walletTempId: walletData.id, walletBalance: currentTempWalletBal, razorpayOrderId: razorPayOrder.id }, { transaction: t });

          for (let cart of cartData) {
            await models.digiGoldTempOrderProductDetail.create({ tempOrderDetailId: tempOrderDetail.id, productSku: cart.productSku, productWeight: cart.productWeight, productName: cart.productName, amount: cart.amount, productImage: cart.productImage, totalAmount: cart.totalProductAmount, metalType: cart.metalType, quantity: cart.quantity, createdBy: 1, modifiedBy: 1 }, { transaction: t });
          }

          for (let address of orderAddress) {
            await models.digiGoldTempOrderAddress.create({ tempOrderDetailId: tempOrderDetail.id, customerName: address.customerName, addressType: address.addressType, address: address.address, stateId: address.stateId, cityId: address.cityId, pinCode: address.pinCode }, { transaction: t });
          }
        }
      })

      return res.status(200).json({ amount, razorPayOrder, razorPay: razorPay.razorPayConfig.key_id, tempOrderDetail });

    } else {

      await sequelize.transaction(async (t) => {

        tempWallet = await models.walletTempDetails.create({ customerId: id, amount: amount, paymentDirection: "credit", description: "add amount", productTypeId: 4, transactionDate: moment() }, { transaction: t });
        console.log(tempWallet);
        tempOrderDetail = await models.walletTransactionTempDetails.create({ customerId: id, productTypeId: 4, orderTypeId: 4, walletTempId: tempWallet.id, transactionUniqueId, bankTransactionUniqueId: bankTransactionId, paymentType, transactionAmount: amount, paymentReceivedDate: depositDate, chequeNumber, bankName, branchName }, { transaction: t });

      })
      return res.status(200).json({ amount, transactionUniqueId });
    }
  } catch (err) {
    console.log(err);
  }

}

exports.addAmountWallet = async (req, res) => {
  try {

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, transactionUniqueId } = req.body;
    let walletTransactionDetails;
    if (razorpay_order_id && razorpay_payment_id && razorpay_signature) {

      let tempWalletTransaction = await models.walletTransactionTempDetails.getWalletTempTransactionDetails(razorpay_order_id);

      let tempWalletDetail = await models.walletTempDetails.getTempWalletData(tempWalletTransaction.walletTempId);

  
      let customer = await models.customer.findOne({ where: { id: tempWalletTransaction.customerId } });

      const razorPay = await getRazorPayDetails();
      const generated_signature = crypto
        .createHmac(
          "SHA256",
          razorPay.razorPayConfig.key_secret
        )
        .update(razorpay_order_id + "|" + razorpay_payment_id)
        .digest("hex");
      if (generated_signature == razorpay_signature) {
        signatureVerification = true
      }
      if (signatureVerification == false) {
        return res.status(422).json({ message: "Payment verification failed" });
      }

      await models.axios({
        method: 'PATCH',
        url: `https://api.razorpay.com/v1/payments/${razorpay_payment_id}`,
        auth: {
          username: razorPay.razorPayConfig.key_id,
          password: razorPay.razorPayConfig.key_secret
        },
        data: qs.stringify({ notes: { transactionId: tempWalletTransaction.transactionUniqueId, uniqueId: customer.customerUniqueId } })
      });
      //if order for buy product

      let customerUpdatedBalance
      if (customer.currentWalletBalance) {
        customerUpdatedBalance = Number(customer.currentWalletBalance) + Number(tempWalletTransaction.transactionAmount);
      } else {
        customerUpdatedBalance = Number(tempWalletTransaction.transactionAmount);
      }
      let WalletDetail;
      await sequelize.transaction(async (t) => {
        await models.customer.update({ currentWalletBalance: customerUpdatedBalance }, { where: { id: customer.id } })

        WalletDetail = await models.walletDetails.create({ customerId: tempWalletDetail.customerId, amount: tempWalletDetail.amount, paymentDirection: "credit", description: "add amount", productTypeId: 4, transactionDate: tempWalletDetail.transactionDate, walletTempDetailId: tempWalletDetail.id }, { transaction: t });

        walletTransactionDetails = await models.walletTransactionDetails.create({ customerId: tempWalletTransaction.customerId, productTypeId: 4, orderTypeId: 4, walletId: WalletDetail.id, transactionUniqueId: tempWalletTransaction.transactionUniqueId, razorpayOrderId: razorpay_order_id, razorpayPaymentId: razorpay_payment_id, razorpaySignature: razorpay_signature, paymentType: tempWalletTransaction.paymentType, transactionAmount: tempWalletTransaction.transactionAmount, paymentReceivedDate: tempWalletTransaction.paymentReceivedDate, depositDate: tempWalletTransaction.paymentReceivedDate, depositApprovedDate: tempWalletTransaction.paymentReceivedDate, depositStatus: "completed", runningBalance: customerUpdatedBalance, freeBalance: customer.walletFreeBalance }, { transaction: t })

        await models.walletTransactionTempDetails.update({ isOrderPlaced: true }, { where: { id: tempWalletTransaction.id }, transaction: t });

      });
      let orderData = await models.digiGoldTempOrderDetail.findOne({ where: { razorpayOrderId: razorpay_order_id } });

      if (!orderData) {

        let orderData = {
          amount: tempWalletTransaction.orderAmount,
          metalType: tempWalletTransaction.metalType,
          qtyAmtType: tempWalletTransaction.qtyAmtType,
          quantity: tempWalletTransaction.quantity,
          type: tempWalletTransaction.type,
          redirectOn: process.env.DIGITALGOLDAPI + tempWalletTransaction.redirectOn
        }

        if (tempWalletTransaction.redirectOn) {

          // res.redirect(`http://localhost:4500${tempWalletTransaction.redirectOn}${walletTransactionDetails.id}`);
          res.redirect(`${process.env.BASE_URL_CUSTOMER}${tempWalletTransaction.redirectOn}${walletTransactionDetails.id}`);

        } else {
          return res.status(200).json({ message: "success", walletTransactionDetails });
        }

      } else {
        // if wallet called for buy product
        if (tempWalletTransaction.type == "buy") {
          let tempOrderData;
          let currentTempBal;
          let walletData

          let orderBuy = await walletBuy(walletTransactionDetails.customerId, orderData.lockPrice, orderData.metalType, orderData.blockId, orderData.modeOfPayment, orderData.quantity, orderData.orderAmount, orderData.id, orderData.quantityBased, orderData.walletTempId, orderData.id);
          if (orderBuy.message) {
            res.redirect(`${process.env.BASE_URL_CUSTOMER}${tempWalletTransaction.redirectOn}${walletTransactionDetails.id}`);
          }
          if (tempWalletTransaction.redirectOn) {
            // return res.status(200).json({ message: "success", orderBuy });
            console.log(orderBuy, orderBuy.result.data.metalType);

            res.cookie(`metalObject`, `${JSON.stringify(orderBuy.result.data.metalType)}`);
            // res.redirect(`http://localhost:4200${tempWalletTransaction.redirectOn}${orderBuy.result.data.merchantTransactionId}`);

            res.redirect(`${process.env.BASE_URL_CUSTOMER}${tempWalletTransaction.redirectOn}${orderBuy.result.data.merchantTransactionId}`);
          } else {
            return res.status(200).json({ message: "success", orderBuy });
          }

        } else if (tempWalletTransaction.type == "delivery") {
          // if wallet called for delivery product 
          console.log(tempWalletTransaction.type);
          let cartData = await models.digiGoldTempOrderProductDetail.findAll({ where: { tempOrderDetailId: orderData.id } });

          let orderAddress = await models.digiGoldTempOrderAddress.findAll({ where: { tempOrderDetailId: orderData.id } })

          let orderDelivery = await walletDelivery(walletTransactionDetails.customerId, orderData.amount, orderData.modeOfPayment, orderData.orderTypeId, cartData, orderData.deliveryTotalQuantity, orderData.deliveryTotalWeight, orderAddress, orderData.userAddressId, orderData.walletTempId, orderData.id, orderData.blockId);

          if (tempWalletTransaction.redirectOn) {
            console.log(orderDelivery);

            res.redirect(`${process.env.BASE_URL_CUSTOMER}${tempWalletTransaction.redirectOn}${orderDelivery.result.data.merchantTransactionId}`);
          } else {
            return res.status(200).json({ message: "success", orderDelivery });
          }


        }
      }
    } else {
      if (!transactionUniqueId) {
        return res.status(404).json({ message: "Transaction Unique Id is required" });
      }
      let tempWalletTransaction = await models.walletTransactionTempDetails.findOne({ where: { transactionUniqueId: transactionUniqueId } });

      if (!tempWalletTransaction) {
        return res.status(404).json({ message: "Order Does Not Exists" });
      }
      if (tempWalletTransaction.isOrderPlaced == true) {
        return res.status(422).json({ message: "Order id already placed for this order ID" });
      }

      let customer = await models.customer.findOne({ where: { id: tempWalletTransaction.customerId } });

      await sequelize.transaction(async (t) => {

        walletTransactionDetails = await models.walletTransactionDetails.create({ customerId: tempWalletTransaction.customerId, productTypeId: 4, orderTypeId: 4, transactionUniqueId, bankTransactionUniqueId: tempWalletTransaction.bankTransactionUniqueId, paymentType: tempWalletTransaction.paymentType, transactionAmount: tempWalletTransaction.transactionAmount, paymentReceivedDate: tempWalletTransaction.paymentReceivedDate, depositDate: tempWalletTransaction.paymentReceivedDate, chequeNumber: tempWalletTransaction.chequeNumber, bankName: tempWalletTransaction.bankName, branchName: tempWalletTransaction.branchName, depositStatus: "pending", runningBalance: customer.currentWalletBalance, freeBalance: customer.walletFreeBalance }, { transaction: t });

        await models.walletTransactionTempDetails.update({ isOrderPlaced: true }, { where: { id: tempWalletTransaction.id }, transaction: t });

      })

      return res.status(200).json({ message: "Payment request created Successfully", walletTransactionDetails });
    }

  } catch (err) {
    console.log(err);

    // let errorData = errorLogger(JSON.stringify(err), req.url, req.method, req.hostname, req.body);

    // if (err.response) {
    //   return res.status(422).json(err.response.data);
    // } else {
    //   console.log('Error', err.message);
    // }
    if (err.response) {
      if (err.response.data.errors.userKyc && err.response.data.errors.userKyc.length) {

        res.cookie(`KYCError`, `${JSON.stringify(err.response.data.errors.userKyc[0].message)}`);
        res.redirect(`https://${process.env.DIGITALGOLDAPI}/kyc/digi-gold`);
      } else {
        return res.status(422).json(err.response.data);
      }
    } else {
      console.log('Error', err.message);
    }
  }
}

exports.getAllDepositDetails = async (req, res) => {

  const id = req.userData.id;
  let { orderTypeId, depositStatus } = req.query

  const { search, offset, pageSize } = paginationWithFromTo(
    req.query.search,
    req.query.from,
    req.query.to
  );
  if (!orderTypeId) {
    return res.status(404).json({ message: 'orderTypeId is required' });
  }
  // if (!depositStatus) {
  //     return res.status(404).json({ message: 'depositStatus is required' });
  // }

  let orderTypeData = await models.digiGoldOrderType.findOne({ where: { id: orderTypeId, isActive: true } })


  if (!orderTypeData) {
    return res.status(404).json({ message: 'Data not found' });
  }
  let query = {};
  if (orderTypeId) {
    query.orderTypeId = orderTypeData.id
  }
  if (depositStatus) {
    query.depositStatus = depositStatus
  }

  let searchQuery = {
    [Op.and]: [query, {
      [Op.or]: {
        depositStatus: sequelize.where(
          sequelize.cast(sequelize.col("walletTransactionDetails.deposit_status"), "varchar"),
          {
            [Op.iLike]: search + "%",
          }
        ),
        depositDate: sequelize.where(
          sequelize.cast(sequelize.col("walletTransactionDetails.deposit_date"), "varchar"),
          {
            [Op.iLike]: search + "%",
          }
        ),
        paymentType: sequelize.where(
          sequelize.cast(sequelize.col("walletTransactionDetails.payment_type"), "varchar"),
          {
            [Op.iLike]: search + "%",
          }
        ),
        // "$walletTransactionDetails.payment_type$": { [Op.iLike]: search + '%' },
        "$walletTransactionDetails.bank_name$": { [Op.iLike]: search + '%' },
        "$walletTransactionDetails.cheque_number$": { [Op.iLike]: search + '%' },

        "$walletTransactionDetails.branch_name$": { [Op.iLike]: search + '%' },
      },
    }],
    // isActive: true,
    customerId: id,

  };

  let includeArray = [
    {
      model: models.customer,
      as: 'customer',

      attributes: ['id', 'customerUniqueId', 'firstName', 'lastName']
    }
  ]

  let depositDetail = await models.walletTransactionDetails.findAll({
    include: includeArray,
    where: searchQuery,
    offset: offset,
    limit: pageSize,
    subQuery: false,
  });

  let count = await models.walletTransactionDetails.findAll({
    where: searchQuery,
    order: [
      ["updatedAt", "DESC"]
    ],
    include: includeArray

  });

  if (check.isEmpty(depositDetail)) {
    return res.status(200).json({
      depositDetail: [], count: 0
    })
  }
  return res.status(200).json({ depositDetail: depositDetail, count: count.length });

}


exports.getWalletDetailById = async (req, res) => {
  try {

    let depositWithdrawId = req.params.depositWithdrawId;

    let transactionData = await models.walletTransactionDetails.findOne({
      where: { id: depositWithdrawId },
      include: {
        model: models.customer,
        as: 'customer',
        attributes: ['customerUniqueId', 'firstName', 'lastName', 'mobileNumber']
      }
    });

    if (!transactionData) {
      return res.status(404).json({ message: 'Data not found' });
    } else {
      return res.status(200).json({ transactionData });
    }
  } catch (err) {
    console.log(err);
  }

}

exports.getTransactionDetails = async (req, res) => {
  const id = req.userData.id;
  const { paymentFor } = req.query;
  // if (!orderTypeId) {
  //     return res.status(404).json({ message: 'orderTypeId is required' });
  // }
  let orderTypeData
  if (paymentFor) {
    orderTypeData = await models.digiGoldOrderType.findOne({ where: { orderType: paymentFor } })
  }
  // if (!orderTypeData) {
  //     return res.status(404).json({ message: 'Data not found' });
  // }
  let query = {};
  if (paymentFor) {
    query.orderTypeId = orderTypeData.id
  }
  const { search, offset, pageSize } = paginationWithFromTo(
    req.query.search,
    req.query.from,
    req.query.to
  );

  let searchQuery = {
    [Op.and]: [query, {
      [Op.or]: {


        // depositStatus: sequelize.where(
        // sequelize.cast(sequelize.col("walletTransactionDetails.deposit_status"), "varchar"),
        // {
        // [Op.iLike]: search + "%",
        // }
        // ),
        paymentType: sequelize.where(
          sequelize.cast(sequelize.col("walletTransactionDetails.payment_type"), "varchar"),
          {
            [Op.iLike]: search + "%",
          }
        ),

        // "$walletTransactionDetails.payment_type$": { [Op.iLike]: search + '%' },
        "$walletTransactionDetails.bank_name$": { [Op.iLike]: search + '%' },
        "$walletTransactionDetails.cheque_number$": { [Op.iLike]: search + '%' },

        "$walletTransactionDetails.branch_name$": { [Op.iLike]: search + '%' },
      },
    }],
    // isActive: true,
    // customerId: CusData,
    customerId: id,
    depositStatus: 'completed',
    // paymentType: { [Op.in]: ['4', '5'] }

  };

  let includeArray = [
    {
      model: models.walletDetails,
      as: 'wallet',
      attributes: ['customerId', 'paymentDirection', 'description']
    }
  ]

  let transactionDetails = await models.walletTransactionDetails.findAll({
    where: searchQuery,
    include: includeArray,
    offset: offset,
    limit: pageSize,
    subQuery: false,
  });

  let count = await models.walletTransactionDetails.findAll({
    where: searchQuery,
    include: includeArray,
    order: [
      ["updatedAt", "DESC"]
    ],
    offset: offset,
    limit: pageSize,
    subQuery: false,
  });

  if (check.isEmpty(transactionDetails)) {
    return res.status(200).json({
      data: [], count: 0

    })
  }
  return res.status(200).json({ transactionDetails, count: count.length });

}

exports.getWalletBalance = async (req, res) => {
  const id = req.userData.id;

  let getWalletbalance = await models.customer.findOne({ where: { id: id, isActive: true } })

  if (check.isEmpty(getWalletbalance)) {
    return res.status(400).json({ message: `Data Not Found.` });
  } else {

    const walletFreeBalance = getWalletbalance.walletFreeBalance ? getWalletbalance.walletFreeBalance.toFixed(2) : 0.00;
    const currentWalletBalance = getWalletbalance.currentWalletBalance ? getWalletbalance.currentWalletBalance.toFixed(2) : 0.00;
    return res.status(200).json({ walletFreeBalance, currentWalletBalance, customerUniqueId: getWalletbalance.customerUniqueId });
  }
}

exports.withdrawAmount = async (req, res) => {
  const { withdrawAmount, bankName, branchName, accountHolderName, accountNumber, ifscCode } = req.body;

  const id = req.userData.id;

  let customerFreeBalance = await models.customer.findOne({ where: { id: id, isActive: true } })
  if (customerFreeBalance.walletFreeBalance < withdrawAmount) {

    return res.status(400).json({ message: `Insufficient free wallet balance.` });
  } else {
    let tempOrderDetail;
    let orderDetail
    await sequelize.transaction(async (t) => {

      tempWallet = await models.walletTempDetails.create({ customerId: id, amount: withdrawAmount, paymentDirection: "debit", description: "withdraw amount", productTypeId: 4 }, { transaction: t });

      let transactionUniqueId = uniqid.time().toUpperCase();

      tempOrderDetail = await models.walletTransactionTempDetails.create({ customerId: id, productTypeId: 4, orderTypeId: 5, walletTempId: tempWallet.id, transactionUniqueId, transactionAmount: withdrawAmount, bankName: bankName, branchName: branchName, accountHolderName: accountHolderName, accountNumber: accountNumber, ifscCode: ifscCode, paymentReceivedDate: moment() }, { transaction: t });

      orderDetail = await models.walletTransactionDetails.create({ customerId: id, productTypeId: 4, orderTypeId: 5, transactionUniqueId, transactionAmount: withdrawAmount, bankName: bankName, branchName: branchName, accountHolderName: accountHolderName, accountNumber: accountNumber, ifscCode: ifscCode, depositStatus: "pending", paymentReceivedDate: moment() }, { transaction: t });

    })

    return res.status(200).json({ message: `Success`, orderDetail });
  }

}


exports.AddCustomerBankDetails = async (req, res) => {

  const { bankName, bankBranchName, accountType, accountHolderName, accountNumber, ifscCode } = req.body;

  const id = req.userData.id;

  customerBankDetails = await models.customerBankDetails.create({ customerId: id, moduleId: 4, description: 'withdraw wallet amount', bankName: bankName, bankBranchName, accountType, accountHolderName, accountNumber, ifscCode, isActive: 'true' });

  if (customerBankDetails) {
    return res.status(200).json({ message: 'Success' });
  } else {
    return res.status(404).json({ message: `Failed to add bank details.` });
  }



}

exports.getAllBankDetails = async (req, res) => {

  const id = req.userData.id;
  let bankDetails = await models.customerBankDetails.findAll({
    where: { customerId: id, isActive: 'true' },
    include: {
      model: models.customer,
      as: "customer",
      attributes: ['customerUniqueId', 'firstName', 'lastName', 'mobileNumber']
    }
  });

  if (check.isEmpty(bankDetails)) {
    bankDetails = []
    return res.status(200).json({ bankDetails });
  } else {
    return res.status(200).json({ bankDetails });
  }


}


async function checkBuyLimit(id, totalAmount) {

  totalAmount = totalAmount

  const customerList = await models.digiGoldOrderDetail.findAll({
    where: { customerId: id, orderTypeId: '1' },
  });

  const digiGoldKycLimit = await models.digiGoldConfigDetails.findOne({
    where: { configSettingName: 'digiGoldKycLimit', isActive: "true" },
  });

  const customer = await models.customer.findOne({
    where: { id },
  });


  const limit = digiGoldKycLimit.configSettingValue;


  if (customerList.length != 0) {
    let totalAmountOfAll = 0;

    for (let data of customerList) {
      totalAmountOfAll += Number(data.totalAmount);
    }

    let total = totalAmountOfAll.toFixed(2)

    if (total > limit && customer.digiKycStatus == 'pending') {

      const panno = customer.panCardNumber

      if ((customer.panType == "pan" && customer.panCardNumber != '' && customer.panCardNumber != null) || customer.panType == "form60") {

        return ({ message: "your kyc status is pending", success: false });

      } else {

        return ({ message: "your kyc  is pending.Please complete Kyc first" });

      }

    } else if (totalAmount > limit && customer.digiKycStatus == 'pending') {

      const panno = customer.panCardNumber


      if ((customer.panType == "pan" && customer.panCardNumber != '' && customer.panCardNumber != null) || customer.panType == "form60") {

        return ({ message: "your kyc status is pending", success: false });

      } else {

        return ({ message: "your kyc  is pending.Please complete Kyc first" });

      }

    } else if (total > limit && customer.digiKycStatus == 'approved') {

      return ({ message: "your kyc  is approved", success: true });
    } else if (totalAmount >= limit && customer.digiKycStatus == 'approved') {

      return ({ message: "your kyc  is approved", success: true });
    } else if (total < limit && customer.digiKycStatus == 'approved' || customer.digiKycStatus == 'pending') {

      return ({ message: "no need of kyc", success: true });
    } else if (total > limit && customer.digiKycStatus == 'rejected') {

      return ({ message: "your kyc approval is rejected", success: false });
    } else if (totalAmount > limit && customer.digiKycStatus == 'rejected') {


      return ({ message: "your kyc approval is rejected", success: false });
    } else if (total > limit && customer.digiKycStatus == 'waiting') {

      // if ((customer.panType == "pan" && customer.panCardNumber != '' && customer.panCardNumber != null) || customer.panType == "form60") {

      if ((customer.panType == "pan" && customer.panCardNumber != '' && customer.panCardNumber != null) || customer.panType == "form60") {

        return ({ message: "your kyc approval is pending", success: false });

      }
    } else if (totalAmount >= limit && customer.digiKycStatus == 'waiting') {

      // if ((customer.panType == "pan" && customer.panCardNumber != '' && customer.panCardNumber != null) || customer.panType == "form60") {

      if ((customer.panType == "pan" && customer.panCardNumber != '' && customer.panCardNumber != null) || customer.panType == "form60") {

        return ({ message: "your kyc approval is pending", success: false });

      }
    }


  } else {

    if (totalAmount >= limit && customer.digiKycStatus == 'approved') {

      return ({ message: "your kyc  is approved", success: true });
    } else if (totalAmount >= limit && customer.digiKycStatus == 'pending') {
      if ((customer.panType == "pan" && customer.panCardNumber != '' && customer.panCardNumber != null) || customer.panType == "form60") {

        return ({ message: "your kyc status is pending", success: false });
      } else {

        return ({ message: "your kyc status is pending.Please complete Kyc first", success: false });
      }
    } else if (totalAmount < limit && customer.digiKycStatus == 'approved'
      || customer.digiKycStatus == 'pending') {

      return ({ message: "no need of kyc", success: true });

    }
  }
}