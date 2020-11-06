const qs = require('qs');
const models = require('../../../models');
const getMerchantData = require('../auth/getMerchantData');
const sequelize = models.sequelize;
const Sequelize = models.Sequelize;
const Op = Sequelize.Op;
const check = require('../../../lib/checkLib');
const uniqid = require('uniqid');
const jwt = require('jsonwebtoken');
const { JWT_SECRETKEY, JWT_EXPIRATIONTIME } = require('../../../utils/constant');
const errorLogger = require('../../../utils/errorLogger');

exports.getCustomerPassbookDetails = async(req, res)=>{
    try{
      const id = req.userData.id;
      let customerDetails = await models.customer.findOne({
        where: { id, isActive:true },
      });
      if (check.isEmpty(customerDetails)) {
        return res.status(404).json({ message: "Customer Does Not Exists" });
      };
      const customerUniqueId = customerDetails.customerUniqueId;
      const merchantData = await getMerchantData();
      const result = await models.axios({
          method: 'GET',
          url: `${process.env.DIGITALGOLDAPI}/merchant/v1/users/${customerUniqueId}/passbook`,
          headers: { 
            'Content-Type': 'application/json', 
            'Accept': 'application/json', 
            'Authorization': `Bearer ${merchantData.accessToken}`, 
          },
      });
      return res.status(200).json(result.data);
    }catch(err){
      let errorData = errorLogger( JSON.stringify(err), req.url, req.method, req.hostname, req.body);
  
      if (err.response) {
        return res.status(422).json(err.response.data);
      } else {
        console.log('Error', err.message);
      }
    };
  }

  exports.getCustomerDetails = async(req, res)=>{
    try{
      const id = req.userData.id;
      const merchantData = await getMerchantData();
  
      let customerDetails = await models.customer.findOne({
        where: { id, isActive:true },
      });
      if (check.isEmpty(customerDetails)) {
        return res.status(404).json({ message: "Customer Does Not Exists" });
      }
      const customerUniqueId = customerDetails.customerUniqueId;
      const result = await models.axios({
          method: 'GET',
          url: `${process.env.DIGITALGOLDAPI}/merchant/v1/users/${customerUniqueId}`,
          headers: { 
            'Content-Type': 'application/json', 
            'Accept': 'application/json', 
            'Authorization': `Bearer ${merchantData.accessToken}`, 
          },
      });
      const name = result.data.result.data.userName.split(' ');
      result.data.result.data.firstName = name[0];
      result.data.result.data.lastName = name[1];
      result.data.result.data.mobileNumber = customerDetails.mobileNumber;
      return res.status(200).json(result.data);
    }catch(err){
      let errorData = errorLogger(JSON.stringify(err), req.url, req.method, req.hostname, req.body);
  
      if (err.response) {
        return res.status(422).json(err.response.data);
      } else {
        console.log('Error', err.message);
      }
    };
  }

  exports.updateCustomerDetails = async(req, res)=>{
    try{
      const id = req.userData.id;
      const {email, firstName, lastName, cityId, stateId, pinCode, address, mobileNumber, dateOfBirth, gender, 
      nomineeName, nomineeDateOfBirth, nomineeRelation} = req.body;
      let customerDetails = await models.customer.findOne({
        where: { id, isActive:true },
      });
      if (check.isEmpty(customerDetails)) {
        return res.status(404).json({ message: "Customer Does Not Exists" });
      }
      const customerUniqueId = customerDetails.customerUniqueId;
      const merchantData = await getMerchantData();
      const data = qs.stringify({
        'mobileNumber': mobileNumber,
        'emailId': email,
        'userName': firstName+" "+lastName,
        'userAddress': address,
        'userCity': cityId,
        'userState': stateId,
        'userPincode': pinCode,
        'dateOfBirth':dateOfBirth,
        'gender':gender,
        'nomineeName': nomineeName,
        'nomineeDateOfBirth':nomineeDateOfBirth,
        'nomineeRelation':nomineeRelation
      })
      await sequelize.transaction(async (t) => {
        await models.customer.update(
          { firstName, lastName, mobileNumber, email, pinCode,
             stateId: 1, cityId: 1,
            //  address, dateOfBirth, gender,
              isActive: true},
          { where:{id},transaction: t }
        );
      });
      const result = await models.axios({
          method: 'PUT',
          url: `${process.env.DIGITALGOLDAPI}/merchant/v1/users/${customerUniqueId}`,
          headers: { 
            'Content-Type': 'application/x-www-form-urlencoded', 
            'Accept': 'application/json', 
            'Authorization': `Bearer ${merchantData.accessToken}`, 
          },
          data: data
      });
      return res.status(200).json(result.data);
    }catch(err){
      let errorData = errorLogger(JSON.stringify(err), req.url, req.method, req.hostname, req.body);
  
      if (err.response) {
        return res.status(422).json(err.response.data);
      } else {
        console.log('Error', err.message);
      }
    };
  }