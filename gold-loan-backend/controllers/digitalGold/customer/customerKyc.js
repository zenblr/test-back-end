const fs = require('fs');
const FormData = require('form-data');
const models = require('../../../models');
const getMerchantData = require('../auth/getMerchantData');
const check = require('../../../lib/checkLib');
const sequelize = models.sequelize;
let sms = require('../../../utils/SMS');
const errorLogger = require('../../../utils/errorLogger');

exports.addCustomerKycDetails = async(req, res)=>{
    try{
        const id = req.userData.id;
        const {panNumber, panAttachment, aadharNumber, aadharAttachment} = req.body;
        const merchantData = await getMerchantData();
        let customerDetails = await models.customer.findOne({
            where: { id, isActive:true },
        });
        const customerUniqueId = customerDetails.customerUniqueId;
        if (check.isEmpty(customerDetails)) {
            return res.status(404).json({ message: "Customer Does Not Exists" });
        }
        let base64Image
        if (/;base64/i.test(panAttachment)){
            base64Image = panAttachment.split(';base64,').pop();
        }else{
            const getAwsResp = await models.axios({
                method: 'GET',
                url: panAttachment,
                responseType: 'arraybuffer'
            });
            base64Image = Buffer.from(getAwsResp.data, 'binary').toString('base64');
        }
        const dir = 'public/uploads/digitalGoldKyc';
        if (!fs.existsSync(dir)){
            fs.mkdirSync(dir);
        }
        const panPath = `public/uploads/digitalGoldKyc/pan-${customerUniqueId}.jpeg`;
        fs.writeFileSync(panPath, base64Image, {encoding: 'base64'}); 
        const data = new FormData();
        data.append('panNumber', panNumber);
        data.append('panAttachment', fs.createReadStream(panPath));
        // if(aadharNumber.length!=0){
        //     data.append('aadharNumber',aadharNumber);
        //     data.append('aadharAttachment',fs.createReadStream(`public/uploads/digitalGoldKyc/${customerDetails.customerUniqueId}.jpeg`));
        // }

        let customerKycDetails = await models.digiGoldCustomerKyc.findOne({
            where: { customerId:id}
        });
        if (check.isEmpty(customerKycDetails)) {
            await sequelize.transaction(async (t) => {
                await models.digiGoldCustomerKyc.create(
                  { customerId:id,panNumber, panAttachment:null, aadharNumber, aadharAttachment,status:'pending'},
                  { transaction: t }
                );
            });
        }else{
            await sequelize.transaction(async (t) => {
                await models.digiGoldCustomerKyc.update(
                  { panNumber, panAttachment, aadharNumber, aadharAttachment,status:'pending'},
                  { where:{customerId:id},transaction: t }
                );
            });
        }
        const result = await models.axios({
            method: 'POST',
            url: `${process.env.DIGITALGOLDAPI}/merchant/v1/users/${customerUniqueId}/kyc`,
            headers: { 
                'Content-Type': 'application/json', 
                'Authorization': `Bearer ${merchantData.accessToken}`,
                ...data.getHeaders(),
            },
            data : data
        })
        if(result.data.statusCode === 200){
            fs.unlinkSync(panPath)
            await sms.sendMessageForKycUpdate(customerDetails.mobileNumber);
        }
        return res.status(200).json(result.data);
    }catch(err) {
    let errorData = errorLogger(JSON.stringify(err), req.url, req.method, req.hostname, req.body);

        if (err.response) {
        return res.status(422).json(err.response.data);
        } else {
        console.log('Error', err.message);
        }
    };
}

exports.getCustomerKycDetails = async(req, res)=>{
    try{
        const id = req.userData.id;
        let customerDetails = await models.customer.findOne({
        where: { id, isActive:true },
        });
        if (check.isEmpty(customerDetails)) {
            return res.status(404).json({ message: "Customer Does Not Exists" });
        }
        const customerUniqueId = customerDetails.customerUniqueId;
        let customerKycDetails = await models.digiGoldCustomerKyc.findOne({
            where: { customerId:id}
        });
        const merchantData = await getMerchantData();
        const result = await models.axios({
            method: 'GET',
            url: `${process.env.DIGITALGOLDAPI}/merchant/v1/users/${customerUniqueId}/kyc`,
            headers: { 
            'Content-Type': 'application/json', 
            'Accept': 'application/json', 
            'Authorization': `Bearer ${merchantData.accessToken}`, 
            },
        });
        result.data.result.data.panAttachmentPath = (customerKycDetails == null)? null: customerKycDetails.panAttachment;
        return res.status(200).json(result.data);
    }catch(err){
    let errorData = errorLogger(JSON.stringify(err), req.url, req.method, req.hostname, req.body);

        if (err.response) {
        return res.status(422).json(err.response.data);
        } else {
        console.log('Error', err.message);
        }
    };
}