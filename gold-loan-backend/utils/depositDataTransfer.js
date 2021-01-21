var sql = require("mssql");
var request = new sql.Request();
const moment = require('moment')
const models = require('../models');
const sequelize = models.sequelize;
const Sequelize = models.Sequelize;
const Op = Sequelize.Op;
const fs = require('fs');
const _ = require("lodash");

// getDepositData();
exports.getDepositData = async (req, res) => {
  try {
    // async function getDepositData() {
    var dateObj = new Date();

    dateObj.setDate(dateObj.getDate() - 1);
    const getCredential = await models.navisionDbConfig.getNavisionDbConfig();

    var config = {
      user: getCredential.serverUserName,
      password: getCredential.serverPassword,
      server: getCredential.serverIp,
      database: getCredential.serverDbName
    };

    let connectionString = await sql.connect(config);
    let DepositNewData = [];
    let depositDetail;
    let whereClause;
    let whereClauseString;

    var dateObj = new Date();
    dateObj.setDate(dateObj.getDate() - 1);

    // let endDateNew = moment(dateObj).endOf('day');
    // let startDateNew = moment(dateObj).startOf('day');
    let endDateNew = moment(moment(dateObj).utcOffset("+05:30").endOf('day'));
    let startDateNew = moment(moment(dateObj).utcOffset("+05:30").startOf('day'));
    console.log(endDateNew, startDateNew)
    if (connectionString) {

      // const result = await connectionString.query`DELETE FROM [AGTPL$Online Deposite]`;
      // console.log(result); 
      // return

      // let creatDepositTable = await connectionString.query`CREATE TABLE [AGTPL$Online Deposite] ([Deposite ID] nvarchar(100) NOT NULL, [User Account Id] nvarchar(100),[User Id] nvarchar(100),[User Type] nvarchar(100),[User Account State] nvarchar(20),[Deposit Mode of Payment] nvarchar(100), [Deposit Date] datetime,[Deposit TransactionId] nvarchar(100),[Mode Of Payment] nvarchar(100),[Deposit Amount] decimal(17),[Delivery charge] decimal(17),[Delivery Type] nvarchar(100),  [Atom Txn Id] nvarchar(100),[processed] tinyint,[Chq No_] nvarchar(200),[Purchase ID] nvarchar(100),[Approved Date] datetime,[Deposit Creation Date] datetime,[Manual] tinyint,[Creation Date] datetime,PRIMARY KEY ([Deposite ID]));`
      // console.log(creatDepositTable);
      // return

      // const x = await connectionString.query`SELECT * FROM [AGTPL$Online Deposite Nimap]`;
      // console.log(x);

      whereClause = {
        depositApprovedDate: { [Op.between]: [startDateNew, endDateNew] },
        orderTypeId: { [Op.in]: [4] },
        depositStatus: { [Op.in]: ['completed'] }
      }
      whereClauseString = `{depositApprovedDate: { [Op.between] : [${startDateNew}, ${endDateNew}] }, orderTypeId: {[Op.in]: [4]}, depositStatus: {[Op.in]: ['completed']}}`

      const includeArray = [
        {
          model: models.customer,
          as: 'customer',
          attributes: ['customerUniqueId'],
          include: {
            model: models.state,
            as: 'state'
          }
        }
      ];

      depositDetail = await models.walletTransactionDetails.findAll({
        where: whereClause,
        include: includeArray,

      });


      for (let deposit of depositDetail) {
        data = {};
        data.depositeId = deposit.transactionUniqueId;
        data.userAccountId = deposit.customer.customerUniqueId;
        data.userId = 0;
        data.userType = "Augmont";
        data.userAccountState = deposit.customer.state.stateCode;
        data.depositModeofPayment = deposit.paymentType;
        data.depositDate = moment(moment(deposit.paymentReceivedDate).utcOffset("+05:30")).format("YYYY-MM-DD");
        data.depositTransactionId = deposit.transactionUniqueId;
        data.modeOfPayment = "";
        data.depositAmount = deposit.transactionAmount;
        data.deliveryCharge = 0;
        data.deliveryType = "";
        data.processed = 0;
        data.chqNo = "";
        data.purchaseId = "";
        data.approvedDate = moment(moment(deposit.depositApprovedDate).utcOffset("+05:30")).format("YYYY-MM-DD");
        data.depositCreationDate = moment(moment(deposit.paymentReceivedDate).utcOffset("+05:30")).format("YYYY-MM-DD");
        data.Manual = 0;
        data.creationDate = moment(moment().utcOffset("+05:30")).format("YYYY-MM-DD");
        if (deposit.paymentType == 'upi' || deposit.paymentType == 'netbanking' || deposit.paymentType == 'wallet' || deposit.paymentType == 'card') {
          data.atomTxnId = deposit.razorpayPaymentId;
        } else {
          data.atomTxnId = deposit.bankTransactionUniqueId;
        }

        DepositNewData.push(data);
      }
      console.log("DepositNewData", DepositNewData);
      if (DepositNewData.length != 0) {

        await dataTransfer(DepositNewData, connectionString, startDateNew, endDateNew, whereClauseString);
      } else {
        console.log("no data found");
      }
    } else {
      console.log("connection fail");
    }
  } catch (err) {
    console.log(err);
  }


}

