const qs = require('qs');
const models = require('../../../models');
const getMerchantData = require('../auth/getMerchantData');
const check = require('../../../lib/checkLib');
const errorLogger = require('../../../utils/errorLogger');

exports.createCustomerBankAccount = async(req, res)=>{
  try{
    const {bankId, branchName, accountNumber, accountName, ifscCode} = req.body;
    const id = req.userData.id;
    let customerDetails = await models.customer.findOne({
      where: { id, isActive:true },
    });
    if (check.isEmpty(customerDetails)) {
      return res.status(404).json({ message: "Customer Does Not Exists" });
    }
    const customerUniqueId = customerDetails.customerUniqueId;
    const merchantData = await getMerchantData();
    const data = qs.stringify({
        'bankId':bankId,
        'bankBranch':branchName,
        'accountNumber':accountNumber,
        'accountName':accountName,
        'ifscCode':ifscCode
    })
    const result = await models.axios({
        method: 'POST',
        url: `${process.env.DIGITALGOLDAPI}/merchant/v1/users/${customerUniqueId}/banks`,
        headers: { 
          'Content-Type': 'application/x-www-form-urlencoded', 
          'Authorization': `Bearer ${merchantData.accessToken}`,
        },
        data : data
    })
    return res.status(200).json(result.data);
  }catch(err) {
    let errorData = errorLogger(JSON.stringify(err), req.url, req.method, req.hostname, req.body);

    if (err.response) {
      return res.status(422).json(err.response.data);
    } else {
      console.log('Error', err.message);
    }
  };
}

exports.getCustomerBankDetails = async(req, res)=>{
  try{
    const id = req.userData.id;
    let customerDetails = await models.customer.findOne({
      where: { id, isActive:true },
    });
    if (check.isEmpty(customerDetails)) {
      return res.status(404).json({ message: "Customer Does Not Exists" });
    }
    const customerUniqueId = customerDetails.customerUniqueId;
    const merchantData = await getMerchantData();
    const result = await models.axios({
        method: 'GET',
        url: `${process.env.DIGITALGOLDAPI}/merchant/v1/users/${customerUniqueId}/banks`,
        headers: { 
          'Content-Type': 'application/json', 
          'Accept': 'application/json', 
          'Authorization': `Bearer ${merchantData.accessToken}`, 
        },
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

exports.updateCustomerBankDetails = async(req, res)=>{
  try{
    const id = req.userData.id;
    const {customerBankId} = req.params;
    const {bankId, branchName, accountNumber, accountName, ifscCode} = req.body;
    let customerDetails = await models.customer.findOne({
      where: { id, isActive:true },
    });
    if (check.isEmpty(customerDetails)) {
      return res.status(404).json({ message: "Customer Does Not Exists" });
    }
    const customerUniqueId = customerDetails.customerUniqueId;
    const merchantData = await getMerchantData();
    const data = qs.stringify({
      'bankId':bankId,
      'bankBranch':branchName,
      'accountNumber':accountNumber,
      'accountName':accountName,
      'ifscCode':ifscCode,
      'status':'active'
    });
    const result = await models.axios({
        method: 'PUT',
        url: `${process.env.DIGITALGOLDAPI}/merchant/v1/users/${customerUniqueId}/banks/${customerBankId}`,
        headers: { 
          'Content-Type': 'application/x-www-form-urlencoded', 
          'Authorization': `Bearer ${merchantData.accessToken}`, 
        },
        data : data
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

exports.deleteCustomerBankDetails = async(req, res)=>{
    try{
      const {customerBankId} = req.params;
      const id = req.userData.id;
      let customerDetails = await models.customer.findOne({
        where: { id, isActive:true },
      });
      if (check.isEmpty(customerDetails)) {
        return res.status(404).json({ message: "Customer Does Not Exists" });
      }
      const customerUniqueId = customerDetails.customerUniqueId;
      const merchantData = await getMerchantData();
      const result = await models.axios({
          method: 'DELETE',
          url: `${process.env.DIGITALGOLDAPI}/merchant/v1/users/${customerUniqueId}/banks/${customerBankId}`,
          headers: { 
            'Content-Type': 'application/json', 
            'Accept': 'application/json', 
            'Authorization': `Bearer ${merchantData.accessToken}`, 
          },
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