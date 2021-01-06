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

module.exports = {
    postMerchantOrder: postMerchantOrder,
    getUserData: getUserData,
    postBuy: postBuy
}