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


//To get wallet transaction detail by id
exports.walletTransactionDetailById = async (walletTransactionId) => {

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

        const getUser = await models.axios({
            method: 'GET',
            url: `${process.env.DIGITALGOLDAPI}/merchant/v1/users/${customerUniqueId}`,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${merchantData.accessToken}`,
            },
        });
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
            'userPincode': getUserDetails.userPincode,
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

        console.log(data);
        const result = await models.axios({
            method: 'POST',
            url: `${process.env.DIGITALGOLDAPI}/merchant/v1/buy`,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Bearer ${merchantData.accessToken}`,
            },
            data: qs.stringify(data)
        })

        const customerName = customerDetails.firstName + " " + customerDetails.lastName;

        if (result.data.statusCode === 200) {

            await sequelize.transaction(async (t) => {
                let currentBal = Number(customerDetails.currentWalletBalance) - Number(result.data.result.data.totalAmount);

                await models.customer.update({ currentWalletBalance: currentBal }, { where: { id: customerId } })

                let orderUniqueId = `dg_buy${Math.floor(1000 + Math.random() * 9000)}`;

                let walletData = await models.walletDetails.create({ customerId: customerId, amount: result.data.result.data.totalAmount, paymentDirection: "debit", description: result.data.message, productTypeId: 4, transactionDate: moment(), walletTempDetailId: tempWalletId }, { transaction: t });

                let orderDetail = await models.digiGoldOrderDetail.create({ tempOrderId: orderId, customerId: customerId, orderTypeId: 1, orderId: orderUniqueId, metalType: result.data.result.data.metalType, quantity: quantity, lockPrice: lockPrice, blockId: blockId, amount: result.data.result.data.totalAmount, rate: result.data.result.data.rate, quantityBased: quantityBased, modeOfPayment: modeOfPayment, goldBalance: result.data.result.data.goldBalance, silverBalance: result.data.result.data.silverBalance, merchantTransactionId: result.data.result.data.merchantTransactionId, transactionId: result.data.result.data.transactionId, orderSatatus: "pending", totalAmount: result.data.result.data.totalAmount, walletBalance: currentBal, walletId: walletData.id }, { transaction: t });

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

        }
        if (err.response) {
            return err.response
            // if (err.response.data.errors.userKyc && err.response.data.errors.userKyc.length) {

            //   res.cookie(`KYCError`, `${JSON.stringify(err.response.data.errors.userKyc[0].message)}`);
            //   res.redirect(`https://${process.env.DIGITALGOLDAPI}/kyc/digi-gold`);
            // } else {
            //   return res.status(422).json(err.response.data);
            // }
        } else {
            console.log('Error', err.message);
        }
    } catch (err) {
        console.log(err);
    }
}

