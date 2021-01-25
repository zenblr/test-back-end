const models = require('../../../models');
const getMerchantData = require('../auth/getMerchantData');
const check = require('../../../lib/checkLib');
const errorLogger = require('../../../utils/errorLogger');

exports.getWithdrawDetailsWithTransId = async (req, res) => {
    try {
        const { transactionId } = req.params;
        const id = req.userData.id;
        let customerDetails = await models.customer.findOne({
            where: { id, isActive: true },
        });
        if (check.isEmpty(customerDetails)) {
            return res.status(404).json({ message: "Customer Does Not Exists" });
        }

        let orderSellData = await models.digiGoldOrderDetail.findOne({
            where: { transactionId },
            attributes: ['orderStatus', 'createdAt', 'orderId', 'modeOfPayment' ],
        });

        if (orderSellData.modeOfPayment == "augmontWallet") {
            let result = { data: { result: { data: orderSellData } } };
            result.data.result.data.status = orderSellData.dataValues.orderStatus;
            return res.status(200).json(result.data);
        }

        const customerUniqueId = customerDetails.customerUniqueId;
        const merchantData = await getMerchantData();
        const result = await models.axios({
            method: 'GET',
            url: `${process.env.DIGITALGOLDAPI}/merchant/v1/withdraw/${transactionId}/${customerUniqueId}`,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${merchantData.accessToken}`,
            },
        });
        return res.status(200).json(result.data);
    } catch (err) {
        let errorData = errorLogger(JSON.stringify(err), req.url, req.method, req.hostname, req.body);

        if (err.response) {
            return res.status(422).json(err.response.data);
        } else {
            console.log('Error', err.message);
        }
    };
}