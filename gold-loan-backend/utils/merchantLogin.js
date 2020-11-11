const formData = require('form-data');
const redis = require('redis');
const moment = require('moment');
const models = require('../models');
const data = new formData();
const redisConn = require('../config/redis')
const check = require('../lib/checkLib');
const redisClient = redis.createClient(redisConn.PORT, redisConn.HOST);
const sequelize = models.sequelize;

module.exports = async ()=>{
        const getMerchantDetails = await models.merchant.findOne({
            where:{isActive:true, id: 1},
            include: {
                model: models.digiGoldMerchantDetails,
                as: 'digiGoldMerchantDetails',
            }
        });
    
        data.append('email',getMerchantDetails.digiGoldMerchantDetails.email);
        data.append('password',getMerchantDetails.digiGoldMerchantDetails.password);
    
        const res= await models.axios(
            {
                method:'POST',
                url:`${process.env.DIGITALGOLDAPI}/merchant/v1/auth/login`,
                data:data,
                headers:{
                    'Content-Type': 'application/json', 
                    'Accept': 'application/json', 
                    ...data.getHeaders()
                }
            }
        );
        const resData = res.data
        await models.digiGoldMerchantDetails.update({
            augmontMerchantId:resData.result.data.merchantId,
            accessToken:resData.result.data.accessToken,
            lastTokenUpdated:moment(),
            expiresAt:resData.result.data.expiresAt
        },{
            where:{email:getMerchantDetails.digiGoldMerchantDetails.email, isActive:true}
            }
        );
        const merchantData = {
            merchantId:resData.result.data.merchantId,
            accessToken:resData.result.data.accessToken,
            expiresAt:resData.result.data.expiresAt
        };
        redisClient.del('merchantData');
        redisClient.set('merchantData', JSON.stringify(merchantData));
        return merchantData;
    
}