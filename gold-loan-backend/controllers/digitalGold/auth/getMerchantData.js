const formData = require('form-data');
const redis = require('redis');
const models = require('../../../models');
const redisConn = require('../../../config/redis');
const check = require('../../../lib/checkLib');
const merchantLogin = require('../../../utils/merchantLogin');
const redisClient = redis.createClient(redisConn.PORT, redisConn.HOST);

module.exports = ()=>{
    return new Promise((resolve,reject)=>{
        redisClient.get('merchantData',async (err, result)=>{
            if (err) {
                reject(err);
            }else if(result){
                merchantData = JSON.parse(result);
                resolve(merchantData)
            }else{
                const getMerchantDetails = await models.merchant.findOne({
                    where:{isActive:true, id: 1},
                    include: {
                        model: models.digiGoldMerchantDetails,
                        as: 'digiGoldMerchantDetails',
                    }
                });
                if(!check.isEmpty(getMerchantDetails.accessToken)){
                    merchantData = {
                        id: getMerchantDetails.id,
                        merchantId:getMerchantDetails.digiGoldMerchantDetails.augmontMerchantId,
                        accessToken:getMerchantDetails.digiGoldMerchantDetails.accessToken,
                        expiresAt:getMerchantDetails.digiGoldMerchantDetails.expiresAt
                    };
                    redisClient.set('merchantData', JSON.stringify(merchantData));
                    resolve(merchantData);
                }else{
                    merchantData = await merchantLogin();
                    resolve(merchantData);
                }
            }
        });
    })
}