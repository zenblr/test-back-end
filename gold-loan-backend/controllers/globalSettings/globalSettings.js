const models = require("../../models");
const sequelize = models.sequelize;

const Sequelize = models.Sequelize;
const Op = Sequelize.Op;

const CONSTANT = require("../../utils/constant");

const check = require("../../lib/checkLib");

exports.addGlobalSetting = async (req, res, next) => {

    let { ltvGoldValue, minimumLoanAmountAllowed, minimumTopUpAmount, gracePeriodDays, cashTransactionLimit, gst, scrapLtvGoldValue } = req.body;
    let createdBy = req.userData.id;
    let modifiedBy = req.userData.id;
    let modifiedTime = Date.now();

    let getGlobalSetting = await models.globalSetting.findAll();
    if (getGlobalSetting.length == 0) {
        await sequelize.transaction(async (t) => {
            let CreateGlobalSetting = await models.globalSetting.create({ ltvGoldValue, minimumLoanAmountAllowed, minimumTopUpAmount, gracePeriodDays, cashTransactionLimit, gst, scrapLtvGoldValue, createdBy, modifiedBy, modifiedTime }, { transaction: t });

            await models.globalSettingHistory.create({ ltvGoldValue, minimumLoanAmountAllowed, minimumTopUpAmount, gracePeriodDays, cashTransactionLimit, gst, scrapLtvGoldValue, modifiedBy, modifiedTime }, { transaction: t });
        });
        return res.status(200).json({ message: "Success" })
    } else {

        let id = getGlobalSetting[0].id;
        // let previousGoldRate = getGoldRate[0].goldRate
        await sequelize.transaction(async (t) => {
            let updateGlobalSetting = await models.globalSetting.update({ ltvGoldValue, minimumLoanAmountAllowed, minimumTopUpAmount, gracePeriodDays, cashTransactionLimit, gst, scrapLtvGoldValue, modifiedBy, modifiedTime }, { where: { id }, transaction: t });

            console.log(getGlobalSetting[0].ltvGoldValue);

            if (getGlobalSetting[0].ltvGoldValue == ltvGoldValue && getGlobalSetting[0].minimumLoanAmountAllowed == minimumLoanAmountAllowed && getGlobalSetting[0].minimumTopUpAmount == minimumTopUpAmount && getGlobalSetting[0].gracePeriodDays == gracePeriodDays && getGlobalSetting[0].cashTransactionLimit == cashTransactionLimit && getGlobalSetting[0].gst == gst, getGlobalSetting[0].scrapLtvGoldValue == scrapLtvGoldValue ) {

                return res.status(200).json({ message: 'Success' });

            } else {
                await models.globalSettingHistory.create({ ltvGoldValue, minimumLoanAmountAllowed, minimumTopUpAmount, gracePeriodDays, cashTransactionLimit, gst, scrapLtvGoldValue, modifiedBy, modifiedTime }, { transaction: t });
                return updateGlobalSetting
            }

        });
        return res.status(200).json({ message: 'Success' });
    }
}

exports.getGlobalSetting = async (req, res, next) => {
    let getGlobalSetting = await models.globalSetting.findAll({
     
    })
    if (getGlobalSetting.length == 0) {
        res.status(200).json({ getGlobalSetting: 0 });
    } else {
    res.status(200).json(getGlobalSetting[0]);
    }
}

exports.getGlobalSettingLog = async (req, res, next) => {
        let getGlobalSettingHistory = await models.globalSettingHistory.findAll({
       
        })
        if (!getGlobalSettingHistory) {
            res.status(404).json({ message: 'Data not found' });
        } else {
            res.status(200).json({ data: getGlobalSettingHistory });
        }

}
