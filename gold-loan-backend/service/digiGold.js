const getMerchantData = require('../controllers/auth/getMerchantData');
const models = require('../models')
let { createExternalApiLogger } = require('../service/externalApiLogger')
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
        let urlData = `${process.env.DIGITALGOLDAPI}/merchant/v1/users/`;
        await createExternalApiLogger("digi Gold", 1, null, urlData, null, JSON.stringify(err), "error");
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

let checkBuyLimit = async(id, totalAmount) =>{
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
  
      let newAndOldAmountTotal_ = Number(total) + Number(totalAmount);
      let newAndOldAmountTotal = newAndOldAmountTotal_.toFixed(2)
  
      if ((total > limit && customer.digiKycStatus == 'pending') || (newAndOldAmountTotal >= limit && customer.digiKycStatus == 'pending')) {
  
        const panNo = customer.panCardNumber
  
        if ((customer.panType == "pan" && customer.panCardNumber != '' && customer.panCardNumber != null) || customer.panType == "form60") {
  
          return ({ message: "Your KYC is pending for approval", success: false });
  
        } else {
  
          return ({ message: "Please complete your KYC to proceed further", success: false });
  
        }
  
      } else if (totalAmount > limit && customer.digiKycStatus == 'pending') {
  
  
  
  
        if ((customer.panType == "pan" && customer.panCardNumber != '' && customer.panCardNumber != null) || customer.panType == "form60") {
  
          return ({ message: "Your KYC is pending for approval", success: false });
  
        } else {
  
          return ({ message: "Please complete your KYC to proceed further", success: false });
  
        }
  
      } else if ((total > limit && customer.digiKycStatus == 'approved') || ((newAndOldAmountTotal >= limit && customer.digiKycStatus == 'approved'))) {
  
        return ({ message: "Your KYC is approved", success: true });
      } else if (totalAmount >= limit && customer.digiKycStatus == 'approved') {
  
        return ({ message: "Your KYC is approved", success: true });
      } else if (total < limit && (customer.digiKycStatus == 'approved' || customer.digiKycStatus == 'pending' || customer.digiKycStatus == 'waiting')) {
  
  
        if (totalAmount > limit) {
          if ((customer.panType == "pan" && customer.panCardNumber != '' && customer.panCardNumber != null) || customer.panType == "form60") {
  
            return ({ message: "Your KYC is pending for approval", success: false });
  
          } else {
  
            return ({ message: "Please complete your KYC to proceed further", success: false });
  
          }
        } else if (newAndOldAmountTotal >= limit) {
  
        //   return ({ message: "Please complete your KYC to proceed further", success: false });
          if ((customer.panType == "pan" && customer.panCardNumber != '' && customer.panCardNumber != null) || customer.panType == "form60") {
  
            return ({ message: "Your KYC is pending for approval", success: false });
  
          } else {
  
            return ({ message: "Please complete your KYC to proceed further", success: false });
  
          }
        } else {
  
          return ({ message: "No need of KYC", success: true });
        }
  
      } else if (total > limit || totalAmount > limit && customer.digiKycStatus == 'rejected') {
  
        return ({ message: "Your KYC approval is rejected", success: false });
      } else if (total < limit || totalAmount < limit && customer.digiKycStatus == 'rejected') {
  
  
        return ({ message: "Your KYC approval is rejected", success: false });
      } else if (total > limit && customer.digiKycStatus == 'waiting') {
  
        // if ((customer.panType == "pan" && customer.panCardNumber != '' && customer.panCardNumber != null) || customer.panType == "form60") {
  
        if ((customer.panType == "pan" && customer.panCardNumber != '' && customer.panCardNumber != null) || customer.panType == "form60") {
  
          return ({ message: "Your KYC is pending for approval", success: false });
          
        } else {
  
          return ({ message: "Please complete your KYC to proceed further", success: false });
  
        }
      } else if (totalAmount >= limit && customer.digiKycStatus == 'waiting') {
  
        if ((customer.panType == "pan" && customer.panCardNumber != '' && customer.panCardNumber != null) || customer.panType == "form60") {
  
  
          return ({ message: "Your KYC is pending for approval", success: false });
  
        } else {
  
          return ({ message: "Please complete your KYC to proceed further", success: false });
  
        }
      }
  
  
    } else {
  
      if (totalAmount >= limit && customer.digiKycStatus == 'approved') {
  
        return ({ message: "Your KYC is approved", success: true });
      } else if (totalAmount >= limit && customer.digiKycStatus == 'pending') {
        if ((customer.panType == "pan" && customer.panCardNumber != '' && customer.panCardNumber != null) || customer.panType == "form60") {
  
          return ({ message: "Your KYC is pending for approval", success: false });
        } else {
  
          return ({ message: "Please complete your KYC to proceed further", success: false });
        }
      } else if (totalAmount < limit && (customer.digiKycStatus == 'approved'
        || customer.digiKycStatus == 'pending' || customer.digiKycStatus == 'waiting')) {
  
        return ({ message: "No need of KYC", success: true });
  
      } else if (totalAmount > limit && customer.digiKycStatus == 'rejected') {
  
  
        return ({ message: "Your KYC approval is rejected", success: false });
      } else if (totalAmount < limit && customer.digiKycStatus == 'rejected') {
  
  
        return ({ message: "Your KYC approval is rejected", success: false });
      } else if (totalAmount >= limit && customer.digiKycStatus == 'waiting') {
  
        if ((customer.panType == "pan" && customer.panCardNumber != '' && customer.panCardNumber != null) || customer.panType == "form60") {
  
          return ({ message: "Your KYC is pending for approval", success: false });
  
        } else {
  
          return ({ message: "Please complete your KYC to proceed further", success: false });
  
        }
      }
  
    }
  }

module.exports = {
    postMerchantOrder: postMerchantOrder,
    getUserData: getUserData,
    postBuy: postBuy,
    createCustomer: createCustomer,
    addBankDetailInAugmontDb: addBankDetailInAugmontDb,
    checkKycStatus: checkKycStatus,
    checkBuyLimit:checkBuyLimit
}