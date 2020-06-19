const models = require('../../models'); // importing models.
const Sequelize = models.Sequelize;
const sequelize = models.sequelize;
const Op = Sequelize.Op;
const check = require('../../lib/checkLib');

// add scheme
exports.addScheme = async (req, res, next) => {
    let { schemeName, schemeAmountStart, schemeAmountEnd, interestRateThirtyDaysMonthly, interestRateNinetyDaysMonthly,
        interestRateOneHundredEightyDaysMonthly, partnerId } = req.body;
    schemeName = schemeName.toLowerCase();
    let schemeNameExist = await models.scheme.findOne({
        where: { schemeName },
        include: [{
            model: models.partner,
            where: { id: partnerId[0] }
        }]
    })

    if (!check.isEmpty(schemeNameExist)) {
        return res.status(404).json({ message: 'This Scheme Name is already Exist' });
    }
    if (schemeAmountStart >= schemeAmountEnd) {
        return res.status(400).json({ message: `Your Scheme start amount is must be greater than your Scheme end amount` })
    }

    await sequelize.transaction(async t => {

        const addSchemeData = await models.scheme.create({
            schemeName, schemeAmountStart, schemeAmountEnd, interestRateThirtyDaysMonthly, interestRateNinetyDaysMonthly,
            interestRateOneHundredEightyDaysMonthly
        });

        // for (let i = 0; i < partnerId.length; i++) {
        // console.log(partnerId[i]);

        let data = await models.partnerScheme.create({
            schemeId: addSchemeData.id,
            partnerId: partnerId

        }, { transaction: t })
    })
    return res.status(201).json({ message: "scheme created" })

}

//read scheme

exports.readScheme = async (req, res, next) => {
    let readSchemeData = await models.partner.findAll({
        where: { isActive: true },
        include: [
            {
                model: models.scheme,
                where: { isActive: true }
            },
        ],
    })

    if (!readSchemeData[0]) {
        return res.status(404).json({ message: 'data not found' });

    }
    return res.status(200).json({ data: readSchemeData });
}

//read Scheme by id

exports.readSchemeById = async (req, res, next) => {

    const schemeId = req.params.id;
    const readSchemeByIdData = await models.scheme.findOne({ where: { id: schemeId, isActive: true } });
    if (!readSchemeByIdData) {
        return res.status(404).json({ message: 'data not found' });
    }
    return res.status(200).json({ data: readSchemeByIdData });
}

//read schema by partnerId

exports.readSchemeByPartnerId = async (req, res, next) => {

    const partnerId = req.params.id;

    let readSchemeByPartner = await models.partner.findOne({
        where: { isActive: true, id: partnerId },
        include: [{
            model: models.scheme,
            where: { isActive: true }
        }],
    })
    if (!readSchemeByPartner) {
        return res.status(200).json({ data: {} });
    }
    return res.status(200).json({ data: readSchemeByPartner });
}


//scheme Read based on amount

exports.readSchemeOnAmount = async (req, res, next) => {
    let { amount } = req.params

    let partnerScheme = await models.partner.findAll({
        include: [{
            model: models.scheme,
            where: {
                [Op.and]: {
                    schemeAmountStart: { [Op.lte]: amount },
                    // schemeAmountEnd: { [Op.gte]: amount },
                }
            }
        }]
    })
    if (!partnerScheme) {
        return res.status(200).json({ data: {} });
    }
    return res.status(200).json({ data: partnerScheme });
}


// delete Scheme by id

exports.deactiveScheme = async (req, res, next) => {
    const { id, isActive } = req.query;

    const deactiveSchemeData = await models.scheme.update({ isActive: isActive }, { where: { id } })

    if (!deactiveSchemeData[0]) {
        return res.status(404).json({ message: 'data not found' });
    }

    return res.status(200).json({ message: 'Success' });
}

// filter scheme

exports.filterScheme = async (req, res, next) => {
    var { isActive } = req.query;
    const query = {};
    if (isActive) {
        query.isActive = isActive;
    }
    let schemeFilterData = await models.scheme.findAll({
        where: query,
        include: {
            model: models.partner
        }
    });
    if (!schemeFilterData[0]) {
        return res.status(404).json({ message: "data not found" });
    }
    return res.status(200).json({ schemeFilterData });
}

// update Scheme By id

// exports.updateScheme = async (req, res, next) => {
//     const schemeId = req.params.id;
//     const {schemeName,schemeAmountStart, schemeAmountEnd, interestRateThirtyDaysMonthly, interestRateNinetyDaysMonthly,
//         interestRateOneHundredEightyDaysMonthly, interestRateThirtyDaysAnnually, interestRateNinetyDaysAnnually, interestRateOneHundredEightyDaysAnnually } = req.body;

//     if (schemeAmountStart >= schemeAmountEnd) {
//         return res.status(400).json({ message: `Your Scheme start amount is must be greater than your Scheme end amount` })
//     }
//     let schemeNameExist = await models.scheme.findOne({ where: { schemeName } });

//     if (!check.isEmpty(schemeNameExist)) {
//         return res.status(404).json({ message: 'This Scheme Name is already Exist' });
//     }
//     const updateSchemeData = await models.scheme.update({
//        schemeName, schemeAmountStart, schemeAmountEnd, interestRateThirtyDaysMonthly, interestRateNinetyDaysMonthly,
//         interestRateOneHundredEightyDaysMonthly, interestRateThirtyDaysAnnually, interestRateNinetyDaysAnnually, interestRateOneHundredEightyDaysAnnually
//     }, { where: { id: schemeId, isActive: true } });

//     if (!updateSchemeData[0]) {
//         return res.status(404).json({ message: 'data not found' });
//     }
//     return res.status(200).json({ message: 'Success' });
// }

//edit scheme

