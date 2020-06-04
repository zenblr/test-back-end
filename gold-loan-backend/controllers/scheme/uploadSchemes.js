const csv = require("csvtojson");
const models = require("../../models");
const sequelize = models.sequelize;
const _ = require('lodash')
const Sequelize = models.Sequelize;
const Op = Sequelize.Op;

// upload scheme csv
exports.uploadScheme = async (req, res, next) => {

    const csvFilePath = req.file.path;
    const partnerId = req.body.partnerId.split(',');
    const jsonArray = await csv().fromFile(csvFilePath);
    if (jsonArray.length == 0) { return res.status(400).json({ message: `Your file is empty.` }) }
    for (var i = 0; i < jsonArray.length; i++) {
        if (jsonArray[i].AmountStart >= jsonArray[i].AmountEnd) {
            return res.status(400).json({ message: `Your Scheme start amount is must be greater than your Scheme end amount` })
        }
        if (jsonArray[i].schemeName == '' || jsonArray[i].schemeName == undefined || jsonArray[i].schemeName == false) {
            return res.status(400).json({ message: `Scheme name is required` })
        }
    }
    let scheme = await jsonArray.map(value => { return value.schemeName.toLowerCase() })
    var repeatSchemeName = _.filter(scheme, (val, i, iteratee) => _.includes(iteratee, val, i + 1));
    if (repeatSchemeName.length > 0) {
        return res.status(400).json({ message: `In your csv file there scheme name is dublicate` })
    }

    var contain = await models.scheme.findAll({
        where: { schemeName: { [Op.in]: scheme } },
        include: [{
            model: models.partner,
            where: { id: partnerId[0] }
        }]
    })
    if (contain.length > 0) {
        let existSchemeName = await contain.map(value => { return value.schemeName })

        return res.status(400).json({ message: `${existSchemeName} this scheme is already exist` })
    }


    await sequelize.transaction(async t => {

        for (var i = 0; i < jsonArray.length; i++) {

            let addSchemeData = await models.scheme.create({
                schemeName: jsonArray[i].schemeName.toLowerCase(),schemeAmountStart: jsonArray[i].AmountStart, schemeAmountEnd: jsonArray[i].AmountEnd,
                interestRateThirtyDaysMonthly: jsonArray[i].InterestRateThirtyDaysMonthly, interestRateNinetyDaysMonthly: jsonArray[i].InterestRateNinetyDaysMonthly,
                interestRateOneHundredEightyDaysMonthly: jsonArray[i].InterestRateOneHundredEightyDaysMonthly
            }, { transaction: t });

                let  schemedata = await models.partnerScheme.create({
                    schemeId: addSchemeData.id,
                    partnerId: partnerId

                }, { transaction: t })
            }

    })
    return res.status(201).json({ message: " Schemes Created" })



}

