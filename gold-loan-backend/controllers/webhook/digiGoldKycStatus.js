const models = require('../../models');
// const getMerchantData = require('../auth/getMerchantData');
const sequelize = models.sequelize;
const sms = require('../../utils/SMS');
const check = require('../../lib/checkLib');
// const errorLogger = require('../../../utils/errorlogger');

exports.changeKycStatus = async (req, res) => {

    const { type } = req.body;
    let customerKycData = req.body.data
   
    if (req.data.scope == "kyc") {
        if (type == "kyc") {

            for (let ele of customerKycData) {
                if(!ele.uniqueId) 
                {
                    return res.status(400).json({ message: "uniqueId is required" }); 
                }

                if(!ele.status)
                {
                    return res.status(400).json({ message: "status is required" }); 
                }

                if(ele.status != 'approved' && ele.status != 'rejected')
                {
                    return res.status(400).json({ message: "Invalid status" }); 
                }

                let customer = await models.customer.findOne({
                    where: { customerUniqueId: ele.uniqueId },
                    attributes: ['id', 'customerUniqueId', 'mobileNumber']
                });

                if (!check.isEmpty(customer)) {

                    await sequelize.transaction(async (t) => {

                        if (ele.status == 'approved') {
                            await models.customer.update(
                                { digiKycStatus: ele.status, emiKycStatus: ele.status },
                                { where: { id: customer.id }, transaction: t }
                            );
                            await models.digiKycApplied.update({ status: ele.status }, { where: { customerId: customer.id }, transaction: t })

                            await sms.sendMessageAfterKycApproved(customer.mobileNumber, customer.customerUniqueId);

                        } else if (ele.status == 'rejected') {
                            await models.customer.update(
                                { digiKycStatus: ele.status, emiKycStatus: ele.status, scrapKycStatus: ele.status, kycStatus: ele.status },
                                { where: { id: customer.id }, transaction: t }
                            );

                            await models.digiKycApplied.update({ status: ele.status, reasonForDigiKyc: `rejected from webhook` }, { where: { customerId: customer.id }, transaction: t })
                            await sms.sendMessageForKycRejected(customer.mobileNumber, customer.customerUniqueId);
                        }
                    });
                } else {
                    return res.status(400).json({ message: "Invalid Customer Id" });
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