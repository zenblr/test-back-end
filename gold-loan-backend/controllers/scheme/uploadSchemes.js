const csv = require("csvtojson");
const models = require("../../models");
const sequelize = models.sequelize;

// upload scheme csv
exports.uploadScheme = async (req, res, next) => {

    const csvFilePath = req.file.path;
    const partnerId = req.body.partnerId.split(',');

    const jsonArray = await csv().fromFile(csvFilePath);
    if (jsonArray.length == 0) {
        return res.status(400).json({ message: `Your file is empty.` })
    }
    for (var i = 0; i < jsonArray.length; i++) {
        if (jsonArray[i].AmountStart >= jsonArray[i].AmountEnd) {
            return res.status(400).json({ message: `Your Scheme start amount is must be greater than your Scheme end amount` })
        }
    }
    await sequelize.transaction(async t => {

        for (var i = 0; i < jsonArray.length; i++) {

            let addSchemeData = await models.scheme.create({
                schemeAmountStart: jsonArray[i].AmountStart, schemeAmountEnd: jsonArray[i].AmountEnd,
                interestRateThirtyDaysMonthly: jsonArray[i].InterestRateThirtyDaysMonthly, interestRateNinetyDaysMonthly: jsonArray[i].InterestRateNinetyDaysMonthly,
                interestRateOneHundredEightyDaysMonthly: jsonArray[i].InterestRateOneHundredEightyDaysMonthly, interestRateThirtyDaysAnnually: jsonArray[i].InterestRateThirtyDaysAnnually,
                interestRateNinetyDaysAnnually: jsonArray[i].InterestRateNinetyDaysAnnually, interestRateOneHundredEightyDaysAnnually: jsonArray[i].InterestRateOneHundredEightyDaysAnnually
            }, { transaction: t });
            for (let i = 0; i < partnerId.length; i++) {

                var schemedata = await models.partnerScheme.create({
                    schemeId: addSchemeData.id,
                    partnerId: partnerId[i]

                }, { transaction: t })
            }
        }
    })
    return res.status(201).json({ message: " Schemes Created" })



}

