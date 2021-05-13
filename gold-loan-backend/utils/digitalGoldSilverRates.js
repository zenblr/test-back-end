const redis = require('redis');
const models = require('../models');
const getMerchantData = require('../controllers/auth/getMerchantData');
const redisConn = require('../config/redis');
const check = require('../lib/checkLib');
const redisClient = redis.createClient(redisConn.PORT, redisConn.HOST);
let { createExternalApiLogger } = require('../service/externalApiLogger')

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
    let urlData = `${process.env.DIGITALGOLDAPI}/merchant/v1/rates`;
    
    const getRateDetails = getRates.data.result.data;
    redisClient.set('goldSilverRates',JSON.stringify(getRateDetails));
    getRateDetails.rates.blockId = getRateDetails.blockId;
    await models.digitalGoldSilverRate.create(getRateDetails.rates);
    
    let externalApiLogger = await createExternalApiLogger("digi Gold", 1, null, urlData, null, JSON.stringify(getRates.data.result.data), "success");
    
    return getRateDetails;
  }catch(err){
    let urlData = `${process.env.DIGITALGOLDAPI}/merchant/v1/rates`;
    let externalApiLogger = await createExternalApiLogger("digi Gold", 1, null, urlData, null, JSON.stringify(err), "error");

    console.log(err);
    if (err.response && err.response.data) {
      console.log(err.response.data, "error");
      return err.response.data;
    } else {
      console.log('Error', err.message);
      return err.message;
    }
  };
}