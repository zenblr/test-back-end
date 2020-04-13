const csv = require('csvtojson');
const models = require('../../models');
const sequelize = models.sequelize;

// upload schemes csv
exports.uploadScheme = async (req, res, next) => {

    await sequelize.transaction(async t => {
        const csvFilePath = req.file.path;
        const partnerId = req.body.partnerId.split(',');
        
        const jsonArray = await csv().fromFile(csvFilePath);
        // console.log(jsonArray)

        for (var i = 0; i < jsonArray.length; i++) {
            let addSchemeData = await models.schemes.create({
                schemeAmountStart: jsonArray[i].AmountStart, schemeAmountEnd: jsonArray[i].AmountEnd,
                interestRateThirtyDaysMonthly: jsonArray[i].InterestRateThirtyDaysMonthly, interestRateNinetyDaysMonthly: jsonArray[i].InterestRateNinetyDaysMonthly,
                interestRateOneHundredEightyDaysMonthly: jsonArray[i].InterestRateOneHundredEightyDaysMonthly, interestRateThirtyDaysAnnually: jsonArray[i].InterestRateThirtyDaysAnnually,
                interestRateNinetyDaysAnnually: jsonArray[i].InterestRateNinetyDaysAnnually, interestRateOneHundredEightyDaysAnnually: jsonArray[i].InterestRateOneHundredEightyDaysAnnually
            }, { transaction: t });
            for (let i = 0; i < partnerId.length; i++) {

                var schemedata = await models.partnerSchemes.create({
                    schemeId: addSchemeData.id,
                    partnerId: partnerId[i]

                }, { transaction: t })
            }
        }
    })
    res.status(201).json({ message: " Schemes Created" })



}

