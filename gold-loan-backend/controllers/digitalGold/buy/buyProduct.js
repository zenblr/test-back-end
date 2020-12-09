const qs = require('qs');
const uniqid = require('uniqid');
const crypto = require('crypto');
const moment = require('moment');
const path = require('path');
const models = require('../../../models');
const getMerchantData = require('../auth/getMerchantData');
const check = require('../../../lib/checkLib');
const getRazorpayCredentails = require('../../../utils/razorpay');
const pagination = require('../../../utils/pagination');
// let sms = require('../../../utils/sendSMS');
let sms = require('../../../utils/SMS');
var pdf = require("pdf-creator-node");
var fs = require('fs');
const numToWords = require('../../../utils/numToWords');
const html = fs.readFileSync(path.join(__dirname, '..', '..', '..', 'templates', 'invoiceTemplate.html'), 'utf8')
const errorLogger = require('../../../utils/errorLogger');
const sequelize = models.sequelize;
const Sequelize = models.Sequelize;
const Op = Sequelize.Op;


exports.buyProduct = async (req, res) => {
  try {
    // const { metalType, quantity, lockPrice, blockId, transactionDetails, amount, quantityBased, modeOfPayment } = req.body;

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, requestFrom } = req.body;

    let tempOrderData = await models.digiGoldTempOrderDetail.getTempOrderDetail(razorpay_order_id);

    const id = tempOrderData.customerId;
    const razorPay = await getRazorpayCredentails();
    let customerDetails = await models.customer.findOne({
      where: { id, isActive: true },
    });
    if (check.isEmpty(customerDetails)) {
      return res.status(404).json({ message: "Customer Does Not Exists" });
    }


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
    //razorPayOrder.items[0].wallet
    const getUserDetails = getUser.data.result.data;
    const data = {
      'lockPrice': tempOrderData.lockPrice,
      'emailId': getUserDetails.userEmail,
      'metalType': tempOrderData.metalType,
      'merchantTransactionId': razorpay_payment_id,
      'userName': getUserDetails.userName,
      'userCity': getUserDetails.userCityId,
      'userState': getUserDetails.userStateId,
      'userPincode': getUserDetails.userPincode,
      'uniqueId': customerUniqueId,
      'blockId': tempOrderData.blockId,
      'modeOfPayment': tempOrderData.modeOfPayment,
      'mobileNumber': customerDetails.mobileNumber
    };
    if (tempOrderData.quantityBased == true) {
      data.quantity = tempOrderData.quantity;
    } else {
      data.amount = tempOrderData.amount;
    }
    const result = await models.axios({
      method: 'POST',
      url: `${process.env.DIGITALGOLDAPI}/merchant/v1/buy`,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Bearer ${merchantData.accessToken}`,
      },
      data: qs.stringify(data)
    })
    await models.axios({
      method: 'PATCH',
      url: `https://api.razorpay.com/v1/payments/${razorpay_payment_id}`,
      auth: {
        username: razorPay.razorPayConfig.key_id,
        password: razorPay.razorPayConfig.key_secret
      },
      data: qs.stringify({ notes: { transactionId: result.data.result.data.transactionId, uniqueId: customerDetails.customerUniqueId } })
    })
    const customerName = customerDetails.firstName + " " + customerDetails.lastName;
    if (result.data.statusCode === 200) {

      await sequelize.transaction(async (t) => {

        let orderUniqueId = `dg_buy${Math.floor(1000 + Math.random() * 9000)}`;

        let orderDetail = await models.digiGoldOrderDetail.create({ tempOrderId: tempOrderData.id, customerId: id, orderTypeId: 1, orderId: orderUniqueId, metalType: tempOrderData.metalType, quantity: tempOrderData.quantity, lockPrice: tempOrderData.lockPrice, blockId: tempOrderData.blockId, amount: tempOrderData.amount, rate: result.data.result.data.rate, quantityBased: tempOrderData.quantityBased, modeOfPayment: tempOrderData.modeOfPayment, goldBalance: result.data.result.data.goldBalance, silverBalance: result.data.result.data.silverBalance, merchantTransactionId: result.data.result.data.merchantTransactionId, transactionId: result.data.result.data.transactionId, razorpayOrderId: razorpay_order_id, razorpayPaymentId: razorpay_payment_id, razorpaySignature: razorpay_signature, orderSatatus: "pending", totalAmount: tempOrderData.amount }, { transaction: t });

        await models.digiGoldTempOrderDetail.update({ isOrderPlaced: true }, { where: { razorpayOrderId: razorpay_order_id } });

        let CustomerBalanceData = await models.digiGoldCustomerBalance.findOne({ where: { customerId: id, isActive: true } })
        if (CustomerBalanceData) {
          await models.digiGoldCustomerBalance.update({ currentGoldBalance: result.data.result.data.goldBalance, currentSilverBalance: result.data.result.data.silverBalance }, { where: { customerId: id }, transaction: t });
        } else {
          await models.digiGoldCustomerBalance.create({ customerId: id, currentGoldBalance: result.data.result.data.goldBalance, currentSilverBalance: result.data.result.data.silverBalance }, { transaction: t });
        }
        console.log(result.data);
        await models.digiGoldOrderTaxDetail.create({ orderDetailId: orderDetail.id, totalTaxAmount: result.data.result.data.totalTaxAmount, cgst: result.data.result.data.taxes.taxSplit[0].cgst, sgst: result.data.result.data.taxes.taxSplit[0].scgst, isActive: true }, { transaction: t });
      })

      await sms.sendMessageForBuy(customerName, customerDetails.mobileNumber, result.data.result.data.quantity, result.data.result.data.metalType, result.data.result.data.totalAmount);
    }
    if (requestFrom == "mobileApp") {
      return res.status(200).json(result.data);
    }
    res.cookie(`metalObject`, `${JSON.stringify(result.data.result.data.metalType)}`);
    res.redirect(`http://${process.env.DIGITALGOLDAPI}/digi-gold/order-success/buy/${result.data.result.data.merchantTransactionId}`);

  } catch (err) {
    console.log(err);

    // let errorData = errorLogger(JSON.stringify(err), req.url, req.method, req.hostname, req.body);

    // if (err.response) {
    //   return res.status(422).json(err.response.data);
    // } else {
    //   console.log('Error', err.message);
    // }
    if (err.response) {
      if(err.response.data.errors.userKyc && err.response.data.errors.userKyc.length ){

        res.cookie(`KYCError`, `${JSON.stringify(err.response.data.errors.userKyc[0].message)}`);
        res.redirect(`https://${process.env.DIGITALGOLDAPI}/kyc/digi-gold`);
      }else{
        return res.status(422).json(err.response.data);
      }
    } else {
      console.log('Error', err.message);
    }
  };
}

