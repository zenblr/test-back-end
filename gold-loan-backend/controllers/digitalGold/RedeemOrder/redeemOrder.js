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

exports.AddOrder = async (req, res) => {
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

          await models.digiGoldCustomerBalance.update({ currentGoldBalance: result.data.result.data.goldBalance, currentSilverBalance: result.data.result.data.silverBalance }, { where: { customerId: id }, transaction: t });

          let orderDetail = await models.digiGoldOrderDetail.create({ tempOrderId: tempOrderDetail.id, customerId: id, orderTypeId: 3, orderId: tempOrderDetail.blockId, totalAmount: tempOrderDetail.totalAmount, quantity: tempOrderDetail.quantity, blockId: tempOrderDetail.blockId, amount: tempOrderDetail.amount, modeOfPayment: tempOrderDetail.modeOfPayment, userAddressId: tempOrderDetail.userAddressId, goldBalance: result.data.result.data.goldBalance, silverBalance: result.data.result.data.silverBalance, merchantTransactionId: result.data.result.data.merchantTransactionId, transactionId: result.data.result.data.orderId, razorpayOrderId: razorpay_order_id, razorpayPaymentId: razorpay_payment_id, razorpaySignature: razorpay_signature, orderSatatus: "pending", deliveryShippingCharges: tempOrderDetail.deliveryShippingCharges, deliveryTotalQuantity: tempOrderDetail.deliveryTotalQuantity, deliveryTotalWeight: tempOrderDetail.deliveryTotalWeight}, { transaction: t });

          await models.digiGoldTempOrderDetail.update({ isOrderPlaced: true }, { where: { id: tempOrderDetail.id }, transaction: t })

        let cartData = await models.digiGoldTempOrderProductDetail.findAll({where: {tempOrderDetailId: tempOrderDetail.id }})

          if(cartData.length){
            for(let cart of cartData){
              await models.digiGoldOrderProductDetail.create({orderDetailId: orderDetail.id, productSku: cart.productSku, productWeight: cart.productWeight, productName: cart.productName, amount: cart.amount, productImage: cart.productImage, totalAmount: cart.totalProductAmount, metalType: cart.metalType, quantity: cart.quantity, createdBy: 1, modifiedBy: 1}, { transaction: t });
              }
          }
          let tempOrderAddressDetail = await models.digiGoldTempOrderAddress.findAll({ where: { tempOrderDetailId: tempOrderDetail.id}});

          for (let address of tempOrderAddressDetail) {
            await models.digiGoldOrderAddressDetail.create({ orderDetailId: orderDetail.id,customerName:address.customerName,   addressType: address.addressType, address: address.address, stateId: address.stateId, cityId: address.cityId, pinCode: address.pinCode }, { transaction: t });
          }

          await sms.sendMessageForOrderPlaced(customerDetails.mobileNumber, result.data.result.data.orderId);

        })
      }
      if(requestFrom == "mobileApp"){
      return res.status(200).json(result.data);
      }else{
        res.redirect(`http://${process.env.DIGITALGOLDAPI}/digi-gold/order-success/delivery/${result.data.result.data.merchantTransactionId}`);
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