const redis = require('redis');
const models = require('../models');
const redisConn = require('../config/redis');
const getMerchantData = require('../controllers/digitalGold/auth/getMerchantData');
const redisClient = redis.createClient(redisConn.PORT, redisConn.HOST);


module.exports = ()=>{
    return new Promise((resolve,reject)=>{
        redisClient.get('productData',async (err, result)=>{
            if (err) {
                reject(err);
            }else if(result){
                productData = JSON.parse(result);
                resolve(productData)
            }else{
                const merchantData = await getMerchantData();
                const productResult = await models.axios({
                    method: 'GET',
                    url: `${process.env.DIGITALGOLDAPI}/merchant/v1/products?count=500`,
                    headers: { 
                        'Content-Type': 'application/json', 
                        'Accept': 'application/json', 
                        'Authorization': `Bearer ${merchantData.accessToken}`, 
                    },
                });
                redisClient.set('productData', JSON.stringify(productResult.data));
                resolve(productResult.data);
            }
        });
    })
}