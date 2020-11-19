const formData = require('form-data');
const redis = require('redis');
const moment = require('moment');
const models = require('../models');
const data = new formData();
const redisConn = require('../config/redis')
const check = require('../lib/checkLib');
const redisClient = redis.createClient(redisConn.PORT, redisConn.HOST);
const sequelize = models.sequelize;
const qs = require('qs');

module.exports = async ()=>{
        const getMerchantDetails = await models.digiGoldMerchantDetails.findOne({
            where:{isActive:true, merchantId: 1},
            // include: {
            //     model: models.digiGoldMerchantDetails,
            //     as: 'digiGoldMerchantDetails',
            // }
        });
        // data.append('email',getMerchantDetails.email);
        // data.append('password',getMerchantDetails.password);

        const data = qs.stringify({
            'email': getMerchantDetails.email,
            'password': getMerchantDetails.password
        })
    
        const res= await models.axios(
            {
                method:'POST',
                url:`${process.env.DIGITALGOLDAPI}/merchant/v1/auth/login`,
                headers:{
                    'Content-Type': 'application/x-www-form-urlencoded', 
                    'Accept': 'application/json',
                    // ...data.getHeaders()
                },
                data:data,
            }
        );
        const resData = res.data
        await models.digiGoldMerchantDetails.update({
            augmontMerchantId:resData.result.data.merchantId,
            accessToken:resData.result.data.accessToken,
            lastTokenUpdated:moment(),
            expiresAt:resData.result.data.expiresAt
        },{
            where:{email:getMerchantDetails.email, isActive:true}
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