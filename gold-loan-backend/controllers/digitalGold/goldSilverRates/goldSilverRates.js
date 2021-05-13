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
                let errorCheck = JSON.stringify(rate)
                console.log(rate, "error", errorCheck);

                if( errorCheck.includes("502 Bad Gateway")){
                    return res.status(503).send({ message:"Rates not found"});
                }
                else{
                    return res.status(200).send({message:"success",rate: rate});

                }
                // console.log(errorCheck, typeof errorCheck, typeof rate);
            }
        });
    }catch(err){
        console.log(err);
    }
   
}