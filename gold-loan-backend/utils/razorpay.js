let Razorpay = require('razorpay');
const models = require('../models');


module.exports = async()=>{
    const getCredential = await models.loanRazorpayCredential.findOne({where:{isActive:true}});
    const razorPayConfig = {
        key_id: getCredential.keyId,
        key_secret: getCredential.keySecret
    }
    let instance = new Razorpay(razorPayConfig);
    return {instance, razorPayConfig}
}
