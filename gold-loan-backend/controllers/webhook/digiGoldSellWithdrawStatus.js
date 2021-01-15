const models = require('../../models');
const getMerchantData = require('../auth/getMerchantData');
const check = require('../../lib/checkLib');
const sequelize = models.sequelize;
let sms = require('../../utils/SMS');
const errorLogger = require('../../utils/errorLogger');
const { result } = require('lodash');

exports.changeWithdrawStatus = async (req, res) => {
    try {

        const { data, type } = req.body;
        if (req.data.scope == "withdraw") {
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

                        let orderData = await models.digiGoldOrderDetail.findOne({ where: { transactionId: ele.transactionId } });
                        if (!orderData) {
                            return res.status(400).json({ message: "Invaid Transaction Id" });
                        }

                        let sellWithdrawStatus = await sequelize.transaction(async (t) => {
                            await models.digiGoldOrderDetail.update({ orderStatus: ele.status }, { where: { id: orderData.id }, transaction: t });

                            if (ele.status == 'completed') {
                                await sms.sendMessageForWithdrawalPaymentCompleted(getCustomerWithdraw.mobileNumber, getCustomerWithdraw.amount);
                            } else if (ele.status == 'rejected') {

                                const currentBalcnce = await models.axios({
                                    method: 'GET',
                                    url: `${process.env.DIGITALGOLDAPI}/merchant/v1/users/${customer.customerUniqueId}/passbook`,
                                    headers: {
                                        'Content-Type': 'application/json',
                                        'Accept': 'application/json',
                                        'Authorization': `Bearer ${merchantData.accessToken}`,
                                    },
                                });

                                let customerMetalBalance = await models.digiGoldCustomerBalance.findOne({ where: { customerId: customer.id } });

                                if (orderData.metalType == "gold") {
                                    let updatesSellableGoldBal = orderData.quantity + customerMetalBalance.sellableGoldBalance
                                    let sellableGoldBalance = updatesSellableGoldBal.toFixed(4);
                                    await models.digiGoldCustomerBalance.update({ currentGoldBalance: currentBalcnce.data.result.data.goldGrms, sellableGoldBalance: Number(sellableGoldBalance) }, { where: { id: customerMetalBalance.id } })

                                } else if (orderData.metalType == "silver") {
                                    let updatedSellableSilverBal = orderData.quantity + customerMetalBalance.sellableSilverBalance
                                    let sellableSilverBalance = updatedSellableSilverBal.toFixed(4)
                                    await models.digiGoldCustomerBalance.update({ currentGoldBalance: currentBalcnce.data.result.data.silverGrms, sellableSilverBalance: Number(sellableSilverBalance) }, { where: { id: customerMetalBalance.id } });

                                }

                                await sms.sendMessageForWithdrawalRejected(getCustomerWithdraw.mobileNumber, getCustomerWithdraw.amount);
                            } else if (ele.status == 'accepted') {
                                // await sms.sendMessageForWithdrawAccept(getCustomerWithdraw.mobileNumber, getCustomerWithdraw.amount);
                            }
                        })

                    } else {
                        return res.status(400).json({ message: "Invaid Customer Id" });
                    }
                }
                return res.status(200).json({ message: "Success" });

            } else {

                return res.status(400).json({ message: "Invalid Type" });
            }
        } else {
            return res.status(401).json({ message: "auth failed" });
        }
    }


    catch (err) {
        console.log(err);
        let errorData = errorLogger(JSON.stringify(err), req.url, req.method, req.hostname, req.body);

        if (err.response) {
            return res.status(400).json(err.response.data);
        } else {
            console.log('Error', err.message);
        }
    };
}

