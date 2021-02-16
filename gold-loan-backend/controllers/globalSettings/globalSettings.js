const models = require("../../models");
const sequelize = models.sequelize;

const Sequelize = models.Sequelize;
const Op = Sequelize.Op;

const CONSTANT = require("../../utils/constant");

const check = require("../../lib/checkLib");

exports.addGlobalSetting = async (req, res, next) => {

    let { ltvGoldValue, minimumLoanAmountAllowed, minimumTopUpAmount, gracePeriodDays, cashTransactionLimit, gst, partPaymentPercent, confidencePan, confidenceAadhar, confidenceName } = req.body;
    let createdBy = req.userData.id;
    let modifiedBy = req.userData.id;
    confidencePan = confidencePan / 100
    confidenceAadhar = confidenceAadhar / 100
    confidenceName = confidenceName / 100
    let modifiedTime = Date.now();

    let getGlobalSetting = await models.globalSetting.findAll();
    if (getGlobalSetting.length == 0) {
        await sequelize.transaction(async (t) => {
            let CreateGlobalSetting = await models.globalSetting.create({ ltvGoldValue, minimumLoanAmountAllowed, minimumTopUpAmount, gracePeriodDays, cashTransactionLimit, gst, partPaymentPercent, createdBy, modifiedBy, modifiedTime, confidencePan, confidenceAadhar, confidenceName }, { transaction: t });

            await models.globalSettingHistory.create({ ltvGoldValue, minimumLoanAmountAllowed, minimumTopUpAmount, gracePeriodDays, cashTransactionLimit, gst, modifiedBy, modifiedTime, confidencePan, confidenceAadhar, confidenceName }, { transaction: t });

            await models.karzaDetails.update({ confidenceVal1: confidencePan, confidenceVal2: confidenceAadhar, nameConfidence: confidenceName }, {
                where: {
                    isActive: true, env: process.env.KARZA_ENV || 'TEST'
                }, transaction: t
            })
        });
        return res.status(200).json({ message: "Success" })
    } else {

        let id = getGlobalSetting[0].id;
        // let previousGoldRate = getGoldRate[0].goldRate
        await sequelize.transaction(async (t) => {
            let updateGlobalSetting = await models.globalSetting.update({ ltvGoldValue, minimumLoanAmountAllowed, minimumTopUpAmount, gracePeriodDays, cashTransactionLimit, gst, partPaymentPercent, modifiedBy, modifiedTime, confidencePan, confidenceAadhar, confidenceName }, { where: { id }, transaction: t });
            await models.karzaDetails.update({ confidenceVal1: confidencePan, confidenceVal2: confidenceAadhar, nameConfidence: confidenceName }, {
                where: {
                    isActive: true, env: process.env.KARZA_ENV || 'TEST'
                }, transaction: t
            })
            console.log(getGlobalSetting[0].ltvGoldValue);

            if (getGlobalSetting[0].partPaymentPercent == partPaymentPercent && getGlobalSetting[0].ltvGoldValue == ltvGoldValue && getGlobalSetting[0].minimumLoanAmountAllowed == minimumLoanAmountAllowed && getGlobalSetting[0].minimumTopUpAmount == minimumTopUpAmount && getGlobalSetting[0].gracePeriodDays == gracePeriodDays && getGlobalSetting[0].cashTransactionLimit == cashTransactionLimit && getGlobalSetting[0].gst == gst
                && getGlobalSetting[0].confidencePan == confidencePan && getGlobalSetting[0].confidenceAadhar == confidenceAadhar && getGlobalSetting[0].confidenceName == confidenceName) {

                return res.status(200).json({ message: 'Success' });

            } else {
                await models.globalSettingHistory.create({ ltvGoldValue, minimumLoanAmountAllowed, minimumTopUpAmount, gracePeriodDays, cashTransactionLimit, gst, partPaymentPercent, modifiedBy, modifiedTime, confidencePan, confidenceAadhar, confidenceName }, { transaction: t });
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
