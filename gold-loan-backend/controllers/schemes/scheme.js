const models = require('../../models');
const sequelize = models.sequelize;
const check = require('../../lib/checkLib');

// add schemes
exports.addScheme = async (req, res, next) => {
    const { schemeAmountStart, schemeAmountEnd, interestRateThirtyDaysMonthly, interestRateSixtyDaysMonthly,
        interestRateNinetyDaysMonthly, interestRateThirtyDaysAnnually, interestRateSixtyDaysAnnually, interestRateNinetyDaysAnnually, partnerId } = req.body;

    await sequelize.transaction(async t => {
        const addSchemeData = await models.schemes.create({
            schemeAmountStart, schemeAmountEnd, interestRateThirtyDaysMonthly, interestRateSixtyDaysMonthly,
            interestRateNinetyDaysMonthly, interestRateThirtyDaysAnnually, interestRateSixtyDaysAnnually, interestRateNinetyDaysAnnually
        });

        for (let i = 0; i < partnerId.length; i++) {
            console.log(partnerId[i]);

            var data = await models.partner_schemes.create({
                schemeId: addSchemeData.id,
                partnerId: partnerId[i]

            }, { transaction: t })
        }
        console.log(data);
    }).then((addSchemeData) => {
        return res.status(201).json({ messgae: "schemes created" })
    }).catch((exception) => {
        next(exception)
    })
}


//read Schemes

exports.readScheme = async (req, res, next) => {
    let readSchemeData = await models.schemes.findAll({
        include: [models.partner]
    })

    if (!readSchemeData[0]) {
        return res.status(404).json({ message: 'data not found' });

    }
    return res.status(200).json({ data: readSchemeData });
}

//read Scheme by id

exports.readSchemeById = async (req, res, next) => {

    const schemeId = req.params.id;
    const readSchemeByIdData = await models.schemes.findOne({ where: { id: schemeId, isActive: true } });
    if (!readSchemeByIdData) {
        return res.status(404).json({ message: 'data not found' });
    }
    return res.status(200).json({ data: readSchemeByIdData });
}


// update Scheme By id

exports.updateScheme = async (req, res, next) => {
    const schemeId = req.params.id;
    const { schemeAmountStart, schemeAmountEnd, interestRateThirtyDaysMonthly, interestRateSixtyDaysMonthly,
        interestRateNinetyDaysMonthly, interestRateThirtyDaysAnnually, interestRateSixtyDaysAnnually, interestRateNinetyDaysAnnually } = req.body;
    const updateSchemeData = await models.schemes.update({
        schemeAmountStart, schemeAmountEnd, interestRateThirtyDaysMonthly, interestRateSixtyDaysMonthly,
        interestRateNinetyDaysMonthly, interestRateThirtyDaysAnnually, interestRateSixtyDaysAnnually, interestRateNinetyDaysAnnually
    }, { where: { id: schemeId, isActive: true } });

    if (!updateSchemeData[0]) {
        return res.status(404).json({ message: 'data not found' });
    }
    return res.status(200).json({ message: 'Success' });
}

// delete Scheme by id

exports.deactiveScheme = async (req, res, next) => {
    const schemeId = req.params.id;

    const deactiveSchemeData = await models.schemes.update({ isActive: false }, { where: { id: schemeId, isActive: true } });

    if (!deactiveSchemeData[0]) {
        return res.status(404).json({ message: 'data not found' });
    }

    return res.status(200).json({ messsage: 'Success' });
} 