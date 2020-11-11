const models = require('../models');
const getMerchantData = require('../controllers/digitalGold/auth/getMerchantData');
const sequelize = models.sequelize;
const sms = require('./SMS');

module.exports = async()=>{
    // try{
        const merchantData = await getMerchantData();
        const customerKycDetails = await models.digiGoldCustomerKyc.findAll({
            include:[
                {
                    model:models.customer,
                    as: 'customerDetail',
                    where: {isActive:true},
                    attributes:['id','customerUniqueId','mobileNumber']
                }
            ]
        });
        if (customerKycDetails.length != 0) {
            for(let ele of customerKycDetails){
                const result = await models.axios({
                    method: 'GET',
                    url: `${process.env.DIGITALGOLDAPI}/merchant/v1/users/${ele.customerDetail.customerUniqueId}/kyc`,
                    headers: { 
                    'Content-Type': 'application/json', 
                    'Accept': 'application/json', 
                    'Authorization': `Bearer ${merchantData.accessToken}`, 
                    },
                });
                await sequelize.transaction(async (t) => {
                    await models.digiGoldCustomerKyc.update(
                      {status:result.data.result.data.status},
                      {where:{customerId:ele.customerDetail.id},transaction: t }
                    );
                });
                if(result.data.result.data.status == 'approved'){
                    if(!ele.approvedMessageSent){
                        await sms.sendMessageForKycApproved(ele.customerDetail.mobileNumber, result.data.result.data.accountId);
                        await sequelize.transaction(async (t) => {
                            await models.digiGoldCustomerKyc.update(
                              {approvedMessageSent:true},
                              {where:{customerId:ele.customerDetail.id},transaction: t }
                            );
                        });
                    }
                }else if(result.data.result.data.status == 'rejected'){
                    if(!ele.rejectedMessageSent){
                        await sms.sendMessageForKycReject(ele.customerDetail.mobileNumber, result.data.result.data.accountId);
                        await sequelize.transaction(async (t) => {
                            await models.digiGoldCustomerKyc.update(
                              {rejectedMessageSent:true},
                              {where:{customerId:ele.customerDetail.id},transaction: t }
                            );
                        });
                    }
                }
            }
        }
    // }catch(err){
    //     if (err.response) {
    //     return res.status(422).json(err.response.data);
    //     } else {
    //     console.log('Error', err.message);
    //     }
    // };
}