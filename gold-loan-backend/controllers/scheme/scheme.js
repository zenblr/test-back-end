const models = require('../../models');
const sequelize = models.sequelize;

// add scheme
exports.addScheme = async (req, res, next) => {
    const { schemeAmountStart, schemeAmountEnd, interestRateThirtyDaysMonthly, interestRateNinetyDaysMonthly,
        interestRateOneHundredEightyDaysMonthly, interestRateThirtyDaysAnnually, interestRateNinetyDaysAnnually, interestRateOneHundredEightyDaysAnnually, partnerId } = req.body;

    if (schemeAmountStart >= schemeAmountEnd) {
        return res.status(400).json({ message: `Your Scheme start amount is must be greater than your Scheme end amount` })
    }

    await sequelize.transaction(async t => {
        const addSchemeData = await models.scheme.create({
            schemeAmountStart, schemeAmountEnd, interestRateThirtyDaysMonthly, interestRateNinetyDaysMonthly,
            interestRateOneHundredEightyDaysMonthly, interestRateThirtyDaysAnnually, interestRateNinetyDaysAnnually, interestRateOneHundredEightyDaysAnnually
        });

        for (let i = 0; i < partnerId.length; i++) {
            console.log(partnerId[i]);

            var data = await models.partnerScheme.create({
                schemeId: addSchemeData.id,
                partnerId: partnerId[i]

            }, { transaction: t })
        }
    })
    return res.status(201).json({ message: "scheme created" })

}


//read scheme

exports.readScheme = async (req, res, next) => {
    let readSchemeData = await models.partner.findAll({
        where: { isActive: true },
        include: [models.scheme],
    })

    if (!readSchemeData) {
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
        include: [models.scheme],
    })
    if (!readSchemeByPartner) {
        return res.status(404).json({ message: 'data not found' });
    }
    return res.status(200).json({ data: readSchemeByPartner });
}


// update Scheme By id

exports.updateScheme = async (req, res, next) => {
    const schemeId = req.params.id;
    const { schemeAmountStart, schemeAmountEnd, interestRateThirtyDaysMonthly, interestRateNinetyDaysMonthly,
        interestRateOneHundredEightyDaysMonthly, interestRateThirtyDaysAnnually, interestRateNinetyDaysAnnually, interestRateOneHundredEightyDaysAnnually } = req.body;

    if (schemeAmountStart >= schemeAmountEnd) {
        return res.status(400).json({ message: `Your Scheme start amount is must be greater than your Scheme end amount` })
    }

    const updateSchemeData = await models.scheme.update({
        schemeAmountStart, schemeAmountEnd, interestRateThirtyDaysMonthly, interestRateNinetyDaysMonthly,
        interestRateOneHundredEightyDaysMonthly, interestRateThirtyDaysAnnually, interestRateNinetyDaysAnnually, interestRateOneHundredEightyDaysAnnually
    }, { where: { id: schemeId, isActive: true } });

    if (!updateSchemeData[0]) {
        return res.status(404).json({ message: 'data not found' });
    }
    return res.status(200).json({ message: 'Success' });
}

// delete Scheme by id

exports.deactiveScheme = async (req, res, next) => {
    const schemeId = req.params.id;

    const deactiveSchemeData = await models.scheme.update({ isActive: false }, { where: { id: schemeId, isActive: true } });

    if (!deactiveSchemeData[0]) {
        return res.status(404).json({ message: 'data not found' });
    }

    return res.status(200).json({ message: 'Success' });
} 