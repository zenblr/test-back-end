const getMerchantData = require('../controllers/auth/getMerchantData');
const models = require('../models')
const qs = require('qs');

let postMerchantOrder = async (data) => {

    const merchantData = await getMerchantData();
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
        return { isSuccess: true, data: result.data }
    } else {
        return { isSuccess: false, err }
    }
}

let getUserData = async (customerUniqueId) => {

    const merchantData = await getMerchantData();
    const result = await models.axios({
        method: 'GET',
        url: `${process.env.DIGITALGOLDAPI}/merchant/v1/users/${customerUniqueId}`,
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${merchantData.accessToken}`,
        },
    });

    if (result.data.statusCode === 200) {
        return { isSuccess: true, data: result.data }
    } else {
        return { isSuccess: false, err }
    }
}

let postBuy = async (data) => {

    const merchantData = await getMerchantData();
    const result = await models.axios({
        method: 'POST',
        url: `${process.env.DIGITALGOLDAPI}/merchant/v1/buy`,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Bearer ${merchantData.accessToken}`,
        },
        data: qs.stringify(data)
    })

    if (result.data.statusCode === 200) {
        return { isSuccess: true, data: result.data }
    } else {
        return { isSuccess: false, err }
    }
}

let createCustomer = async (data) => {
    try {
        const result = await models.axios({
            method: 'POST',
            url: `${process.env.DIGITALGOLDAPI}/merchant/v1/users/`,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Bearer ${merchantData.accessToken}`,
            },
            data: data
        });

        if (result.data.statusCode === 201) {
            return { isSuccess: true, data: result }
        } else {
            return { isSuccess: false }
        }
    } catch (err) {
        console.log(err)
        return { isSuccess: false, message: err.message }
    }

}

let addBankDetailInAugmontDb = async (customerUniqueId, bankId, bankBranchName, accountNumber, accountHolderName, ifscCode) => {
    try{
        const merchantData = await getMerchantData();
        const data = qs.stringify({
            'bankId':bankId,
            'bankBranch':bankBranchName,
            'accountNumber':accountNumber,
            'accountName':accountHolderName,
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
        if (result.data.statusCode === 200) {
            return { isSuccess: true, data: result }
        } else {
            return { isSuccess: false }
        }
    }catch(err){
        console.log(err)
        return { isSuccess: false, message: err.message }
    }
    
}

let checkKycStatus = async(customerId) =>{

    let customerDetails = await models.customer.findOne({
        where: { id: customerId, isActive: true },
      });
      let customerKycStatus = false;
      if(customerDetails.digiKycStatus == "rejected"){
        customerKycStatus = true;
      }else{
        customerKycStatus = false;
      }
      return customerKycStatus;
}

module.exports = {
    postMerchantOrder: postMerchantOrder,
    getUserData: getUserData,
    postBuy: postBuy,
    createCustomer: createCustomer,
    addBankDetailInAugmontDb: addBankDetailInAugmontDb,
    checkKycStatus: checkKycStatus
}