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
      let errorData = errorLogger(err, req.url, req.method, req.hostname, req.body);
  
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
      let errorData = errorLogger(err, req.url, req.method, req.hostname, req.body);
  
      if (err.response) {
        return res.status(422).json(err.response.data);
      } else {
        console.log('Error', err.message);
      }
    };
  }