async function dataTransfer(DepositNewData, connectionString, startDateTime, endDateTime, whereClause) {

  for (let ele of DepositNewData) {

    const addDepositData = `INSERT INTO [AGTPL$Online Deposite] ([Deposite ID],[User Account Id], [User Id], [User Type], [User Account State], [Deposit Mode of Payment],[Deposit Date], [Deposit TransactionId], [Mode Of Payment], [Deposit Amount], [Delivery charge], [Delivery Type], [Atom Txn Id], [processed], [Chq No_], [Purchase ID], [Approved Date], [Deposit Creation Date], [Manual], [Creation Date]) VALUES('${ele.depositeId}','${ele.userAccountId}', '${ele.userId}' ,'${ele.userType}', '${ele.userAccountState}', '${ele.depositModeofPayment}', '${ele.depositDate}', '${ele.depositTransactionId}', '${ele.modeOfPayment}', '${ele.depositAmount}', '${ele.deliveryCharge}', '${ele.deliveryType}', '${ele.atomTxnId}', '${ele.processed}', '${ele.chqNo}', '${ele.purchaseId}', '${ele.approvedDate}', '${ele.depositCreationDate}', '${ele.Manual}', '${ele.creationDate}')`

    connectionString.query(addDepositData, async function (err, result, fields) {
      if (err) {
        console.log(err);
      } else {
        console.log("success");
      };
    })
  }
  let query = await models.agtplDepositTransfer.create({ fromTime: startDateTime, toTime: endDateTime, whereClause: JSON.stringify(whereClause) });
}


//cron

