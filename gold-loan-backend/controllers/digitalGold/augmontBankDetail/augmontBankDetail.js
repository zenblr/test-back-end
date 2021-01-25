const models = require('../../../models');
const getMerchantData = require('../auth/getMerchantData');
const pagination = require('../../../utils/pagination');
const errorLogger = require('../../../utils/errorLogger');

exports.augmontBankDetails = async (req, res) => {
        let bankdetails = await models.digiGoldAugmontBankDetails.findOne({
            where: { isActive: true },
        });
        if (bankdetails) {
            return res.status(200).json(bankdetails);
        } else {
            return res.status(404).json({ message: "Data not found" });
        }
    
}