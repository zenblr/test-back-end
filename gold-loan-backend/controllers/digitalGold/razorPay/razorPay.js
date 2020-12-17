const qs = require('qs');
const uniqid = require('uniqid');
const models = require('../../../models');
const getMerchantData = require('../auth/getMerchantData');
const check = require('../../../lib/checkLib');
const getRazorPayDetails = require('../../../utils/razorpay');
const sequelize = models.sequelize;
const Sequelize = models.Sequelize;
const Op = Sequelize.Op;

exports.makePayment = async(req, res)=>{
  try{
    const id = req.userData.id;
    const {amount, paymentMode, metalType, quantity, lockPrice, blockId, quantityBased, modeOfPayment, orderType, cartData, shippingCharges, totalQuantity, totalWeight, orderAddress, userAddressId, }= req.body;
    console.log(req.body);
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
    let orderTypeDetail;
    if(orderType){
    orderTypeDetail = await models.digiGoldOrderType.findOne({where: {orderType}});
    }

    let razorPayOrder;
    let tempOrderDetail;

    await sequelize.transaction(async (t) => {
      let newAmmount = await amount* 100;
      let sendAmount = await Math.round(newAmmount);

      razorPayOrder = await razorPay.instance.orders.create(
        {amount:sendAmount, currency:"INR", payment_capture:1}
      );
      if(orderTypeDetail.id == 1){
        tempOrderDetail = await models.digiGoldTempOrderDetail.create({customerId: id, orderTypeId: orderTypeDetail.id, totalAmount: amount, metalType, quantity, lockPrice, blockId, amount, quantityBased, modeOfPayment: modeOfPayment, createdBy:1, modifiedBy: 1, razorpayOrderId: razorPayOrder.id}, { transaction: t });
      }
      if(orderTypeDetail.id == 3){

        let orderUniqueId = `dg_delivery${Math.floor(1000 + Math.random() * 9000)}`;

        tempOrderDetail = await models.digiGoldTempOrderDetail.create({customerId: id, orderTypeId: orderTypeDetail.id, totalAmount: amount,blockId: orderUniqueId, amount, modeOfPayment: modeOfPayment, createdBy:1, modifiedBy: 1, razorpayOrderId: razorPayOrder.id, deliveryShippingCharges: shippingCharges, deliveryTotalQuantity: totalQuantity, deliveryTotalWeight: totalWeight, userAddressId}, { transaction: t });

        if(orderAddress.length){
          for(let ele of orderAddress){
            await models.digiGoldTempOrderAddress.create({tempOrderDetailId: tempOrderDetail.id, customerName: ele.customerName, addressType: ele.addressType, address: ele.address, stateId: ele.stateId, cityId: ele.cityId, pinCode: ele.pinCode }, { transaction: t })
          }
        }

        if(cartData.length){
          for(let cart of cartData){
            await models.digiGoldTempOrderProductDetail.create({tempOrderDetailId: tempOrderDetail.id, productSku: cart.productSku, productWeight: cart.productWeight, productName: cart.productName, amount: cart.amount, productImage: cart.productImage, totalAmount: cart.totalProductAmount, metalType: cart.metalType, quantity: cart.quantity}, { transaction: t });
            }
        }
      }
    })

    return res.status(200).json({amount, razorPayOrder, razorPay:razorPay.razorPayConfig.key_id, tempOrderDetail});
  }catch(err) {
    console.log(err);
    if(err.statusCode == 400 && err.error.code){
      return res.status(400).json({message: err.error.description});
    }else{
      return res.status(400).json({err});
    }
  };
}
