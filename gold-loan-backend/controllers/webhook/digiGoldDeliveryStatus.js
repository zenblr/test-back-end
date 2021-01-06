const models = require('../../models');
const getMerchantData = require('../auth/getMerchantData');
const check = require('../../lib/checkLib');
const sequelize = models.sequelize;
let sms = require('../../utils/SMS');
const errorLogger = require('../../utils/errorLogger');
const { result } = require('lodash');

exports.changeOrderDeliveryStatus = async (req, res) => {
    try {
        const { data, type } = req.body;

        if (type == "order") {
            let merchantData = await getMerchantData();
            for (let ele of data) {
                let customer = await models.customer.findOne({
                    where: { customerUniqueId: ele.uniqueId },
                    attributes: ['id', 'customerUniqueId', 'mobileNumber', 'firstName', 'lastName'],
                });

              
             
                if (!check.isEmpty(customer)) {

                    const result = await models.axios({
                        method: 'GET',
                        url: `${process.env.DIGITALGOLDAPI}/merchant/v1/order/${ele.merchantTransactionId}/${ele.uniqueId}`,
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json',
                            'Authorization': `Bearer ${merchantData.accessToken}`,
                        },
                    });
    
                    const getCustomerOrderStatusData = result.data.result.data

                    let orderData = await models.digiGoldOrderDetail.findOne({where: { transactionId: ele.transactionId }});
                    if(!orderData){
                        return res.status(400).json({ message: "Invaid Transaction Id" });
                    }

                    const customerName = customer.firstName + ' ' + customer.lastName 
                    let orderStatus = await sequelize.transaction(async (t) => {

                        await models.digiGoldOrderDetail.update({ orderStatus: ele.status }, { where: { id: orderData.id  }, transaction: t });

                        if (ele.status == "delivered_to_client") {
                            await sms.sendMessageForDeliveredToClient(customer.mobileNumber,  ele.transactionId);
                        } else if (ele.status == "dispatched_but_not_delivered") {
                            await sms.sendMessageForDispatchedButNotDelivered(customer.mobileNumber, customerName, getCustomerOrderStatusData.awbNo, getCustomerOrderStatusData.logisticName, ele.transactionId);
                        } else if (ele.status == 're-dispatched') {
                            // await sms.sendMessageForReDispatched(customer.mobileNumber, customer.firstName, customer.lastName, getCustomerOrderStatusData.awbNo, getCustomerOrderStatusData.logisticName, ele.transactionId);
                        } else if (ele.status == 'rto') {
                            // await sms.sendMessageForRto(customer.mobileNumber, customer.firstName, customer.lastName, ele.transactionId);
                        }
                    })
                }else{
                    return res.status(400).json({ message: "Invaid Customer Id" });
                }
            }
            return res.status(200).json({ message: "Success" });
        } else {
            return res.status(400).json({ message: "Invaid Type" });
        }




    } catch (err) {
        console.log(err);
        let errorData = errorLogger(JSON.stringify(err), req.url, req.method, req.hostname, req.body);

        if (err.response) {
            return res.status(400).json(err.response.data);
        } else {
            console.log('Error', err.message);
        }
    };

}