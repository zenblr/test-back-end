const redis = require('redis');
const models = require('../models');
const getMerchantData = require('../controllers/auth/getMerchantData');
const redisConn = require('../config/redis');
const check = require('../lib/checkLib');
const redisClient = redis.createClient(redisConn.PORT, redisConn.HOST);

module.exports = async()=>{
  try{
    const merchantData = await getMerchantData();
    const getRates = await models.axios({
        method: 'GET',
        url: `${process.env.DIGITALGOLDAPI}/merchant/v1/rates`,
        headers: {
          'Content-Type': 'application/json', 
          'Accept': 'application/json', 
          'Authorization': `Bearer ${merchantData.accessToken}`, 
        },
    });
    const getRateDetails = getRates.data.result.data;
    redisClient.set('goldSilverRates',JSON.stringify(getRateDetails));
    getRateDetails.rates.blockId = getRateDetails.blockId;
    await models.digitalGoldSilverRate.create(getRateDetails.rates);
    
    return getRateDetails;
  }catch(err){
    if (err.response) {
      console.log(err.response.data);
    } else {
      console.log('Error', err.message);
    }
  };
}