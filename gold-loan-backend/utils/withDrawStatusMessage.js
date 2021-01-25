const models = require('../models');
const getMerchantData = require('../controllers/digitalGold/auth/getMerchantData');
const sequelize = models.sequelize;
const sms = require('./SMS');
const moment = require('moment');

module.exports = async()=>{
    try{
        const merchantData = await getMerchantData();
        const currentHour = moment().utcOffset("+05:30").unix();
        const previousHour = moment().utcOffset("+05:30").subtract(30,'minutes').unix();
        const result = await models.axios({
            method: 'GET',
            url: `${process.env.DIGITALGOLDAPI}/merchant/v1/withdraw?statusDateFrom=${previousHour}&statusDateTo=${currentHour}&count=250`,
            headers: { 
            'Content-Type': 'application/json', 
            'Accept': 'application/json', 
            'Authorization': `Bearer ${merchantData.accessToken}`,
            },
        });
        const getCustomerWithdraw = result.data.result.data;
        for(let ele of getCustomerWithdraw){
            if(ele.status == 'completed'){
                await sms.sendMessageForWithdrawCompleted(ele.mobileNumber,ele.amount);
            }else if(ele.status == 'rejected'){
                await sms.sendMessageForWithdrawReject(ele.mobileNumber);
            }else if(ele.status == 'accepted'){
                await sms.sendMessageForWithdrawAccept(ele.mobileNumber,ele.amount);
            }
        }
    }catch(err){
        if (err.response) {
            console.log(err.response.data);
        } else {
            console.log('Error', err.message);
        }
    };
}