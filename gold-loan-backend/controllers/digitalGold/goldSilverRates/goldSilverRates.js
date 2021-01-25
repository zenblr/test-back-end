const formData = require('form-data');
const redis = require('redis');
const models = require('../../../models');
const redisConn = require('../../../config/redis');
const getRates = require('../../../utils/digitalGoldSilverRates');

const redisClient = redis.createClient(redisConn.PORT, redisConn.HOST);

exports.getGoldSilverRate =async (req,res)=>{
    try{
        let rate;
        await redisClient.get('goldSilverRates',async (err, result)=>{
            if (err) {
                return res.send(err);
            }else if(result){
                rate = JSON.parse(result);
                return res.status(200).send({message:"success",rate});
            }else{
                rate = await getRates();
                return res.status(200).send({message:"success",rate});
            }
        });
    }catch(err){
        console.log(err);
    }
   
}