exports.getDepositDataCron = async (req, res) => {
  // async function getDepositData() {
  let { cronId } = req.body;
  var date = moment();
  try {
    let cronData = await models.cronLogger.findOne({ where: { id: cronId, cronType: 'deposit data transfer' } });
    if (cronData) {
      var dateObj = new Date(cronData.date);
      dateObj.setDate(dateObj.getDate() - 1);
      const getCredential = await models.navisionDbConfig.findOne();

      var config = {
        user: getCredential.serverUserName,
        password: getCredential.serverPassword,
        server: getCredential.serverIp,
        database: getCredential.serverDbName
      };

      let connectionString = await sql.connect(config);
      let DepositNewData = [];
      let depositDetail;
      let whereClause;
      let whereClauseString;

      var dateObj = new Date(cronData.date);
      dateObj.setDate(dateObj.getDate() - 1);

      // let endDateNew = moment(dateObj).endOf('day');
      // let startDateNew = moment(dateObj).startOf('day');
      let endDateNew = moment(moment(dateObj).utcOffset("+05:30").endOf('day'));
      let startDateNew = moment(moment(dateObj).utcOffset("+05:30").startOf('day'));

      if (connectionString) {

        const lastData = await connectionString.query`SELECT TOP 1 * FROM [AGTPL$Online Deposite Nimap] ORDER BY [Deposite ID] DESC`;

        if (lastData.recordset.length != 0) {

          whereClause = {
            createdAt: { [Op.between]: [startDateNew, endDateNew] },
            id: {
              [Op.gt]: lastData.recordset[0]['Deposite ID']
            }
          }
          whereClauseString = `{createdAt: { [Op.between] : [${startDateNew}, ${endDateNew}] }, id: {[Op.gt]: ${lastData.recordset[0]['Deposite ID']}}}`

        } else {
          whereClause = {
            createdAt: { [Op.between]: [startDateNew, endDateNew] },
          }
          whereClauseString = `{createdAt: { [Op.between] : [${startDateNew}, ${endDateNew}] }}`
        }

        const includeArray = [
          {
            model: models.orders,
            as: 'order',
            required: true,
            attributes: ['orderUniqueId'],
            where: { isActive: true },
            include: [
              {
                model: models.user,
                as: 'orderBy',
                required: true,
                attributes: ['firstName', 'lastName', 'mobileNumber'],
                where: { isActive: true },
                include: [{
                  required: true,
                  model: models.broker,
                  as: 'broker',
                  attributes: ['id'],
                  include:
                  {
                    model: models.merchant,
                    as: 'merchant',
                    attributes: ['merchantName']
                  }
                },
                {
                  model: models.user_address,
                  as: 'address',
                  attributes: ['address'],
                  include: {
                    model: models.state,
                    as: 'state'
                  }
                }
                ]
              },
              {
                model: models.customer,
                as: "customerDetails",
                where: { isActive: true },
                attributes: ['customerUniqueId'],
                include: {
                  model: models.customerAddress,
                  as: "customeraddress",
                  where: {
                    isActive: true,
                  },
                  attributes: ['address',
                    'landMark',
                    'postalCode',],
                  include:
                  {
                    model: models.state,
                    where: {
                      isActive: true,
                    },
                    attributes: ['name', 'stateCode'],
                    as: 'state'
                  }
                }
              }

            ]
          }
        ];

        depositDetail = await models.orderTransaction.findAll({
          where: whereClause,
          include: includeArray,
          attributes: ['id', 'paymentRecievedDate', 'transactionAmount', 'transactionId', 'orderId', 'createdAt', 'updatedAt', 'paymentMode']
        });


        for (let deposit of depositDetail) {
          data = {};
          data.depositeId = parseInt(deposit.id);
          data.userId = deposit.order.customerDetails.customerUniqueId;
          data.depositAmount = deposit.transactionAmount;
          data.paymentMode = deposit.paymentMode;
          data.depositDate = moment(deposit.paymentRecievedDate).format("YYYY-MM-DD HH:mm:ss");
          data.depositCreationDate = moment(deposit.paymentRecievedDate).format("YYYY-MM-DD HH:mm:ss");
          data.depositTransactionId = deposit.transactionId;
          data.userMerchantType = deposit.order.orderBy.broker.merchant.merchantName;
          data.userStateCode = deposit.order.orderBy.address[0].state.stateCode;
          data.ordeId = parseInt(deposit.order.orderUniqueId);
          data.createdAt = deposit.createdAt;
          data.updatedAt = deposit.updatedAt;
          data.processed = 0;

          DepositNewData.push(data);
        }

        if (DepositNewData.length != 0) {

          await dataTransfer(DepositNewData, connectionString, startDateNew, endDateNew, whereClauseString);
        } else {
          console.log("no data found");
        }
        var endTime = moment();
        var processingTime = moment.utc(moment(endTime, "DD/MM/YYYY HH:mm:ss.SSS").diff(moment(date, "DD/MM/YYYY HH:mm:ss.SSS"))).format("HH:mm:ss.SSS")
        await models.cronLogger.update({ date: date, startTime: date, endTime: endTime, processingTime: processingTime, status: "success", notes: "re-executed", message: "success" }, { where: { id: cronId } });
        return res.status(200).json({ message: 'success' });
      } else {
        var endTime = moment();
        var processingTime = moment.utc(moment(endTime, "DD/MM/YYYY HH:mm:ss.SSS").diff(moment(date, "DD/MM/YYYY HH:mm:ss.SSS"))).format("HH:mm:ss.SSS")
        await models.cronLogger.update({ date: date, startTime: date, endTime: endTime, processingTime: processingTime, status: "failed", notes: "re-executed", message: "connection failed" }, { where: { id: cronId } });
        return res.status(400).json({ message: 'failed' });
      }
    } else {
      return res.status(400).json({ message: 'Invalid cron id' });
    }
  } catch (err) {
    var endTime = moment();
    var processingTime = moment.utc(moment(endTime, "DD/MM/YYYY HH:mm:ss.SSS").diff(moment(date, "DD/MM/YYYY HH:mm:ss.SSS"))).format("HH:mm:ss.SSS")
    await models.cronLogger.update({ date: date, startTime: date, endTime: endTime, processingTime: processingTime, status: "failed", notes: "re-executed", message: err.message }, { where: { id: cronId } });
    return res.status(400).json({ message: 'failed' });
  }
}






