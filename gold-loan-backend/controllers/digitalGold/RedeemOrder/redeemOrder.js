const qs = require('qs');
const uniqid = require('uniqid');
const crypto = require('crypto');
var pdf = require("pdf-creator-node");
var fs = require('fs');
const path = require('path');
const models = require('../../../models');
const getMerchantData = require('../auth/getMerchantData');
const check = require('../../../lib/checkLib');
const getRazorPayDetails = require('../../../utils/razorpay');
const pagination = require('../../../utils/pagination');
const numToWords = require('../../../utils/numToWords');
let sms = require('../../../utils/SMS');
const html = fs.readFileSync(path.join(__dirname, '..', '..', '..', 'templates', 'redeemOrderInvoice.html'), 'utf8')
const errorLogger = require('../../../utils/errorLogger');
const sequelize = models.sequelize;
const Sequelize = models.Sequelize;
const Op = Sequelize.Op;
const moment = require('moment');
const { walletDelivery, customerBalance, customerNonSellableMetal } = require('../../../service/wallet');
const { postMerchantOrder, getUserData, postBuy } = require('../../../service/digiGold')


exports.AddOrder = async (req, res) => {
  try {
    const { amount, modeOfPayment, cartData, shippingCharges, totalQuantity, totalWeight, orderAddress, userAddressId } = req.body;

    const id = req.userData.id;

    let customerDetails = await models.customer.findOne({
      where: { id, isActive: true },
    });
    if (check.isEmpty(customerDetails)) {
      return res.status(404).json({ message: "Customer Does Not Exists" });
    }

    if (amount > customerDetails.currentWalletBalance || !customerDetails.currentWalletBalance) {
      return res.status(422).json({ message: "Insuffecient wallet balance", walletBal: customerDetails.currentWalletBalance });
    }
    let tempOrderDetail;
    let orderUniqueId;
    let walletData;
    let output = await sequelize.transaction(async (t) => {

      walletData = await models.walletTempDetails.create({ customerId: id, amount, paymentDirection: "debit", description: "Delivery and Making charges", productTypeId: 4, transactionDate: moment() }, { transaction: t });

      let currentTempWalletBal = Number(customerDetails.currentWalletBalance) - Number(amount);

      orderUniqueId = `dg_delivery${Math.floor(1000 + Math.random() * 9000)}`;

      tempOrderDetail = await models.digiGoldTempOrderDetail.create({ customerId: id, orderTypeId: 3, totalAmount: amount, blockId: orderUniqueId, amount, modeOfPayment: modeOfPayment, createdBy: 1, modifiedBy: 1, deliveryShippingCharges: shippingCharges, deliveryTotalQuantity: totalQuantity, deliveryTotalWeight: totalWeight, userAddressId, walletTempId: walletData.id, walletBalance: currentTempWalletBal }, { transaction: t });
      let orderType = 3;

      let walletDelivery1 = async (customerId, amount, modeOfPayment, orderType, cartData, totalQuantity, totalWeight, orderAddress, userAddressId, walletTempId, tempOrderDetailId, orderUniqueId) => {
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

          for (let [index, ele] of getCartDetails.entries()) {
            data[`product[${index}][sku]`] = ele.productSku;
            data[`product[${index}][quantity]`] = ele.quantity;
          }

          const result = await postMerchantOrder(data)

          if (result.isSuccess) {

            await models.digiGoldCart.destroy({ where: { customerId: customerId } });

            //calculation function
            let checkBalance = await customerBalance(customerDetails, result.data.result.data.shippingCharges)
            //calculation function

            let currentBal = Number(customerDetails.currentWalletBalance) - Number(result.data.result.data.shippingCharges);

            await models.customer.update({ currentWalletBalance: checkBalance.currentWalletBalance, walletFreeBalance: checkBalance.walletFreeBalance }, { where: { id: customerId }, transaction: t });

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

              // updatedSellableGold = Number(customerBal.sellableGoldBalance) - Number(totalGoldWeight);

              let checkBalance = await customerNonSellableMetal(result.data.result.data.goldBalance, customerBal.sellableGoldBalance, customerBal.nonSellableGoldBalance, totalGoldWeight);

              // if (!updatedSellableGold || updatedSellableGold <= 0) {
              //   updatedSellableGold = 0;
              // }
              await models.digiGoldCustomerBalance.update({ currentGoldBalance: result.data.result.data.goldBalance, currentSilverBalance: result.data.result.data.silverBalance, sellableGoldBalance: checkBalance.sellableMetal, nonSellableGoldBalance: checkBalance.nonSellableMetal }, { where: { customerId: customerId }, transaction: t });
            }
            // console.log(updatedSellableGold, "updatedSellableGold");
            if (totalSilverWeight) {
              // updatedSellableSilver = Number(customerBal.sellableSilverBalance) - Number(totalSilverWeight);

              // if (!updatedSellableSilver || updatedSellableSilver <= 0) {
              //   updatedSellableSilver = 0;
              // }
              let checkBalance = await customerNonSellableMetal(result.data.result.data.goldBalance, customerBal.sellableSilverBalance, customerBal.nonSellableSilverBalance, totalSilverWeight);

              await models.digiGoldCustomerBalance.update({ currentGoldBalance: result.data.result.data.goldBalance, currentSilverBalance: result.data.result.data.silverBalance, sellableSilverBalance: checkBalance.sellableMetal, nonSellableSilverBalance: checkBalance.nonSellableMetal }, { where: { customerId: customerId }, transaction: t });
            }

            // await models.digiGoldCustomerBalance.update({ currentGoldBalance: result.data.result.data.goldBalance, currentSilverBalance: result.data.result.data.silverBalance }, { where: { customerId: id }, transaction: t });

            let walletData = await models.walletDetails.create({ customerId: customerId, amount: result.data.result.data.shippingCharges, paymentDirection: "debit", description: "Delivery and Making charges", productTypeId: 4, transactionDate: moment(), walletTempDetailId: walletTempId, orderTypeId: 5, paymentOrderTypeId: 6, transactionStatus: "completed" }, { transaction: t });

          let orderCreatedDate = moment(moment().utcOffset("+05:30"));

            let orderDetail = await models.digiGoldOrderDetail.create({ tempOrderId: tempOrderDetailId, customerId: customerId, orderTypeId: 3, orderId: result.data.result.data.orderId, totalAmount: amount, blockId: orderUniqueId, amount: amount, modeOfPayment: modeOfPayment, userAddressId: userAddressId, goldBalance: result.data.result.data.goldBalance, silverBalance: result.data.result.data.silverBalance, merchantTransactionId: result.data.result.data.merchantTransactionId, transactionId: result.data.result.data.orderId, orderStatus: "pending", deliveryShippingCharges: result.data.result.data.shippingCharges, deliveryTotalQuantity: totalQuantity, deliveryTotalWeight: totalWeight, walletBalance: checkBalance.currentWalletBalance, walletId: walletData.id, orderCreatedDate: orderCreatedDate  }, { transaction: t });

            await models.digiGoldTempOrderDetail.update({ isOrderPlaced: true }, { where: { id: tempOrderDetailId }, transaction: t })

            for (let cart of cartData) {
              let productData = await models.digiGoldOrderProductDetail.create({ orderDetailId: orderDetail.id, productSku: cart.productSku, productWeight: cart.productWeight, productName: cart.productName, amount: cart.amount, productImage: cart.productImage, totalAmount: cart.totalProductAmount, metalType: cart.metalType, quantity: cart.quantity, createdBy: 1, modifiedBy: 1 }, { transaction: t });
            }

            for (let address of orderAddress) {
              await models.digiGoldOrderAddressDetail.create({ orderDetailId: orderDetail.id, customerName: address.customerName, addressType: address.addressType, address: address.address, stateId: address.stateId, cityId: address.cityId, pinCode: address.pinCode }, { transaction: t });
            }

            await sms.sendMessageForOrderPlaced(customerDetails.mobileNumber, result.data.result.data.orderId);

            return result.data;
          } else if (!result.isSuccess) {
            return { err }
          }
        } catch (err) {
          return err
        }
      }

      let orderDelivery = await walletDelivery1(customerDetails.id, amount, modeOfPayment, orderType, cartData, totalQuantity, totalWeight, orderAddress, userAddressId, walletData.id, tempOrderDetail.id, orderUniqueId);
      return { orderDelivery }
    })
    let { orderDelivery } = output

    if (orderDelivery) {
      return res.status(200).json(orderDelivery);
    } else {
      return res.status(400).json({ message: "something went wrong" });
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



exports.AddOrderOld = async (req, res) => {
  try {
    // const { userAddressId, modeOfPayment, transactionDetails, blockId, shippingCharges, totalQuantity, totalWeight, orderAddress, cartData } = req.body;

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, requestFrom } = req.body;

    let tempOrderDetail = await models.digiGoldTempOrderDetail.findOne({ where: { razorpayOrderId: razorpay_order_id } });

    const id = tempOrderDetail.customerId;

    const razorPay = await getRazorPayDetails();
    let customerDetails = await models.customer.findOne({
      where: { id, isActive: true },
    });
    if (check.isEmpty(customerDetails)) {
      return res.status(404).json({ message: "Customer Does Not Exists" });
    };
    const getCartDetails = await models.digiGoldCart.getCartDetails(id);
    if (getCartDetails.length === 0) {
      return res.status(404).json({ message: "Data not found" });
    } else {
      const customerUniqueId = customerDetails.customerUniqueId;
      const merchantData = await getMerchantData();

      //const transactionId = transactionDetails.razorpay_payment_id;
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
      const data = {
        'merchantTransactionId': razorpay_payment_id,
        'uniqueId': customerUniqueId,
        'user[shipping][addressId]': tempOrderDetail.userAddressId,
        'merchantId': merchantData.merchantId,
        'mobileNumber': customerDetails.mobileNumber,
        'modeOfPayment': tempOrderDetail.modeOfPayment
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
        await models.axios({
          method: 'PATCH',
          url: `https://api.razorpay.com/v1/payments/${razorpay_payment_id}`,
          auth: {
            username: razorPay.razorPayConfig.key_id,
            password: razorPay.razorPayConfig.key_secret
          },
          data: qs.stringify({ notes: { orderId: result.data.result.data.orderId, uniqueId: customerDetails.customerUniqueId } })
        })

        await sequelize.transaction(async (t) => {

          await models.digiGoldCart.destroy({ where: { customerId: id } });

          let cartData = await models.digiGoldTempOrderProductDetail.findAll({ where: { tempOrderDetailId: tempOrderDetail.id } })

          let customerBal = await models.digiGoldCustomerBalance.findOne({ where: { customerId: id } });

          let updatedSellableGold;
          let updatedSellableSilver;
          let totalGoldWeight;
          let totalSilverWeight;
          for (let cart of cartData) {
            if (cart.metalType == "gold") {
              if (cart.quantity == 0) {
                totalGoldWeight += parseFloat(cart.productWeight);
              } else {
                totalGoldWeight += parseFloat(cart.productWeight) * Number(cart.quantity);
              }
            } else if (cart.metalType == "silver") {
              if (cart.quantity == 0) {
                totalSilverWeight += parseFloat(cart.productWeight);
              } else {
                totalSilverWeight += parseFloat(cart.productWeight) * Number(cart.quantity);
              }
            }
          }

          if (totalGoldWeight) {

            updatedSellableGold = Number(customerBal.sellableGoldBalance) - Number(totalGoldWeight)

            await models.digiGoldCustomerBalance.update({ currentGoldBalance: result.data.result.data.goldBalance, currentSilverBalance: result.data.result.data.silverBalance, sellableGoldBalance: updatedSellableGold }, { where: { customerId: id }, transaction: t });
          }

          if (totalSilverWeight) {
            updatedSellableSilver = Number(customerBal.sellableSilverBalance) - Number(totalSilverWeight);

            await models.digiGoldCustomerBalance.update({ currentGoldBalance: result.data.result.data.goldBalance, currentSilverBalance: result.data.result.data.silverBalance, sellableSilverBalance: updatedSellableSilver }, { where: { customerId: id }, transaction: t });
          }
          let orderCreatedDate = moment(moment().utcOffset("+05:30"));

          let orderDetail = await models.digiGoldOrderDetail.create({ tempOrderId: tempOrderDetail.id, customerId: id, orderTypeId: 3, orderId: tempOrderDetail.blockId, totalAmount: tempOrderDetail.totalAmount, quantity: tempOrderDetail.quantity, blockId: tempOrderDetail.blockId, amount: tempOrderDetail.amount, modeOfPayment: tempOrderDetail.modeOfPayment, userAddressId: tempOrderDetail.userAddressId, goldBalance: result.data.result.data.goldBalance, silverBalance: result.data.result.data.silverBalance, merchantTransactionId: result.data.result.data.merchantTransactionId, transactionId: result.data.result.data.orderId, razorpayOrderId: razorpay_order_id, razorpayPaymentId: razorpay_payment_id, razorpaySignature: razorpay_signature, orderStatus: "pending", deliveryShippingCharges: tempOrderDetail.deliveryShippingCharges, deliveryTotalQuantity: tempOrderDetail.deliveryTotalQuantity, deliveryTotalWeight: tempOrderDetail.deliveryTotalWeight, orderCreatedDate: orderCreatedDate }, { transaction: t });

          await models.digiGoldTempOrderDetail.update({ isOrderPlaced: true }, { where: { id: tempOrderDetail.id }, transaction: t })

          if (cartData.length) {
            for (let cart of cartData) {
              await models.digiGoldOrderProductDetail.create({ orderDetailId: orderDetail.id, productSku: cart.productSku, productWeight: cart.productWeight, productName: cart.productName, amount: cart.amount, productImage: cart.productImage, totalAmount: cart.totalProductAmount, metalType: cart.metalType, quantity: cart.quantity, createdBy: 1, modifiedBy: 1 }, { transaction: t });
            }
          }
          let tempOrderAddressDetail = await models.digiGoldTempOrderAddress.findAll({ where: { tempOrderDetailId: tempOrderDetail.id } });

          for (let address of tempOrderAddressDetail) {
            await models.digiGoldOrderAddressDetail.create({ orderDetailId: orderDetail.id, customerName: address.customerName, addressType: address.addressType, address: address.address, stateId: address.stateId, cityId: address.cityId, pinCode: address.pinCode }, { transaction: t });
          }

          await sms.sendMessageForOrderPlaced(customerDetails.mobileNumber, result.data.result.data.orderId);

        })
      }
      if (requestFrom == "mobileApp") {
        return res.status(200).json(result.data);
      } else {
        res.redirect(`${process.env.BASE_URL_CUSTOMER}/digi-gold/order-success/delivery/${result.data.result.data.merchantTransactionId}`);
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
  };
}

exports.getOrderDetailsWithTransId = async (req, res) => {
  try {
    const { merchantTransactionId } = req.params;
    const id = req.userData.id;
    let customerDetails = await models.customer.findOne({
      where: { id, isActive: true },
    });
    if (check.isEmpty(customerDetails)) {
      return res.status(404).json({ message: "Customer Does Not Exists" });
    };
    const customerUniqueId = customerDetails.customerUniqueId;
    const merchantData = await getMerchantData();
    const result = await models.axios({
      method: 'GET',
      url: `${process.env.DIGITALGOLDAPI}/merchant/v1/order/${merchantTransactionId}/${customerUniqueId}`,
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

exports.getOrderList = async (req, res) => {
  try {
    const id = req.userData.id;
    const { search, pageSize, pageNumber } = pagination.paginationWithPageNumberPageSize(req.query.search, req.query.page, req.query.count);
    let customerDetails = await models.customer.findOne({
      where: { id, isActive: true },
    });
    if (check.isEmpty(customerDetails)) {
      return res.status(404).json({ message: "Customer Does Not Exists" });
    };
    const customerUniqueId = customerDetails.customerUniqueId;
    const merchantData = await getMerchantData();
    const result = await models.axios({
      method: 'GET',
      url: `${process.env.DIGITALGOLDAPI}/merchant/v1/${customerUniqueId}/order?name=${search}&page=${pageNumber}&count=${pageSize}`,
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

async function generateOrderInvoicedata(transactionId) {
  const merchantData = await getMerchantData();
  const options = {
    format: "A4",
    orientation: "portrait",
    border: "10mm",
    "header": {
      "height": "2mm",
    },
    "footer": {
      "height": "2mm",
    },
    "height": "16.5in",
    "width": "11.7in"
  };
  const result = await models.axios({
    method: 'GET',
    url: `${process.env.DIGITALGOLDAPI}/merchant/v1/invoice/order/${transactionId}`,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${merchantData.accessToken}`,
    },
  });
  let fileName = await `invoice${Date.now()}`;
  const invoiceAmount = result.data.result.data.netAmount;
  let words;
  if (Number.isInteger(parseFloat(invoiceAmount))) {
    words = 'Rupees' + ' ' + numToWords(parseFloat(invoiceAmount), true) + 'Only';
  } else {
    words = 'Rupees' + ' ' + numToWords(invoiceAmount.split('.')[0], false) + 'and' + ' ' + numToWords(invoiceAmount.split('.')[1], false) + 'Paise Only';
  }
  const document = {
    html: html,
    data: {
      invoiceData: result.data.result.data,
      date: result.data.result.data.invoiceDate.split(' ')[0],
      bootstrapCss: `${process.env.URL}/bootstrap.css`,
      jqueryJs: `${process.env.URL}/jquery-slim.min.js`,
      popperJs: `${process.env.URL}/popper.min.js`,
      bootstrapJs: `${process.env.URL}/bootstrap.js`,
      words
    },
    path: `./public/uploads/digitalGoldKyc/pdf/${fileName}.pdf`
  };
  const created = await pdf.create(document, options)

  let data = { created: created, fileName: fileName }

  return data
}


exports.generateOrderInvoice = async (req, res) => {
  try {
    const { transactionId } = req.params;
    let invoiceData = await generateOrderInvoicedata(transactionId);

    if (invoiceData.created) {

      res.status(200).json({ invoice: process.env.URL + `/uploads/digitalGoldKyc/pdf/${invoiceData.fileName}.pdf` });

      setTimeout(async function () {
        fs.readFile(`./public/uploads/digitalGoldKyc/pdf/${invoiceData.fileName}.pdf`, (err, data) => {

          if (fs.existsSync(`./public/uploads/digitalGoldKyc/pdf/${invoiceData.fileName}.pdf`)) {
            fs.unlinkSync(`./public/uploads/digitalGoldKyc/pdf/${invoiceData.fileName}.pdf`);
          }
        });
      }, 500000);

    }

  } catch (err) {
    let errorData = errorLogger(JSON.stringify(err), req.url, req.method, req.hostname, req.body);

    if (err.response) {
      return res.status(422).json(err.response.data);
    } else {
      console.log('Error', err.message);
    }
  };

}

exports.generateOrderInvoiceWeb = async (req, res) => {
  try {
    const { transactionId } = req.params;

    let invoiceData = await generateOrderInvoicedata(transactionId);
    if (invoiceData.created) {
      fs.readFile(`./public/uploads/digitalGoldKyc/pdf/${invoiceData.fileName}.pdf`, (err, data) => {
        let stat = fs.statSync(`./public/uploads/digitalGoldKyc/pdf/${invoiceData.fileName}.pdf`);
        res.setHeader('Content-Length', stat.size);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=${invoiceData.fileName}.pdf`);
        res.send(data);
        if (fs.existsSync(`./public/uploads/digitalGoldKyc/pdf/${invoiceData.fileName}.pdf`)) {
          fs.unlinkSync(`./public/uploads/digitalGoldKyc/pdf/${invoiceData.fileName}.pdf`);
        }
      });
    }

  } catch (err) {
    let errorData = errorLogger(JSON.stringify(err), req.url, req.method, req.hostname, req.body);

    if (err.response) {
      return res.status(422).json(err.response.data);
    } else {
      console.log('Error', err.message);
    }
  };

}
