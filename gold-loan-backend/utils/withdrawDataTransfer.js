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
exports.getWithdrawData = async (req, res) => {
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
      let withdrawNewData = [];
      let withdrawDetail;
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

        // const result = await connectionString.query`DELETE FROM [AGTPL$Online Withdraw]`;
        // console.log(result); 
        // return

        // let creatDepositTable = await connectionString.query`CREATE TABLE [AGTPL$Online Withdraw] ([Withdraw ID] nvarchar(100) NOT NULL, [User Account Id] nvarchar(100),[Withdraw Date] datetime,[User Type] nvarchar(40),[User Account State] nvarchar(20),[Withdraw Amount] decimal(17), [Withdraw Bank] nvarchar(200),[Withdraw Branch] nvarchar(200),[Withdraw IFSC] nvarchar(100),[Withdraw Account] nvarchar(100),[Atom Txn Id] nvarchar(200),[Mode of Payment] nvarchar(100),  [Withdraw TransactionId] nvarchar(200),[processed] tinyint,[Chq No_] nvarchar(200),[User Id] nvarchar(100),[Sell ID] nvarchar(100),[Manual] tinyint,[Creation Date] datetime,PRIMARY KEY ([Withdraw ID]));`
        // console.log(creatDepositTable);
        // return

        // const x = await connectionString.query`SELECT * FROM [AGTPL$Online Deposite Nimap]`;
        // console.log(x);
      
          whereClause = {
            depositApprovedDate: { [Op.between]: [startDateNew, endDateNew] },
            orderTypeId: {[Op.in]: [5]},
            depositStatus: {[Op.in]: ['completed']}
          }
          whereClauseString = `{depositApprovedDate: { [Op.between] : [${startDateNew}, ${endDateNew}] }, orderTypeId: {[Op.in]: [5]}, depositStatus: {[Op.in]: ['completed']}}`
    
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
    
        withdrawDetail = await models.walletTransactionDetails.findAll({
          where: whereClause,
          include: includeArray,
          
        });
    
    
        for (let withdraw of withdrawDetail) {
          data = {};
          data.withdrawId = withdraw.transactionUniqueId;
          data.userAccountId = withdraw.customer.customerUniqueId;
          data.withdrawDate = moment(moment(withdraw.depositApprovedDate).utcOffset("+05:30")).format("YYYY-MM-DD");
          data.userType = "Augmont";
          data.userAccountState = withdraw.customer.state.stateCode;
          data.withdrawAmount = withdraw.transactionAmount;
          data.withdrawBank = withdraw.bankName; 
          data.withdrawBranch = withdraw.branchName;
          data.withdrawIfsc = withdraw.ifscCode;
          data.withdrawAccount = withdraw.accountNumber; 
          data.atomTxnId = withdraw.bankTransactionUniqueId;
          data.modeOfPayment = "";
          data.withdrawTransactionId = withdraw.transactionUniqueId;
          data.processed = 0;
          data.chqNo = "";
          data.userId = 0;
          data.sellId = "";
          data.Manual = 0;
          data.creationDate =  moment(moment().utcOffset("+05:30")).format("YYYY-MM-DD");
    
          withdrawNewData.push(data);
        }
        if (withdrawNewData.length != 0) {

          await dataTransfer(withdrawNewData, connectionString, startDateNew, endDateNew, whereClauseString);
        } else {
          console.log("no data found");
        }
      }else{
      console.log("connection fail");
      }
    
}

async function dataTransfer(DepositNewData, connectionString, startDateTime, endDateTime, whereClause) {
    console.log(DepositNewData);

  for (let ele of DepositNewData) {
    const addDepositData = `INSERT INTO [AGTPL$Online Withdraw] ([Withdraw ID],[User Account Id], [Withdraw Date], [User Type], [User Account State], [Withdraw Amount],[Withdraw Bank], [Withdraw Branch], [Withdraw IFSC], [Withdraw Account], [Atom Txn Id], [Mode of Payment], [Withdraw TransactionId], [processed], [Chq No_], [User Id], [Sell ID], [Manual], [Creation Date]) VALUES('${ele.withdrawId}','${ele.userAccountId}', '${ele.withdrawDate}' ,'${ele.userType}', '${ele.userAccountState}', '${ele.withdrawAmount}', '${ele.withdrawBank}', '${ele.withdrawBranch}', '${ele.withdrawIfsc}', '${ele.withdrawAccount}', '${ele.atomTxnId}', '${ele.modeOfPayment}', '${ele.withdrawTransactionId}', '${ele.processed}', '${ele.chqNo}', '${ele.userId}','${ele.sellId}', '${ele.Manual}', '${ele.creationDate}')`;

    connectionString.query(addDepositData, async function (err, result, fields) {
      if (err) {
        console.log(err);
      } else {
        console.log("success");
      };
    })
  }
  await models.agtplWithdrawTransfer.create({ fromTime: startDateTime, toTime: endDateTime, whereClause: JSON.stringify(whereClause) });
}


//cron

exports.getDepositDataCron = async (req, res) => {
  // async function getDepositData() {
    let { cronId } = req.body;
    var date = moment();
    try{
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
      }else{
      var endTime = moment();
      var processingTime = moment.utc(moment(endTime, "DD/MM/YYYY HH:mm:ss.SSS").diff(moment(date, "DD/MM/YYYY HH:mm:ss.SSS"))).format("HH:mm:ss.SSS")
      await models.cronLogger.update({ date: date, startTime: date, endTime: endTime, processingTime: processingTime, status: "failed", notes: "re-executed", message: "connection failed" }, { where: { id: cronId } });  
      return res.status(400).json({ message: 'failed' });
    }}else{
        return res.status(400).json({ message: 'Invalid cron id' });
      }
    }catch(err){
      var endTime = moment();
      var processingTime = moment.utc(moment(endTime, "DD/MM/YYYY HH:mm:ss.SSS").diff(moment(date, "DD/MM/YYYY HH:mm:ss.SSS"))).format("HH:mm:ss.SSS")
      await models.cronLogger.update({ date: date, startTime: date, endTime: endTime, processingTime: processingTime, status: "failed", notes: "re-executed", message: err.message }, { where: { id: cronId } }); 
      return res.status(400).json({ message: 'failed' }); 
    }  
}






