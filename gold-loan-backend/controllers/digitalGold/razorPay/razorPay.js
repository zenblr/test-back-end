const qs = require('qs');
const uniqid = require('uniqid');
const models = require('../../../models');
const getMerchantData = require('../auth/getMerchantData');
const check = require('../../../lib/checkLib');
const getRazorPayDetails = require('../../../utils/razorpay');

exports.makePayment = async(req, res)=>{
  try{
    const id = req.userData.id;
    const {amount, paymentMode, metalType, quantity, lockPrice, blockId, quantityBased, modeOfPayment}= req.body;
    const razorPay = await getRazorPayDetails();
    let customerDetails = await models.customer.findOne({
      where: { id, isActive:true },
    });
    if (check.isEmpty(customerDetails)) {
      return res.status(404).json({ message: "Customer Does Not Exists" });
    };
    // const tempOrderCreated = await models.tempOrder.create({amount,customerId:id})
    // const transactionId = uniqid(customerDetails.id);
    // await models.tempOrder.update({orderId:orderId},{where:{id:tempOrderCreated.id}});
    let razorPayOrder;
    await sequelize.transaction(async (t) => {
      let newAmmount = await amount* 100;
      let sendAmount = await Math.round(newAmmount);

      razorPayOrder = await razorPay.instance.orders.create(
        {amount:sendAmount, currency:"INR", payment_capture:1}
      );

      await models.digiGoldTempOrderDetail.create({customerId: id, orderTypeId: 1, totalAmount: amount, coupanCode, metalType, quantity, lockPrice, blockId, amount, quantityBased, modeOfPayment: paymentMode, createdBy:1, modifiedBy: 1, razorpayOrderId: razorPayOrder.id});
    })

    return res.status(200).json({amount, razorPayOrder, razorPay:razorPay.razorPayConfig.key_id});
  }catch(err) {
    if(err.statusCode == 400 && err.error.code){
      return res.status(400).json({message: err.error.description});
    }else{
      return res.status(400).json({err});
    }
  };
}
