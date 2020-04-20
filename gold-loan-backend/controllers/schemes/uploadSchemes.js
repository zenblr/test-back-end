const csv = require("csvtojson");
const models = require("../../models");
const sequelize = models.sequelize;
const csvValidators = require("csv-file-validator");

// upload schemes csv
exports.uploadScheme = async (req, res, next) => {
  await sequelize.transaction(async (t) => {
    const csvFilePath = req.file.path;
    const partnerId = req.body.partnerId.split(",");

    const jsonArray = await csv().fromFile(csvFilePath);

    if (jsonArray.length != 0) {
      for (var i = 0; i < jsonArray.length; i++) {
        console.log(jsonArray.length);
        if (jsonArray[i].AmountStart < jsonArray[i].AmountEnd) {
          let addSchemeData = await models.schemes.create(
            {
              schemeAmountStart: jsonArray[i].AmountStart,
              schemeAmountEnd: jsonArray[i].AmountEnd,
              interestRateThirtyDaysMonthly:
                jsonArray[i].InterestRateThirtyDaysMonthly,
              interestRateNinetyDaysMonthly:
                jsonArray[i].InterestRateNinetyDaysMonthly,
              interestRateOneHundredEightyDaysMonthly:
                jsonArray[i].InterestRateOneHundredEightyDaysMonthly,
              interestRateThirtyDaysAnnually:
                jsonArray[i].InterestRateThirtyDaysAnnually,
              interestRateNinetyDaysAnnually:
                jsonArray[i].InterestRateNinetyDaysAnnually,
              interestRateOneHundredEightyDaysAnnually:
                jsonArray[i].InterestRateOneHundredEightyDaysAnnually,
            },
            { transaction: t }
          );
          for (let i = 0; i < partnerId.length; i++) {
            var schemedata = await models.partnerSchemes.create(
              {
                schemeId: addSchemeData.id,
                partnerId: partnerId[i],
              },
              { transaction: t }
            );
          }
          return res.status(201).json({ message: " Schemes Created" });
        } else {
          res
            .status(400)
            .json({ message: "start amount  should be less than end amount" });
        }
      }
    } else {
      res.status(422).json({ message: "scheme is not created" });
    }
  });
};
