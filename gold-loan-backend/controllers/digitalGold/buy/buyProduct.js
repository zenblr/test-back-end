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
const { walletBuy, customerBalance } = require('../../../service/wallet');
const { postMerchantOrder, getUserData, postBuy } = require('../../../service/digiGold')


exports.buyProduct = async (req, res) => {
  // try {


  const { amount, metalType, quantity, lockPrice, blockId, quantityBased, modeOfPayment } = req.body;

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


  const checkLimit = await checkBuyLimit(id, amount);
  if(!checkLimit.success){
    return res.status(404).json({ message: checkLimit.message });
  }


  let tempOrderData;
  let currentTempBal;
  let walletData
  let output = await sequelize.transaction(async (t) => {
    walletData = await models.walletTempDetails.create({ customerId: id, amount, paymentDirection: "debit", description: `${metalType} bought ${quantity} grams`, productTypeId: 4, transactionDate: moment() }, { transaction: t });

    currentTempBal = Number(customerDetails.currentWalletBalance) - Number(amount);

    tempOrderData = await models.digiGoldTempOrderDetail.create({ customerId: id, orderTypeId: 1, totalAmount: amount, metalType, quantity, lockPrice, blockId, amount, quantityBased, modeOfPayment: modeOfPayment, createdBy: 1, modifiedBy: 1, walletTempId: walletData.id, walletBalance: currentTempBal }, { transaction: t });

    let walletBuy1 = async (customerId, lockPrice, metalType, blockId, modeOfPayment, quantity, orderAmount, orderId, quantityBased, tempWalletId, temporderDetailId) => {
      try {

        let customerDetails = await models.customer.findOne({ where: { id: customerId } });

        const customerUniqueId = customerDetails.customerUniqueId;
        const merchantData = await getMerchantData();


        const getUser = await getUserData(customerUniqueId)

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

        const customerName = customerDetails.firstName + " " + customerDetails.lastName;

        if (result.isSuccess) {

          // let currentBal = Number(customerDetails.currentWalletBalance) - Number(result.data.result.data.totalAmount);
          //calculation function
          let checkBalance = await customerBalance(customerDetails, result.data.result.data.totalAmount)
          //calculation function

          await models.customer.update({ currentWalletBalance: checkBalance.currentWalletBalance, walletFreeBalance: checkBalance.walletFreeBalance }, { where: { id: customerId }, transaction: t })

          let orderUniqueId = `dg_buy${Math.floor(1000 + Math.random() * 9000)}`;

          let walletData = await models.walletDetails.create({ customerId: customerId, amount: result.data.result.data.totalAmount, paymentDirection: "debit", description: `${metalType} bought ${quantity} grams`, productTypeId: 4, transactionDate: moment(), walletTempDetailId: tempWalletId, orderTypeId: 1, paymentOrderTypeId: 6 }, { transaction: t });

          let orderDetail = await models.digiGoldOrderDetail.create({ tempOrderId: temporderDetailId, customerId: customerId, orderTypeId: 1, orderId: orderUniqueId, metalType: result.data.result.data.metalType, quantity: quantity, lockPrice: lockPrice, blockId: blockId, amount: result.data.result.data.totalAmount, rate: result.data.result.data.rate, quantityBased: quantityBased, modeOfPayment: modeOfPayment, goldBalance: result.data.result.data.goldBalance, silverBalance: result.data.result.data.silverBalance, merchantTransactionId: result.data.result.data.merchantTransactionId, transactionId: result.data.result.data.transactionId, orderStatus: "pending", totalAmount: result.data.result.data.totalAmount, walletBalance: checkBalance.currentWalletBalance, walletId: walletData.id }, { transaction: t });

          await models.digiGoldTempOrderDetail.update({ isOrderPlaced: true }, { where: { id: orderId }, transaction: t });

          let CustomerBalanceData = await models.digiGoldCustomerBalance.findOne({ where: { customerId: customerId, isActive: true } })
          if (CustomerBalanceData) {
            await models.digiGoldCustomerBalance.update({ currentGoldBalance: result.data.result.data.goldBalance, currentSilverBalance: result.data.result.data.silverBalance }, { where: { customerId: customerId }, transaction: t });
          } else {
            await models.digiGoldCustomerBalance.create({ customerId: customerId, currentGoldBalance: result.data.result.data.goldBalance, currentSilverBalance: result.data.result.data.silverBalance }, { transaction: t });
          }
          await models.digiGoldOrderTaxDetail.create({ orderDetailId: orderDetail.id, totalTaxAmount: result.data.result.data.totalTaxAmount, cgst: result.data.result.data.taxes.taxSplit[0].cgst, sgst: result.data.result.data.taxes.taxSplit[0].scgst, isActive: true }, { transaction: t });

          await sms.sendMessageForBuy(customerName, customerDetails.mobileNumber, result.data.result.data.quantity, result.data.result.data.metalType, result.data.result.data.totalAmount);

          return result.data;

        } else if (!result.isSuccess) {
          return { err }
        }

      } catch (err) {
        console.log(err)
        if (err.response.data.statusCode == 422) {
          if (err.response.data.errors.userKyc.length) {
            return err.response.data
          }
        }
      }
    }

    let orderBuy = await walletBuy1(customerDetails.id, lockPrice, metalType, blockId, modeOfPayment, quantity, amount, tempOrderData.id, quantityBased, walletData.id, tempOrderData.id);
    return { orderBuy }
  })
  let { orderBuy } = output
  if (orderBuy && orderBuy.statusCode === 200) {

    return res.status(200).json(orderBuy);
  }

  if (orderBuy.errors.userKyc) {
    return res.status(400).json(orderBuy);
  } else {
    return res.status(400).json({ message: "something went wrong" });

  }

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
      res.setHeader('Content-Disposition', `attachment; filename=${enerateInvoice.fileName}.pdf`);
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

        return ({ message: "your kyc  is pending.Please complete Kyc first", success: false });

      }

    } else if (totalAmount > limit && customer.digiKycStatus == 'pending') {




      if ((customer.panType == "pan" && customer.panCardNumber != '' && customer.panCardNumber != null) || customer.panType == "form60") {

        return ({ message: "your kyc status is pending", success: false });

      } else {

        return ({ message: "your kyc  is pending.Please complete Kyc first", success: false });

      }

    } else if (total > limit && customer.digiKycStatus == 'approved') {

      return ({ message: "your kyc  is approved", success: true });
    } else if (totalAmount >= limit && customer.digiKycStatus == 'approved') {

      return ({ message: "your kyc  is approved", success: true });
    } else if (total < limit && customer.digiKycStatus == 'approved' || customer.digiKycStatus == 'pending' || customer.digiKycStatus == 'waiting') {



      if (totalAmount > limit) {
        if ((customer.panType == "pan" && customer.panCardNumber != '' && customer.panCardNumber != null) || customer.panType == "form60") {

          return ({ message: "your kyc status is pending", success: false });

        } else {

          return ({ message: "your kyc is pending.Please complete Kyc first", success: false });

        }
      } else {

        return ({ message: "no need of kyc", success: true });
      }

    } else if (total > limit || totalAmount > limit && customer.digiKycStatus == 'rejected') {

      return ({ message: "your kyc approval is rejected", success: false });
    } else if (total < limit || totalAmount < limit && customer.digiKycStatus == 'rejected') {


      return ({ message: "your kyc approval is rejected", success: false });
    } else if (total > limit && customer.digiKycStatus == 'waiting') {

      // if ((customer.panType == "pan" && customer.panCardNumber != '' && customer.panCardNumber != null) || customer.panType == "form60") {

      if ((customer.panType == "pan" && customer.panCardNumber != '' && customer.panCardNumber != null) || customer.panType == "form60") {

        return ({ message: "your kyc approval is pending", success: false });

      } else {

        return ({ message: "your kyc  is pending.Please complete Kyc first", success: false });

      }
    } else if (totalAmount >= limit && customer.digiKycStatus == 'waiting') {

      if ((customer.panType == "pan" && customer.panCardNumber != '' && customer.panCardNumber != null) || customer.panType == "form60") {


        return ({ message: "your kyc approval is pending", success: false });

      } else {

        return ({ message: "your kyc  is pending.Please complete Kyc first", success: false });

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
      || customer.digiKycStatus == 'pending' || customer.digiKycStatus == 'waiting') {

      return ({ message: "no need of kyc", success: true });

    } else if (totalAmount > limit && customer.digiKycStatus == 'rejected') {


      return ({ message: "your kyc approval is rejected", success: false });
    } else if (totalAmount < limit && customer.digiKycStatus == 'rejected') {


      return ({ message: "your kyc approval is rejected", success: false });
    } else if (totalAmount >= limit && customer.digiKycStatus == 'waiting') {

      if ((customer.panType == "pan" && customer.panCardNumber != '' && customer.panCardNumber != null) || customer.panType == "form60") {

        return ({ message: "your kyc approval is pending", success: false });

      } else {

        return ({ message: "your kyc  is pending.Please complete Kyc first", success: false });

      }
    }

  }
}