exports.getAllBuyDetails = async (req, res) => {
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
      url: `${process.env.DIGITALGOLDAPI}/merchant/v1/${customerUniqueId}/buy?name=${search}&page=${pageNumber}&count=${pageSize}`,
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

async function generateInvoicedata(transactionId) {
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
    url: `${process.env.DIGITALGOLDAPI}/merchant/v1/invoice/${transactionId}`,
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

exports.generateInvoiceweb = async (req, res) => {
  try {

    const { transactionId } = req.params;

    let generateInvoice = await generateInvoicedata(transactionId);

    if (generateInvoice.created) {
      fs.readFile(`./public/uploads/digitalGoldKyc/pdf/${generateInvoice.fileName}.pdf`, (err, data) => {
        let stat = fs.statSync(`./public/uploads/digitalGoldKyc/pdf/${generateInvoice.fileName}.pdf`);
        res.setHeader('Content-Length', stat.size);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=${generateInvoice.fileName}.pdf`);
        res.send(data);
        if (fs.existsSync(`./public/uploads/digitalGoldKyc/pdf/${generateInvoice.fileName}.pdf`)) {
          fs.unlinkSync(`./public/uploads/digitalGoldKyc/pdf/${generateInvoice.fileName}.pdf`);
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

exports.generateInvoice = async (req, res) => {
  try {
    const { transactionId } = req.params;
    console.log(transactionId);

    let generateInvoice = await generateInvoicedata(transactionId);
    console.log(generateInvoice);
    if (generateInvoice.created) {

      res.status(200).json({ invoice: process.env.URL + `/uploads/digitalGoldKyc/pdf/${generateInvoice.fileName}.pdf` });

      setTimeout(async function () {
        fs.readFile(`./public/uploads/digitalGoldKyc/pdf/${generateInvoice.fileName}.pdf`, (err, data) => {

          if (fs.existsSync(`./public/uploads/digitalGoldKyc/pdf/${generateInvoice.fileName}.pdf`)) {
            fs.unlinkSync(`./public/uploads/digitalGoldKyc/pdf/${generateInvoice.fileName}.pdf`);
          }
        });
      }, 500000);
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


exports.getBuyDetailsWithTransId = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const id = req.userData.id;

    let customerDetails = await models.customer.findOne({
      where: { id, isActive: true },
    });
    if (check.isEmpty(customerDetails)) {
      return res.status(404).json({ message: "Customer Does Not Exists" });
    };
    console.log(customerDetails.customerUniqueId);
    const customerUniqueId = customerDetails.customerUniqueId;
    const merchantData = await getMerchantData();
    console.log(customerUniqueId);
    const result = await models.axios({
      method: 'GET',
      url: `${process.env.DIGITALGOLDAPI}/merchant/v1/buy/${transactionId}/${customerUniqueId}`,
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