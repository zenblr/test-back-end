const models = require('../../models');
const getMerchantData = require('../auth/getMerchantData');
const check = require('../../../lib/checkLib');
const sequelize = models.sequelize;
let sms = require('../../utils/SMS');
const errorLogger = require('../../utils/errorLogger');
const { result } = require('lodash');

exports.changeWithdrawStatus = async (req, res) => {
    try {

        const { data, type } = req.body;

        if (type == "withdraw") {
            for (let ele of data) {

                let customer = await models.customer.findOne({
                    where: { customerUniqueId: ele.uniqueId },
                    attributes: ['id', 'customerUniqueId']
                });

                if (!check.isEmpty(customer)) {

                    const merchantData = await getMerchantData();
                    const result = await models.axios({
                        method: 'GET',
                        url: `${process.env.DIGITALGOLDAPI}/merchant/v1/withdraw/${ele.transactionId}/${customer.customerUniqueId}`,
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json',
                            'Authorization': `Bearer ${merchantData.accessToken}`,
                        },
                    });

                    const getCustomerWithdraw = result.data.result.data;

                    let orderData = await models.digiGoldOrderDetail.findOne({where: { transactionId: ele.transactionId }});
                    if(!orderData){
                        return res.status(400).json({ message: "Invaid Transaction Id" });
                    }

                    let sellWithdrawStatus = await sequelize.transaction(async (t) => {
                        await models.digiGoldOrderDetail.update({ orderStatus: ele.status }, { where: { id: orderData.id  }, transaction: t });

                        if (ele.status == 'completed') {
                            await sms.sendMessageForWithdrawCompleted(getCustomerWithdraw.mobileNumber, getCustomerWithdraw.amount);
                        } else if (ele.status == 'rejected') {
                            await sms.sendMessageForWithdrawReject(getCustomerWithdraw.mobileNumber);
                        } else if (ele.status == 'accepted') {
                            await sms.sendMessageForWithdrawAccept(getCustomerWithdraw.mobileNumber, getCustomerWithdraw.amount);
                        }
                    })

                }else{
                    return res.status(400).json({ message: "Invaid Customer Id" });
                }
            }
            return res.status(200).json({ message: "Success" });

        } else {

            return res.status(400).json({ message: "Invalid Type" });
        }
    }

    catch (err) {

        let errorData = errorLogger(JSON.stringify(err), req.url, req.method, req.hostname, req.body);

        if (err.response) {
            return res.status(400).json(err.response.data);
        } else {
            console.log('Error', err.message);
        }
    };
}

