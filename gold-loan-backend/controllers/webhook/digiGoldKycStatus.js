const models = require('../../models');
const sequelize = models.sequelize;
let sms = require('../../utils/SMS');
const check = require('../../lib/checkLib');

exports.changeKycStatus = async (req, res) => {

    const { data, type } = req.body;
    let customerKycData = req.body.data

    if (type == "kyc") {

        for (let ele of customerKycData) {
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

                        await sms.sendMessageAfterKycApproved(customer.mobileNumber, customer.customerUniqueId);

                    } else if (ele.status == 'rejected') {
                        await models.customer.update(
                            { digiKycStatus: ele.status, emiKycStatus: ele.status },
                            { where: { id: customer.id }, transaction: t }
                        );

                        await sms.sendMessageForKycRejected(customer.mobileNumber, customer.customerUniqueId);
                    }
                });
            }
        }
        return res.status(200).json({ message: "Success" });
    } else {
        return res.status(400).json({ message: "Invalid Type" });
    }


}