const models = require("../../../models");
const sequelize = models.sequelize;

const Sequelize = models.Sequelize;
const Op = Sequelize.Op;

exports.addScrapGlobalSetting = async (req, res, next) => {
        let { ltvGoldValue, cashTransactionLimit, processingChargesFixed, processingChargesInPercent, gst, standardDeductionMin, standardDeductionMax } = req.body;
        let createdBy = req.userData.id;
        let modifiedBy = req.userData.id;
        let modifiedTime = Date.now();
    
        let getGlobalSetting = await models.scrapGlobalSetting.findAll();
        if (getGlobalSetting.length == 0) {
            await sequelize.transaction(async (t) => {
                let CreateGlobalSetting = await models.scrapGlobalSetting.create({ ltvGoldValue, cashTransactionLimit, processingChargesFixed, processingChargesInPercent, gst, standardDeductionMin, standardDeductionMax, createdBy, modifiedBy, modifiedTime }, { transaction: t });
    
                await models.scrapGlobalSettingHistory.create({ ltvGoldValue, cashTransactionLimit, processingChargesFixed, processingChargesInPercent, gst,standardDeductionMin, standardDeductionMax, modifiedBy, modifiedTime }, { transaction: t });
            });
            return res.status(200).json({ message: "Success" })
        } else {
    
            let id = getGlobalSetting[0].id;
            // let previousGoldRate = getGoldRate[0].goldRate
            await sequelize.transaction(async (t) => {
                let updateGlobalSetting = await models.scrapGlobalSetting.update({ ltvGoldValue, cashTransactionLimit, processingChargesFixed, processingChargesInPercent, gst, standardDeductionMin, standardDeductionMax, modifiedBy, modifiedTime }, { where: { id }, transaction: t });
    
                if (getGlobalSetting[0].ltvGoldValue == ltvGoldValue && getGlobalSetting[0].cashTransactionLimit == cashTransactionLimit && getGlobalSetting[0].processingChargesFixed == processingChargesFixed && getGlobalSetting[0].processingChargesInPercent == processingChargesInPercent && getGlobalSetting[0].gst == gst && getGlobalSetting[0].standardDeductionMin == standardDeductionMin && getGlobalSetting[0].standardDeductionMax == standardDeductionMax) {
    
                    return res.status(200).json({ message: 'Success' });
    
                } else {
                    await models.scrapGlobalSettingHistory.create({ ltvGoldValue, cashTransactionLimit, processingChargesFixed, processingChargesInPercent, gst,standardDeductionMin, standardDeductionMax, modifiedBy, modifiedTime }, { transaction: t });
                    return updateGlobalSetting
                }
    
            });
            return res.status(200).json({ message: 'Success' });
        }
}

exports.getScrapGlobalSetting = async (req, res, next) => {
    let getGlobalSetting = await models.scrapGlobalSetting.findAll({
     
    })
    if (getGlobalSetting.length == 0) {
        res.status(200).json({ getGlobalSetting: 0 });
    } else {
    res.status(200).json(getGlobalSetting[0]);
    }
}

exports.getScrapGlobalSettingLog = async (req, res, next) => {
        let getGlobalSettingHistory = await models.scrapGlobalSettingHistory.findAll({
       
        })
        if (!getGlobalSettingHistory) {
            res.status(404).json({ message: 'Data not found' });
        } else {
            res.status(200).json({ data: getGlobalSettingHistory });
        }

}
