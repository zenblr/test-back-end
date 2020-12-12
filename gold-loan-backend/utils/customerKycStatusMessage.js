const models = require('../models');
const getMerchantData = require('../controllers/digitalGold/auth/getMerchantData');
const sequelize = models.sequelize;
const sms = require('./SMS');
let { updateCompleteKycModule } = require('../service/customerKyc')

module.exports = async () => {
    // try{
    const merchantData = await getMerchantData();
    const customerKycDetails = await models.customer.findAll({
        where: {
            digiKycStatus: 'waiting',
            where: { isActive: true },
        }
    });
    if (customerKycDetails.length != 0) {
        await sequelize.transaction(async (t) => {
            for (let ele of customerKycDetails) {

                let { allModulePoint, kycCompletePoint } = await models.customer.findOne({ where: { id: ele.id }, transaction: t })

                const result = await models.axios({
                    method: 'GET',
                    url: `${process.env.DIGITALGOLDAPI}/merchant/v1/users/${ele.customerUniqueId}/kyc`,
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${merchantData.accessToken}`,
                    },
                });

                if (result.data.result.data.status == 'approved') {
                    //update complate kyc points
                    kycCompletePoint = await updateCompleteKycModule(kycCompletePoint, 4)

                    await models.customer.update({ kycCompletePoint, digiKycStatus: 'approved' }, { where: { id: ele.id }, transaction: t })
                    await sms.sendMessageForKycApproved(ele.mobileNumber, result.data.result.data.accountId);

                } else if (result.data.result.data.status == 'rejected') {

                    await models.customer.update({ digiKycStatus: 'rejected' }, { where: { id: ele.id }, transaction: t })
                    await sms.sendMessageForKycReject(ele.mobileNumber, result.data.result.data.accountId);

                }
            }
        })
    }

}

// module.exports = async () => {
//     // try{
//     const merchantData = await getMerchantData();
//     const customerKycDetails = await models.digiGoldCustomerKyc.findAll({
//         include: [
//             {
//                 model: models.customer,
//                 as: 'customerDetail',
//                 where: { isActive: true },
//                 attributes: ['id', 'customerUniqueId', 'mobileNumber']
//             }
//         ]
//     });

//     // let { allModulePoint, kycCompletePoint } = await models.customer.findOne({ where: { id: id }, transaction: t })

//     //update complate kyc points
//     // kycCompletePoint = await updateCompleteKycModule(kycCompletePoint, moduleId)

//     if (customerKycDetails.length != 0) {
//         for (let ele of customerKycDetails) {
//             const result = await models.axios({
//                 method: 'GET',
//                 url: `${process.env.DIGITALGOLDAPI}/merchant/v1/users/${ele.customerDetail.customerUniqueId}/kyc`,
//                 headers: {
//                     'Content-Type': 'application/json',
//                     'Accept': 'application/json',
//                     'Authorization': `Bearer ${merchantData.accessToken}`,
//                 },
//             });
//             await sequelize.transaction(async (t) => {
//                 await models.digiGoldCustomerKyc.update(
//                     { status: result.data.result.data.status },
//                     { where: { customerId: ele.customerDetail.id }, transaction: t }
//                 );
//             });
//             if (result.data.result.data.status == 'approved') {
//                 if (!ele.approvedMessageSent) {
//                     await sms.sendMessageForKycApproved(ele.customerDetail.mobileNumber, result.data.result.data.accountId);
//                     await sequelize.transaction(async (t) => {
//                         await models.digiGoldCustomerKyc.update(
//                             { approvedMessageSent: true },
//                             { where: { customerId: ele.customerDetail.id }, transaction: t }
//                         );
//                     });
//                 }
//             } else if (result.data.result.data.status == 'rejected') {
//                 if (!ele.rejectedMessageSent) {
//                     await sms.sendMessageForKycReject(ele.customerDetail.mobileNumber, result.data.result.data.accountId);
//                     await sequelize.transaction(async (t) => {
//                         await models.digiGoldCustomerKyc.update(
//                             { rejectedMessageSent: true },
//                             { where: { customerId: ele.customerDetail.id }, transaction: t }
//                         );
//                     });
//                 }
//             }
//         }
//     }
//     // }catch(err){
//     //     if (err.response) {
//     //     return res.status(422).json(err.response.data);
//     //     } else {
//     //     console.log('Error', err.message);
//     //     }
//     // };
// }