const models = require('../../../models');
const getMerchantData = require('../auth/getMerchantData');
const sequelize = models.sequelize;
let sms = require('../../../utils/SMS');
// const errorLogger = require('../../../utils/errorlogger');




exports.changeKycStatus = async (req, res) => {

    try {
        const { data, type } = req.body;
        let customerKycData = req.body.data

        if (type == "kyc") {
            let merchantData = await getMerchantData();
            for (let ele of customerKycData) {

                let customer = await models.customer.findOne({
                    where: { customerUniqueId: ele.uniqueId },
                    attributes: ['id', 'customerUniqueId', 'mobileNumber']

                });

                if (!check.isEmpty(customer)) {

                    const result = await models.axios({
                        method: 'GET',
                        url: `${process.env.DIGITALGOLDAPI}/merchant/v1/users/${customer.customerUniqueId}/kyc`,
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json',
                            'Authorization': `Bearer ${merchantData.accessToken}`,
                        },
                    });

                    await sequelize.transaction(async (t) => {
                        await models.digitalGoldCustomerKyc.update(
                            { status: ele.status },
                            { where: { customerId: customer.id }, transaction: t }

                        );
                    });

                    const getCustomerkycStatusData = result.data.result.data
                    await sequelize.transaction(async (t) => {
                    if (ele.status == 'approved') {
                        if (!customer.approvedMessageSent) {
                            await sms.sendMessageForKycApproved(customer.mobileNumber, getCustomerkycStatusData.accountId);
                          
                                await models.digitalGoldCustomerKyc.update(
                                    { approvedMessageSent: true },
                                    { where: { customerId: customer.id }, transaction: t }
                                );
                                await models.customer.update(
                                    { digiKycStatus: ele.status, emiKycStatus: ele.status},
                                    { where: { customerId: customer.id }, transaction: t }
                                );
                           
                        }
                    } else if (ele.status == 'rejected') {
                        await sms.sendMessageForKycReject(customer.mobileNumber, getCustomerkycStatusData.accountId);
                        if (!ele.rejectedMessageSent) {
                         
                                await models.digitalGoldCustomerKyc.update(
                                    { rejectedMessageSent: true },
                                    { where: { customerId: customer.id }, transaction: t }
                                );

                                await models.customer.update(
                                    { digiKycStatus: ele.status, emiKycStatus: ele.status},
                                    { where: { customerId: customer.id }, transaction: t }
                                );
     
                            
                        }
                    }
                });
                }
            }
            return res.status(200).json({ message: "Success" });
        } else {
            return res.status(400).json({ message: "Invalid Type" });
        }

    } catch (err) {

        // let errorData = errorLogger(JSON.stringify(err), req.url, req.method, req.hostname, req.body);
        console.log('Error', error);
        if (err.response) {
            return res.status(400).json(err.response.data);
        } else {
            console.log('Error', err.message);
        }
    };
}