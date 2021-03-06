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
const { walletBuy, walletDelivery, customerBalance, customerNonSellableMetal, transactionDetail } = require('../../service/wallet');
const { postMerchantOrder, getUserData, postBuy, addBankDetailInAugmontDb, checkKycStatus, checkBuyLimit } = require('../../service/digiGold')

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

    let checkCustomerKycStatus = await checkKycStatus(id);

    if (checkCustomerKycStatus) {
      return res.status(420).json({ message: "Your KYC status is Rejected" });
    }
    let transactionUniqueId = uniqid.time().toUpperCase();
    let tempWallet;

    if (type == "buy") {
      const checkLimit = await checkBuyLimit(id, orderAmount);
      if (!checkLimit.success) {
        return res.status(422).json({ message: checkLimit.message });
      }
    }


    if (paymentType == 'upi' || paymentType == 'netbanking' || paymentType == 'wallet' || paymentType == 'card') {

      let newAmmount = await amount * 100;
      let sendAmount = await Math.round(newAmmount);
      let tempOrderDetail;
      let razorPayOrder;

      const razorPay = await getRazorPayDetails();

      await sequelize.transaction(async (t) => {

        razorPayOrder = await razorPay.instance.orders.create(
          { amount: sendAmount, currency: "INR", payment_capture: 1, notes: { product: "digi gold", customerId: customerDetails.customerUniqueId } }
        );

        tempWalletDeopsit = await models.walletTempDetails.create({ customerId: id, amount: amount, paymentDirection: "credit", description: "Amount added to your Augmont Wallet", productTypeId: 4, transactionDate: depositDate }, { transaction: t });

        tempOrderDetail = await models.walletTransactionTempDetails.create({ customerId: id, productTypeId: 4, orderTypeId: 4, walletTempId: tempWalletDeopsit.id, transactionUniqueId, razorPayTransactionId: razorPayOrder.id, paymentType, transactionAmount: amount, paymentReceivedDate: depositDate, orderAmount, metalType, qtyAmtType, quantity, type, redirectOn }, { transaction: t });

        if (type == "buy") {

          let walletData = await models.walletTempDetails.create({ customerId: id, amount: orderAmount, paymentDirection: "debit", description: `${metalType.charAt(0).toUpperCase() + metalType.slice(1)} Bought ${quantity} grams`, productTypeId: 1, transactionDate: moment() }, { transaction: t });

          let currentTempBal = Number(customerDetails.currentWalletBalance) - Number(orderAmount);

          let tempOrderData = await models.digiGoldTempOrderDetail.create({ customerId: id, orderTypeId: 1, totalAmount: orderAmount, metalType, quantity, lockPrice, blockId, amount: orderAmount, quantityBased, modeOfPayment: paymentType, createdBy: 1, modifiedBy: 1, walletTempId: walletData.id, walletBalance: currentTempBal, razorpayOrderId: razorPayOrder.id }, { transaction: t });

        } else if (type == "delivery") {

          let walletData = await models.walletTempDetails.create({ customerId: id, amount: orderAmount, paymentDirection: "debit", description: "delivery", productTypeId: 3, transactionDate: moment() }, { transaction: t });

          let orderUniqueId = `dg_delivery${Math.floor(1000 + Math.random() * 9000)}`;
          let currentTempWalletBal = Number(customerDetails.currentWalletBalance) - Number(orderAmount);

          tempOrderDetail = await models.digiGoldTempOrderDetail.create({ customerId: id, orderTypeId: 3, totalAmount: orderAmount, blockId: orderUniqueId, amount: orderAmount, modeOfPayment: paymentType, createdBy: 1, modifiedBy: 1, deliveryShippingCharges: shippingCharges, deliveryTotalQuantity: totalQuantity, deliveryTotalWeight: totalWeight, userAddressId, walletTempId: walletData.id, walletBalance: currentTempWalletBal, razorpayOrderId: razorPayOrder.id }, { transaction: t });

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

        tempWallet = await models.walletTempDetails.create({ customerId: id, amount: amount, paymentDirection: "credit", description: "Amount added to your Augmont Wallet", productTypeId: 4, transactionDate: moment() }, { transaction: t });
        console.log(tempWallet);
        tempOrderDetail = await models.walletTransactionTempDetails.create({ customerId: id, productTypeId: 4, orderTypeId: 4, walletTempId: tempWallet.id, transactionUniqueId, bankTransactionUniqueId: bankTransactionId, paymentType, transactionAmount: amount, paymentReceivedDate: depositDate, chequeNumber, bankName, branchName }, { transaction: t });

      })
      return res.status(200).json({ amount, transactionUniqueId });
    }
  } catch (err) {
    console.log(err);
    await models.errorLogger.create({
      message:  JSON.stringify(err),
      url: req.url,
      method: req.method,
      host: req.hostname,
      body: req.body,
      userData: req.userData
    });
    if (err.statusCode == 400 && err.error.code) {
      return res.status(400).json({ message: err.error.description });
    } else {
      return res.status(400).json({ err });
    }
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


      //if order for buy product

      let customerUpdatedBalance
      if (customer.currentWalletBalance) {
        customerUpdatedBalance = Number(customer.currentWalletBalance) + Number(tempWalletTransaction.transactionAmount);
      } else {
        customerUpdatedBalance = Number(tempWalletTransaction.transactionAmount);
      }
      let WalletDetail;

      let newCustomerUpdatedBalance = customerUpdatedBalance.toFixed(2);


      let output = await sequelize.transaction(async (t) => {

        await models.customer.update({ currentWalletBalance: Number(newCustomerUpdatedBalance) }, { where: { id: customer.id }, transaction: t })

        let getCustomer = await models.customer.findOne({
          transaction: t,
          where: { id: tempWalletDetail.customerId },
          attributes: ['currentWalletBalance', 'walletFreeBalance', 'mobileNumber']
        })

        await models.walletTransactionTempDetails.update({ isOrderPlaced: true }, { where: { id: tempWalletTransaction.id }, transaction: t });

        let orderData = await models.digiGoldTempOrderDetail.findOne({ where: { razorpayOrderId: razorpay_order_id } });

        if (!orderData) {

          await models.axios({
            method: 'PATCH',
            url: `https://api.razorpay.com/v1/payments/${razorpay_payment_id}`,
            auth: {
              username: razorPay.razorPayConfig.key_id,
              password: razorPay.razorPayConfig.key_secret
            },
            data: qs.stringify({ notes: { product: "digi gold", transactionId: tempWalletTransaction.transactionUniqueId, uniqueId: customer.customerUniqueId } })
          });

          WalletDetail = await models.walletDetails.create({ customerId: tempWalletDetail.customerId, amount: tempWalletDetail.amount, paymentDirection: "credit", description: "Amount added to your Augmont Wallet", productTypeId: 4, transactionDate: tempWalletDetail.transactionDate, walletTempDetailId: tempWalletDetail.id, orderTypeId: 4, paymentOrderTypeId: 4, transactionStatus: "completed" }, { transaction: t });

          let newFreeBalance = customer.walletFreeBalance.toFixed(2);

          let newCustUpdatedBalance = customerUpdatedBalance.toFixed(2);

          walletTransactionDetails = await models.walletTransactionDetails.create({ customerId: tempWalletTransaction.customerId, productTypeId: 4, orderTypeId: 4, walletId: WalletDetail.id, transactionUniqueId: tempWalletTransaction.transactionUniqueId, razorpayOrderId: razorpay_order_id, razorpayPaymentId: razorpay_payment_id, razorpaySignature: razorpay_signature, paymentType: tempWalletTransaction.paymentType, transactionAmount: tempWalletTransaction.transactionAmount, paymentReceivedDate: tempWalletTransaction.paymentReceivedDate, depositDate: tempWalletTransaction.paymentReceivedDate, depositApprovedDate: tempWalletTransaction.paymentReceivedDate, depositStatus: "completed", runningBalance: Number(newCustUpdatedBalance), freeBalance: Number(newFreeBalance) }, { transaction: t })


          let orderData = {
            amount: tempWalletTransaction.orderAmount,
            metalType: tempWalletTransaction.metalType,
            qtyAmtType: tempWalletTransaction.qtyAmtType,
            quantity: tempWalletTransaction.quantity,
            type: tempWalletTransaction.type,
            redirectOn: process.env.DIGITALGOLDAPI + tempWalletTransaction.redirectOn
          }

          await sms.sendMessageForDepositRequestAccepted(customer.mobileNumber, tempWalletDetail.amount);

          if (tempWalletTransaction.redirectOn) {
            res.redirect(`${process.env.BASE_URL_CUSTOMER}${tempWalletTransaction.redirectOn}${walletTransactionDetails.id}`);

          } else {
            return { isSuccess: true, status: 200, data: { walletTransactionDetails } }
            // res.status(200).json({ message: "success", walletTransactionDetails });
          }

        } else {
          // if wallet called for buy product
          if (tempWalletTransaction.type == "buy") {
            let tempOrderData;
            let currentTempBal;
            let walletData

            let WalletDetailBuy = await models.walletDetails.create({ customerId: tempWalletDetail.customerId, amount: tempWalletDetail.amount, paymentDirection: "credit", description: `Amount added to your Augmont Wallet`, productTypeId: 4, transactionDate: tempWalletDetail.transactionDate, walletTempDetailId: tempWalletDetail.id, orderTypeId: 1, paymentOrderTypeId: 4, transactionStatus: "completed" }, { transaction: t });

            let newWalletFreeBalanc = customer.walletFreeBalance.toFixed(2);
            let NewCusUpdatedBalance = customerUpdatedBalance.toFixed(2);

            let walletTransactionDetailsBuy = await models.walletTransactionDetails.create({ customerId: tempWalletTransaction.customerId, productTypeId: 4, orderTypeId: 4, walletId: WalletDetailBuy.id, transactionUniqueId: tempWalletTransaction.transactionUniqueId, razorpayOrderId: razorpay_order_id, razorpayPaymentId: razorpay_payment_id, razorpaySignature: razorpay_signature, paymentType: tempWalletTransaction.paymentType, transactionAmount: tempWalletTransaction.transactionAmount, paymentReceivedDate: tempWalletTransaction.paymentReceivedDate, depositDate: tempWalletTransaction.paymentReceivedDate, depositApprovedDate: tempWalletTransaction.paymentReceivedDate, depositStatus: "completed", runningBalance: Number(NewCusUpdatedBalance), freeBalance: Number(newWalletFreeBalanc) }, { transaction: t })


            let walletBuy1 = async (customerId, lockPrice, metalType, blockId, modeOfPayment, quantity, orderAmount, orderId, quantityBased, tempWalletId, temporderDetailId) => {

              let customerDetails = await models.customer.findOne({ where: { id: customerId }, transaction: t });

              const customerUniqueId = customerDetails.customerUniqueId;
              const merchantData = await getMerchantData();


              const getUser = await getUserData(customerUniqueId)

              const getUserDetails = getUser.data.result.data;
              const transactionId = uniqid(merchantData.merchantId, customerUniqueId);

              const data = {
                'lockPrice': lockPrice,
                'emailId': getUserDetails.userEmail,
                'metalType': metalType,
                'merchantTransactionId': razorpay_payment_id,
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

              const customerName = customerDetails.firstName + " " + customerDetails.lastName;

              if (result.isSuccess) {

                await models.axios({
                  method: 'PATCH',
                  url: `https://api.razorpay.com/v1/payments/${razorpay_payment_id}`,
                  auth: {
                    username: razorPay.razorPayConfig.key_id,
                    password: razorPay.razorPayConfig.key_secret
                  },
                  data: qs.stringify({ notes: { product: "digi gold", transactionId: result.data.result.data.transactionId, uniqueId: customer.customerUniqueId } })
                });

                //calculation function
                let checkBalance = await customerBalance(customerDetails, Number(result.data.result.data.totalAmount))
                //calculation function
                let currentBal = Number(customerDetails.currentWalletBalance) - Number(result.data.result.data.totalAmount);

                let newCurrentWalletBal = checkBalance.currentWalletBalance.toFixed(2);
                let newWalletFreeBalance = checkBalance.walletFreeBalance.toFixed(2);

                await models.customer.update({ currentWalletBalance: Number(newCurrentWalletBal), walletFreeBalance: Number(newWalletFreeBalance) }, { where: { id: customerId }, transaction: t })

                let getCustomer1 = await models.customer.findOne({
                  transaction: t,
                  where: { id: tempWalletDetail.customerId },
                  attributes: ['currentWalletBalance', 'walletFreeBalance']
                })

                let orderUniqueId = `dg_buy${Math.floor(1000 + Math.random() * 9000)}`;

                let walletData = await models.walletDetails.create({ customerId: customerId, amount: result.data.result.data.totalAmount, paymentDirection: "debit", description: `${orderData.metalType.charAt(0).toUpperCase() + orderData.metalType.slice(1)} Bought ${orderData.quantity.toFixed(4)} grams`, productTypeId: 4, transactionDate: moment(), walletTempDetailId: tempWalletId, orderTypeId: 1, paymentOrderTypeId: 6, transactionStatus: "completed" }, { transaction: t });

                let orderCreatedDate = moment(moment().utcOffset("+05:30"));

                let orderDetail = await models.digiGoldOrderDetail.create({ tempOrderId: temporderDetailId, customerId: customerId, orderTypeId: 1, orderId: orderUniqueId, metalType: result.data.result.data.metalType, quantity: quantity, lockPrice: lockPrice, blockId: blockId, amount: result.data.result.data.totalAmount, rate: result.data.result.data.rate, quantityBased: quantityBased, modeOfPayment: modeOfPayment, goldBalance: result.data.result.data.goldBalance, silverBalance: result.data.result.data.silverBalance, merchantTransactionId: result.data.result.data.merchantTransactionId, transactionId: result.data.result.data.transactionId, orderStatus: "pending", totalAmount: result.data.result.data.totalAmount, walletBalance: Number(newCurrentWalletBal), walletId: walletData.id, orderCreatedDate: orderCreatedDate, isSellableGold: false, isSellableSilver: false, razorpayOrderId: razorpay_order_id, razorpayPaymentId: razorpay_payment_id, razorpaySignature: razorpay_signature }, { transaction: t });
                await models.digiGoldTempOrderDetail.update({ isOrderPlaced: true }, { where: { id: orderId }, transaction: t });

                let CustomerBalanceData = await models.digiGoldCustomerBalance.findOne({ where: { customerId: customerId, isActive: true } })
                if (CustomerBalanceData) {
                  await models.digiGoldCustomerBalance.update({ currentGoldBalance: result.data.result.data.goldBalance, currentSilverBalance: result.data.result.data.silverBalance }, { where: { customerId: customerId }, transaction: t });
                } else {
                  await models.digiGoldCustomerBalance.create({ customerId: customerId, currentGoldBalance: result.data.result.data.goldBalance, currentSilverBalance: result.data.result.data.silverBalance }, { transaction: t });
                }
                await models.digiGoldOrderTaxDetail.create({ orderDetailId: orderDetail.id, totalTaxAmount: result.data.result.data.totalTaxAmount, cgst: result.data.result.data.taxes.taxSplit[0].cgst, sgst: result.data.result.data.taxes.taxSplit[0].scgst, isActive: true }, { transaction: t });

                // await sms.sendMessageForBuy(customerName, customerDetails.mobileNumber, result.data.result.data.quantity, result.data.result.data.metalType, result.data.result.data.totalAmount);
                await sms.sendMessageForBuy(customerDetails.mobileNumber, result.data.result.data.quantity, result.data.result.data.metalType, result.data.result.data.totalAmount);


                return result.data;

              } else if (!result.isSuccess) {
                return { err }
              }
            }

            let orderBuy = await walletBuy1(walletTransactionDetailsBuy.customerId, orderData.lockPrice, orderData.metalType, orderData.blockId, orderData.modeOfPayment, orderData.quantity, orderData.totalAmount, orderData.id, orderData.quantityBased, orderData.walletTempId, orderData.id);
            if (orderBuy.message) {
              if (tempWalletTransaction.redirectOn) {
                // return res.status(200).json({ message: "success", orderBuy });

                res.cookie(`metalObject`, `${JSON.stringify(orderBuy.result.data.metalType)}`);
                // res.redirect(`http://localhost:4200${tempWalletTransaction.redirectOn}${orderBuy.result.data.merchantTransactionId}`);

                res.redirect(`${process.env.BASE_URL_CUSTOMER}${tempWalletTransaction.redirectOn}${orderBuy.result.data.merchantTransactionId}`);
              } else {
                // return res.status(200).json({ message: "success", orderBuy });
                return { isSuccess: true, status: 200, data: { orderBuy } }

              }
            } else if (orderBuy.errors.userKyc) {
              if (tempWalletTransaction.redirectOn) {
                res.cookie(`KYCError`, `${JSON.stringify(err.response.data.errors.userKyc[0].message)}`);
                res.redirect(`${process.env.BASE_URL_CUSTOMER}/kyc/digi-gold`);
              } else {
                // return res.status(400).json(orderBuy.result.data.metalType);
                return { isSuccess: false, status: 400, data: { data: err.response.data.errors.userKyc[0] } }

              }

            }

          } else if (tempWalletTransaction.type == "delivery") {
            // if wallet called for delivery product 
            console.log(tempWalletTransaction.type);
            let cartData = await models.digiGoldTempOrderProductDetail.findAll({ where: { tempOrderDetailId: orderData.id } });

            let orderAddress = await models.digiGoldTempOrderAddress.findAll({ where: { tempOrderDetailId: orderData.id } })

            //
            let walletDeatilDelivery = await models.walletDetails.create({ customerId: tempWalletDetail.customerId, amount: tempWalletDetail.amount, paymentDirection: "credit", description: "Amount added to your Augmont Wallet", productTypeId: 4, transactionDate: tempWalletDetail.transactionDate, walletTempDetailId: tempWalletDetail.id, orderTypeId: 3, paymentOrderTypeId: 4, transactionStatus: "completed" }, { transaction: t });

            let WalletFreeBalanceNew = customer.walletFreeBalance.toFixed(2);
            let customerUpdatedBalanceNew = customerUpdatedBalance.toFixed(2);

            let walletTransactionDetailsDelivery = await models.walletTransactionDetails.create({ customerId: tempWalletTransaction.customerId, productTypeId: 4, orderTypeId: 4, walletId: walletDeatilDelivery.id, transactionUniqueId: tempWalletTransaction.transactionUniqueId, razorpayOrderId: razorpay_order_id, razorpayPaymentId: razorpay_payment_id, razorpaySignature: razorpay_signature, paymentType: tempWalletTransaction.paymentType, transactionAmount: tempWalletTransaction.transactionAmount, paymentReceivedDate: tempWalletTransaction.paymentReceivedDate, depositDate: tempWalletTransaction.paymentReceivedDate, depositApprovedDate: tempWalletTransaction.paymentReceivedDate, depositStatus: "completed", runningBalance: Number(customerUpdatedBalanceNew), freeBalance: Number(WalletFreeBalanceNew) }, { transaction: t })
            //

            let walletDelivery1 = async (customerId, amount, modeOfPayment, orderType, cartData, totalQuantity, totalWeight, orderAddress, userAddressId, walletTempId, tempOrderDetailId, orderUniqueId) => {

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

              console.log(result.data);

              if (result.isSuccess) {

                await models.axios({
                  method: 'PATCH',
                  url: `https://api.razorpay.com/v1/payments/${razorpay_payment_id}`,
                  auth: {
                    username: razorPay.razorPayConfig.key_id,
                    password: razorPay.razorPayConfig.key_secret
                  },
                  data: qs.stringify({ notes: { product: "digi gold", transactionId: result.data.result.data.orderId, uniqueId: customer.customerUniqueId } })
                });



                await models.digiGoldCart.destroy({ where: { customerId: customerId } });

                //calculation function
                let checkBalance = await customerBalance(customerDetails, Number(result.data.result.data.shippingCharges))
                //calculation function
                let currentBal = Number(customerDetails.currentWalletBalance) - Number(result.data.result.data.shippingCharges);

                let newCurrentWalletBalance = checkBalance.currentWalletBalance.toFixed(2);
                let newWalletFreBalance = checkBalance.walletFreeBalance.toFixed(2);



                await models.customer.update({ currentWalletBalance: Number(newCurrentWalletBalance), walletFreeBalance: Number(newWalletFreBalance) }, { where: { id: customerId }, transaction: t });

                let customerBal = await models.digiGoldCustomerBalance.findOne({ where: { customerId: customerId } });

                // let updatedSellableGold = 0;
                // let updatedSellableSilver = 0;
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

                  // updatedSellableGold = Number(customerBal.sellableGoldBalance) - Number(totalGoldWeight)
                  // if (!updatedSellableGold || updatedSellableGold <= 0) {
                  // updatedSellableGold = 0;
                  // }

                  let checkBalance = await customerNonSellableMetal(result.data.result.data.goldBalance, customerBal.sellableGoldBalance, customerBal.nonSellableGoldBalance, totalGoldWeight);
                  let newSellableGoldBalance = checkBalance.sellableMetal.toFixed(4);
                  let newNonSellableGoldBalance = checkBalance.nonSellableMetal.toFixed(4)
                  await models.digiGoldCustomerBalance.update({ currentGoldBalance: result.data.result.data.goldBalance, currentSilverBalance: result.data.result.data.silverBalance, sellableGoldBalance: Number(newSellableGoldBalance), nonSellableGoldBalance: Number(newNonSellableGoldBalance) }, { where: { customerId: customerId }, transaction: t });
                }
                // console.log(updatedSellableGold, "updatedSellableGold");
                if (totalSilverWeight) {
                  // updatedSellableSilver = Number(customerBal.sellableSilverBalance) - Number(totalSilverWeight);
                  // if (!updatedSellableSilver || updatedSellableSilver <= 0) {
                  // updatedSellableSilver = 0;
                  // }

                  let checkBalance = await customerNonSellableMetal(result.data.result.data.goldBalance, customerBal.sellableSilverBalance, customerBal.nonSellableSilverBalance, totalSilverWeight);
                  let sellableSilverBalance = checkBalance.sellableMetal.toFixed(4);
                  let nonSellableSilverBalance = checkBalance.nonSellableMetal.toFixed(4);

                  await models.digiGoldCustomerBalance.update({ currentGoldBalance: result.data.result.data.goldBalance, currentSilverBalance: result.data.result.data.silverBalance, sellableSilverBalance: Number(sellableSilverBalance), nonSellableSilverBalance: Number(nonSellableSilverBalance) }, { where: { customerId: customerId }, transaction: t });
                }

                // await models.digiGoldCustomerBalance.update({ currentGoldBalance: result.data.result.data.goldBalance, currentSilverBalance: result.data.result.data.silverBalance }, { where: { customerId: id }, transaction: t });

                let walletData = await models.walletDetails.create({ customerId: customerId, amount: result.data.result.data.shippingCharges, paymentDirection: "debit", description: "Delivery and Making charges", productTypeId: 4, transactionDate: moment(), walletTempDetailId: walletTempId, orderTypeId: 3, paymentOrderTypeId: 6, transactionStatus: "completed" }, { transaction: t });
                console.log(walletData, "walletData");

                let orderCreatedDate = moment(moment().utcOffset("+05:30"));

                let orderDetail = await models.digiGoldOrderDetail.create({ tempOrderId: tempOrderDetailId, customerId: customerId, orderTypeId: 3, orderId: result.data.result.data.orderId, totalAmount: amount, blockId: orderUniqueId, amount: amount, modeOfPayment: modeOfPayment, userAddressId: userAddressId, goldBalance: result.data.result.data.goldBalance, silverBalance: result.data.result.data.silverBalance, merchantTransactionId: result.data.result.data.merchantTransactionId, transactionId: result.data.result.data.orderId, orderStatus: "pending", deliveryShippingCharges: result.data.result.data.shippingCharges, deliveryTotalQuantity: totalQuantity, deliveryTotalWeight: totalWeight, walletBalance: Number(newCurrentWalletBalance), walletId: walletData.id, orderCreatedDate: orderCreatedDate, isSellableGold: true, isSellableSilver: true, razorpayOrderId: razorpay_order_id, razorpayPaymentId: razorpay_payment_id, razorpaySignature: razorpay_signature }, { transaction: t });


                await models.digiGoldTempOrderDetail.update({ isOrderPlaced: true }, { where: { id: tempOrderDetailId }, transaction: t })

                for (let cart of cartData) {
                  let productData = await models.digiGoldOrderProductDetail.create({ orderDetailId: orderDetail.id, productSku: cart.productSku, productWeight: cart.productWeight, productName: cart.productName, amount: cart.amount, productImage: cart.productImage, totalAmount: cart.totalProductAmount, metalType: cart.metalType, quantity: cart.quantity, createdBy: 1, modifiedBy: 1 }, { transaction: t });
                }

                for (let address of orderAddress) {
                  await models.digiGoldOrderAddressDetail.create({ orderDetailId: orderDetail.id, customerName: address.customerName, addressType: address.addressType, address: address.address, stateId: address.stateId, cityId: address.cityId, pinCode: address.pinCode }, { transaction: t });

                  await models.customerAddress.create({
                    customerId: customerId, address: address.address, landMark: address.address, stateId: address.stateId, cityId: address.cityId, postalCode: address.pinCode, addressType: address.addressType
                  })
                }

                await sms.sendMessageForOrderPlaced(customerDetails.mobileNumber, result.data.result.data.orderId);

                return result.data;
              } else if (!result.isSuccess) {
                return { err }
              }

            }

            let orderDelivery = await walletDelivery1(walletTransactionDetailsDelivery.customerId, orderData.amount, orderData.modeOfPayment, orderData.orderTypeId, cartData, orderData.deliveryTotalQuantity, orderData.deliveryTotalWeight, orderAddress, orderData.userAddressId, orderData.walletTempId, orderData.id, orderData.blockId);

            if (tempWalletTransaction.redirectOn) {

              res.redirect(`${process.env.BASE_URL_CUSTOMER}${tempWalletTransaction.redirectOn}${orderDelivery.result.data.merchantTransactionId}`);
            } else {
              // return res.status(200).json({ message: "success", orderDelivery });
              return { isSuccess: true, status: 200, data: { orderDelivery } }

            }


          }
        }
      })
      if (output != undefined) {
        if (output.isSuccess) {
          return res.status(output.status).json({ data: output.data })
        } else {
          // return { isSuccess: false, status: 400, data: { data: err.response.data.errors.userKyc[0] } }
          return res.status(output.status).json({ data: output.data })
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
      let newCusWalletFreeBalance = customer.walletFreeBalance.toFixed(2);
      let newRunningBalance = customer.currentWalletBalance.toFixed(2);

      let tempWalletDetail = await models.walletTempDetails.getTempWalletData(tempWalletTransaction.walletTempId);

      await sequelize.transaction(async (t) => {

        WalletDetail = await models.walletDetails.create({ customerId: tempWalletTransaction.customerId, amount: tempWalletTransaction.transactionAmount, paymentDirection: "credit", description: "Amount added to your Augmont Wallet", productTypeId: 4, transactionDate: tempWalletTransaction.paymentReceivedDate, walletTempDetailId: tempWalletDetail.id, orderTypeId: 4, paymentOrderTypeId: 4, transactionStatus: "pending" }, { transaction: t });

        walletTransactionDetails = await models.walletTransactionDetails.create({ customerId: tempWalletTransaction.customerId, productTypeId: 4, orderTypeId: 4, transactionUniqueId, bankTransactionUniqueId: tempWalletTransaction.bankTransactionUniqueId, paymentType: tempWalletTransaction.paymentType, transactionAmount: tempWalletTransaction.transactionAmount, paymentReceivedDate: tempWalletTransaction.paymentReceivedDate, depositDate: tempWalletTransaction.paymentReceivedDate, chequeNumber: tempWalletTransaction.chequeNumber, bankName: tempWalletTransaction.bankName, branchName: tempWalletTransaction.branchName, depositStatus: "pending", runningBalance: Number(newRunningBalance), freeBalance: Number(newCusWalletFreeBalance), walletId: WalletDetail.id }, { transaction: t });

        await models.walletTransactionTempDetails.update({ isOrderPlaced: true }, { where: { id: tempWalletTransaction.id }, transaction: t });




        await sms.sendMessageForDepositRequest(customer.mobileNumber, tempWalletTransaction.transactionAmount);

      })

      return res.status(200).json({ message: "Payment request created Successfully", walletTransactionDetails });
    }

  } catch (err) {
    console.log(err);
    // let errorData = errorLogger(JSON.stringify(err), req.url, req.method, req.hostname, req.body);

    // if (err.response) {
    // return res.status(422).json(err.response.data);
    // } else {
    // console.log('Error', err.message);
    // }
    if (err.response) {
      if (err.response.data.errors.userKyc && err.response.data.errors.userKyc.length) {

        res.cookie(`KYCError`, `${JSON.stringify(err.response.data.errors.userKyc[0].message)}`);
        res.redirect(`${process.env.BASE_URL_CUSTOMER}/kyc/digi-gold`);
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
  let { paymentFor, depositStatus } = req.query;

  if (!paymentFor) {
    return res.status(200).json({ message: `Parameter are missing` })
  }
  let orderTypeId
  if (paymentFor) {
    orderTypeId = await models.digiGoldOrderType.findOne({ where: { orderType: paymentFor } })
  }

  let query = {};
  if (depositStatus) {
    query["$walletTransactionDetails.deposit_status$"] = depositStatus.split(",");
  }
  const { search, offset, pageSize } = paginationWithFromTo(
    req.query.search,
    req.query.from,
    req.query.to
  );

  let searchQuery = {
    [Op.and]: [query, {
      [Op.or]: {
        paymentType: sequelize.where(
          sequelize.cast(sequelize.col("walletTransactionDetails.payment_type"), "varchar"),
          {
            [Op.iLike]: search + "%",
          }
        ),
        "$walletTransactionDetails.bank_name$": { [Op.iLike]: search + '%' },
        "$walletTransactionDetails.cheque_number$": { [Op.iLike]: search + '%' },

        "$walletTransactionDetails.branch_name$": { [Op.iLike]: search + '%' },
      },
    }],
    // customerId: id,


  };

  if (orderTypeId) {
    if (orderTypeId.id == 4) {
      searchQuery.paymentOrderTypeId = { [Op.in]: [4] }
      searchQuery.orderTypeId = { [Op.in]: [4] }
      searchQuery.customerId = id
    } else if (orderTypeId.id == 5) {
      searchQuery.paymentOrderTypeId = { [Op.in]: [5] }
      searchQuery.orderTypeId = { [Op.in]: [5] }
      searchQuery.customerId = id
    }
  }


  let includeArray = [
    {
      model: models.walletTransactionDetails,
      as: 'walletTransactionDetails',
    },
    {
      model: models.customer,
      as: 'customer',
      attributes: ['customerUniqueId', 'firstName', 'lastName', 'mobileNumber']
    }
  ]

  let depositDetail = await models.walletDetails.findAll({
    where: searchQuery,
    order: [['updatedAt', 'DESC']],
    include: includeArray,
    offset: offset,
    limit: pageSize,
    subQuery: false,
  });

  let count = await models.walletDetails.findAll({
    where: searchQuery,
    include: includeArray
  });
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
  try {
    const id = req.userData.id;
    const { paymentFor, search, from, to } = req.query;

    let transactionData = await transactionDetail(id, paymentFor, search, from, to);

    return res.status(200).json({ transactionDetails: transactionData.transactionDetails, count: transactionData.count.length });

  } catch (err) {
    console.log(err);
  }

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
  const { withdrawAmount, bankName, branchName, accountHolderName, accountNumber, ifscCode, bankId, userBankId } = req.body;

  const id = req.userData.id;

  let customerFreeBalance = await models.customer.findOne({ where: { id: id, isActive: true } })

  let checkCustomerKycStatus = await checkKycStatus(id);

  if (checkCustomerKycStatus) {
    return res.status(420).json({ message: "Your KYC status is Rejected" });
  }

  if (customerFreeBalance.walletFreeBalance < withdrawAmount) {

    return res.status(400).json({ message: `Insufficient free wallet balance.` });
  } else {
    let tempOrderDetail;
    let orderDetail
    await sequelize.transaction(async (t) => {


      let customerFullName = customerFreeBalance.firstName + " " + customerFreeBalance.lastName

      let NewWithdrawAmt = await Math.round(withdrawAmount);
      let NewWithdrawAt = NewWithdrawAmt.toFixed(2);

      tempWallet = await models.walletTempDetails.create({ customerId: id, amount: NewWithdrawAt, paymentDirection: "debit", description: `Rs ${NewWithdrawAt} requested to be transferred to bank account`, productTypeId: 4 }, { transaction: t });

      let transactionUniqueId = uniqid.time().toUpperCase();

      tempOrderDetail = await models.walletTransactionTempDetails.create({ customerId: id, productTypeId: 4, orderTypeId: 5, walletTempId: tempWallet.id, transactionUniqueId, transactionAmount: NewWithdrawAt, bankName: bankName, branchName: branchName, accountHolderName: accountHolderName, accountNumber: accountNumber, ifscCode: ifscCode, paymentReceivedDate: moment() }, { transaction: t });

      let walletData = await models.walletDetails.create({ customerId: id, amount: NewWithdrawAt, paymentDirection: "debit", description: `Rs ${NewWithdrawAt} requested to be transferred to bank account`, productTypeId: 4, transactionDate: moment(), orderTypeId: 5, paymentOrderTypeId: 5, transactionStatus: "pending" }, { transaction: t });

      customerUpdatedFreeBalance = Number(customerFreeBalance.walletFreeBalance) - Number(NewWithdrawAt);
      currentWalletBalance = Number(customerFreeBalance.currentWalletBalance) - Number(NewWithdrawAt);
      let currentWalletBalanceNew = currentWalletBalance.toFixed(2);

      orderDetail = await models.walletTransactionDetails.create({ customerId: id, productTypeId: 4, orderTypeId: 5, transactionUniqueId, transactionAmount: NewWithdrawAt, bankName: bankName, branchName: branchName, accountHolderName: accountHolderName, accountNumber: accountNumber, ifscCode: ifscCode, depositStatus: "pending", walletId: walletData.id, paymentReceivedDate: moment(), runningBalance: Number(currentWalletBalanceNew) }, { transaction: t });

      let newCustomerUpdatedFreeBalance = customerUpdatedFreeBalance.toFixed(2);

      let newCurrentWalletBal = currentWalletBalance.toFixed(2);


      await models.customer.update({ walletFreeBalance: Number(newCustomerUpdatedFreeBalance), currentWalletBalance: Number(newCurrentWalletBal) }, { where: { id: customerFreeBalance.id }, transaction: t });

      
      await models.customerBankDetails.update({ customerId: id, bankName: bankName, accountHolderName, accountNumber, ifscCode, bankId: bankId }, { where: { userBankId: userBankId }, transaction: t });

      await sms.sendMessageForWithdrawalReqPlaced(customerFreeBalance.mobileNumber, customerFullName);

    })

    return res.status(200).json({ message: `Success`, orderDetail });
  }

}


exports.AddCustomerBankDetails = async (req, res) => {
  try {

    const { bankId, bankName, bankBranchName, accountType, accountHolderName, accountNumber, ifscCode, moduleId, description } = req.body;

    const id = req.userData.id;
    let customerDetails = await models.customer.findOne({
      where: { id, isActive: true },
    });
    if (check.isEmpty(customerDetails)) {
      return res.status(404).json({ message: "Customer Does Not Exists" });
    }

    const customerUniqueId = customerDetails.customerUniqueId;

    let addBankDetaiils = await addBankDetailInAugmontDb(customerUniqueId, bankId, bankBranchName, accountNumber, accountHolderName, ifscCode)

    // const merchantData = await getMerchantData();
    // const data = qs.stringify({
    //     'bankId':bankId,
    //     'bankBranch':bankBranchName,
    //     'accountNumber':accountNumber,
    //     'accountName':accountHolderName,
    //     'ifscCode':ifscCode
    // })
    // const result = await models.axios({
    //     method: 'POST',
    //     url: `${process.env.DIGITALGOLDAPI}/merchant/v1/users/${customerUniqueId}/banks`,
    //     headers: { 
    //       'Content-Type': 'application/x-www-form-urlencoded', 
    //       'Authorization': `Bearer ${merchantData.accessToken}`,
    //     },
    //     data : data
    // })
    console.log(addBankDetaiils);
    if (addBankDetaiils.isSuccess) {
      customerBankDetails = await models.customerBankDetails.create({ customerId: id, moduleId, description, bankName: bankName, bankBranchName, accountType, accountHolderName, accountNumber, ifscCode, bankId: bankId, userBankId: addBankDetaiils.data.data.result.data.userBankId });

      if (customerBankDetails) {
        return res.status(200).json({ message: 'Success', data: customerBankDetails });
      } else {
        return res.status(404).json({ message: `Failed to add bank details.` });
      }
    }

  } catch (err) {
    console.log(err);
    let errorData = errorLogger(JSON.stringify(err), req.url, req.method, req.hostname, req.body);

    if (err.response) {
      return res.status(422).json(err.response.data);
    } else {
      console.log('Error', err.message);
    }
  }
}

exports.updateCustomerBankDetails = async (req, res) => {

  try {
    const customerId = req.userData.id;
    const { customerBankDetailId } = req.params;
    const { bankId, bankName, branchName, accountNumber, accountName, ifscCode, userBankId } = req.body;
    let customerDetails = await models.customer.findOne({
      where: { id: customerId, isActive: true },
    });
    if (check.isEmpty(customerDetails)) {
      return res.status(404).json({ message: "Customer Does Not Exists" });
    }

    let bankDetails = await models.customerBankDetails.findOne({ where: { id: customerBankDetailId } });
    if (!bankDetails) {
      return res.status(404).json({ message: "Customer bank details Does Not Exists" });
    }
    const customerUniqueId = customerDetails.customerUniqueId;
    const merchantData = await getMerchantData();

    if (bankDetails.userBankId) {

      let output = await sequelize.transaction(async (t) => {
        const data = qs.stringify({
          'bankId': bankId,
          'bankBranch': bankName,
          'accountNumber': accountNumber,
          'accountName': accountName,
          'ifscCode': ifscCode,
          'status': 'active'
        });
        const result = await models.axios({
          method: 'PUT',
          url: `${process.env.DIGITALGOLDAPI}/merchant/v1/users/${customerUniqueId}/banks/${userBankId}`,
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Bearer ${merchantData.accessToken}`,
          },
          data: data
        });
        if (result.data.statusCode === 200) {

          await models.customerBankDetails.update({ bankId, bankName: bankName, bankBranchName: branchName, accountNumber: accountNumber, accountHolderName: accountName, ifscCode, userBankId: result.data.result.data.userBankId }, { where: { id: customerBankDetailId }, transaction: t });

          return res.status(200).json({ message: 'Success', data: result.data });

        }
      })

    } else {
      // let addBankDetaiils = await addBankDetailInAugmontDb(customerUniqueId, bankId, branchName, accountNumber, accountName, ifscCode)
      let output = await sequelize.transaction(async (t) => {
        const data = qs.stringify({
          'bankId': bankId,
          'bankBranch': bankName,
          'accountNumber': accountNumber,
          'accountName': accountHolderName,
          'ifscCode': ifscCode
        })
        const result = await models.axios({
          method: 'POST',
          url: `${process.env.DIGITALGOLDAPI}/merchant/v1/users/${customerUniqueId}/banks`,
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Bearer ${merchantData.accessToken}`,
          },
          data: data
        })

        if (result.data.statusCode === 200) {

          await models.customerBankDetails.update({ bankName: bankName, bankBranchName: branchName, accountHolderName: accountName, accountNumber, ifscCode, bankId: bankId, userBankId: result.data.result.data.userBankId }, { where: { id: id }, transaction: t });

          return res.status(200).json({ message: 'Success', data: result.data });
        }
      })
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

exports.getAllBankDetails = async (req, res) => {

  const id = req.userData.id;
  let bankDetails = await models.customerBankDetails.findAll({
    where: { customerId: id, isActive: 'true', bankId: { [Op.ne]: null } },
    order: [["updatedAt", "DESC"]],
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