let walletDelivery = async (customerId,  amount, modeOfPayment, orderType, cartData, totalQuantity, totalWeight, orderAddress, userAddressId, walletTempId, tempOrderDetailId, orderUniqueId) => {

    let customerDetails = await models.customer.findOne({ where: { id: customerId } });

    const customerUniqueId = customerDetails.customerUniqueId;
    const merchantData = await getMerchantData();
    const transactionId = uniqid(merchantData.merchantId, customerUniqueId);
    const getCartDetails = await models.digiGoldCart.getCartDetails(id);


    await sequelize.transaction(async (t) => {
        const data = {
            'merchantTransactionId': transactionId,
            'uniqueId': customerUniqueId,
            'user[shipping][addressId]': userAddressId,
            'merchantId': merchantData.merchantId,
            'mobileNumber': customerDetails.mobileNumber,
            'modeOfPayment': modeOfPayment
          };
    
          for (let [index, ele] of getCartDetails.entries()) {
            data[`product[${index}][sku]`] = ele.productSku;
            data[`product[${index}][quantity]`] = ele.quantity;
          }
    
          const result = await models.axios({
            method: 'POST',
            url: `${process.env.DIGITALGOLDAPI}/merchant/v1/order`,
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'Authorization': `Bearer ${merchantData.accessToken}`,
            },
            data: qs.stringify(data)
          })
    
          if (result.data.statusCode === 200) {
            await models.digiGoldCart.destroy({ where: { customerId: customerId } });
    
            let currentBal = Number(customerDetails.currentWalletBalance) - Number(result.data.result.data.shippingCharges);
    
            await models.customer.update({ currentWalletBalance: currentBal }, { where: { customerId }, transaction: t });
    
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
              await models.digiGoldCustomerBalance.update({ currentGoldBalance: result.data.result.data.goldBalance, currentSilverBalance: result.data.result.data.silverBalance, sellableGoldBalance: updatedSellableGold }, { where: { customerId: customerId }, transaction: t });
            }
            if (totalSilverWeight) {
              updatedSellableSilver = Number(customerBal.sellableSilverBalance) - Number(totalSilverWeight);
              if (!updatedSellableSilver || updatedSellableSilver <= 0) {
                updatedSellableSilver = 0;
              }
              console.log("updatedSellableSilver", updatedSellableSilver);
              await models.digiGoldCustomerBalance.update({ currentGoldBalance: result.data.result.data.goldBalance, currentSilverBalance: result.data.result.data.silverBalance, sellableSilverBalance: updatedSellableSilver }, { where: { customerId: customerId }, transaction: t });
            }
    
            // await models.digiGoldCustomerBalance.update({ currentGoldBalance: result.data.result.data.goldBalance, currentSilverBalance: result.data.result.data.silverBalance }, { where: { customerId: id }, transaction: t });
    
            let walletData = await models.walletDetails.create({ customerId: customerId, amount: result.data.result.data.shippingCharges, paymentDirection: "debit", description: "Order Delivery", productTypeId: 4, transactionDate: moment(), walletTempDetailId: walletTempId }, { transaction: t });
    
            let orderDetail = await models.digiGoldOrderDetail.create({ tempOrderId: tempOrderDetailId, customerId: id, orderTypeId: 3, orderId: result.data.result.data.orderId, totalAmount: amount, blockId: orderUniqueId, amount: amount, modeOfPayment: modeOfPayment, userAddressId: userAddressId, goldBalance: result.data.result.data.goldBalance, silverBalance: result.data.result.data.silverBalance, merchantTransactionId: result.data.result.data.merchantTransactionId, transactionId: result.data.result.data.orderId, orderSatatus: "pending", deliveryShippingCharges: result.data.result.data.shippingCharges, deliveryTotalQuantity: totalQuantity, deliveryTotalWeight: totalWeight, walletBalance: currentBal, walletId: walletData.id }, { transaction: t });
    
            await models.digiGoldTempOrderDetail.update({ isOrderPlaced: true }, { where: { id: tempOrderDetailId }, transaction: t })
    
            for (let cart of cartData) {
              await models.digiGoldOrderProductDetail.create({ orderDetailId: orderDetail.id, productSku: cart.productSku, productWeight: cart.productWeight, productName: cart.productName, amount: cart.amount, productImage: cart.productImage, totalAmount: cart.totalProductAmount, metalType: cart.metalType, quantity: cart.quantity, createdBy: 1, modifiedBy: 1 }, { transaction: t });
            }
    
            for (let address of orderAddress) {
              await models.digiGoldOrderAddressDetail.create({ orderDetailId: orderDetail.id, customerName: address.customerName, addressType: address.addressType, address: address.address, stateId: address.stateId, cityId: address.cityId, pinCode: address.pinCode }, { transaction: t });
            }
    
            await sms.sendMessageForOrderPlaced(customerDetails.mobileNumber, result.data.result.data.orderId);
    
            return result.data;

          }
          if (err.response) {
            return err.response
            // if (err.response.data.errors.userKyc && err.response.data.errors.userKyc.length) {

            //   res.cookie(`KYCError`, `${JSON.stringify(err.response.data.errors.userKyc[0].message)}`);
            //   res.redirect(`https://${process.env.DIGITALGOLDAPI}/kyc/digi-gold`);
            // } else {
            //   return res.status(422).json(err.response.data);
            // }
        } else {
            console.log('Error', err.message);
        }
    })
    

}



module.exports = {
    walletBuy: walletBuy,
    walletDelivery:walletDelivery
}