const models = require('../../models'); // importing models.
const Sequelize = models.Sequelize;
const sequelize = models.sequelize;
const Op = Sequelize.Op;
const check = require('../../lib/checkLib');

// add scheme
exports.addScheme = async (req, res, next) => {
    let { schemeName, schemeAmountStart, schemeAmountEnd, partnerId, processingChargeFixed, processingChargePercent, maximumPercentageAllowed, penalInterest, schemeType, isDefault, isTopUp, isSplitAtBeginning, schemeInterest } = req.body;
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
            schemeName, schemeAmountStart, schemeAmountEnd, processingChargeFixed, processingChargePercent, maximumPercentageAllowed, penalInterest, schemeType, default: isDefault, isTopup: isTopUp, isSplitAtBeginning
        }, { transaction: t });

        schemeInterest.forEach(element => {
            element['schemeId'] = addSchemeData.id
        });

        await models.schemeInterest.bulkCreate(schemeInterest, { returning: true, transaction: t });

        let readSchemeByPartner = await models.partner.findOne({
            where: { isActive: true, id: partnerId[0] },
            include: [{
                model: models.scheme,
                where: { isActive: true }
            }],
        });
        if (readSchemeByPartner) {
            let schemeArray = [];
            for (let scheme of readSchemeByPartner.schemes) {
                schemeArray.push(scheme.id);
            }
            if (isDefault == true) {
                await models.scheme.update({ default: false }, { where: { id: { [Op.in]: schemeArray } } });
            }

        }

        // for (let i = 0; i < partnerId.length; i++) {
        // console.log(partnerId[i]);
        let data = await models.partnerScheme.create({
            schemeId: addSchemeData.id,
            partnerId: partnerId[0]
        }, { transaction: t })
    })
    return res.status(201).json({ message: "scheme created" })

}

//read scheme

exports.readScheme = async (req, res, next) => {

    var { isActive } = req.query;
    let query = {};
    if (isActive) {
        query.isActive = isActive;

    } else {
        query = {}
    }
    let readSchemeData = await models.partner.findAll({
        where: { isActive: true },
        order: [
            ['id', 'asc'],
            [models.scheme, 'id', 'desc'],
            [models.scheme, models.schemeInterest, 'days', 'asc']

        ],
        include: [
            {
                model: models.scheme,
                required: true,
                where: query,
                include: [
                    {
                        model: models.schemeInterest,
                        as: 'schemeInterest'
                    }
                ]
            },
        ],
    })
    if (!readSchemeData[0]) {
        return res.status(200).json({ data: readSchemeData });

    }
    return res.status(200).json({ data: readSchemeData });
}

//read Scheme by id

exports.readSchemeById = async (req, res, next) => {

    const schemeId = req.params.id;
    const readSchemeByIdData = await models.scheme.findOne({
        where: { id: schemeId, isActive: true },
        order: [
            [models.scheme, models.schemeInterest, 'days', 'asc']
        ],
        include: [{
            model: models.schemeInterest,
            as: 'schemeInterest'
        }]
    });
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
            where: { isActive: true },
            include: [{
                model: models.schemeInterest,
                as: 'schemeInterest'
            }]
        }],
    })
    if (!readSchemeByPartner) {
        return res.status(200).json({ data: {} });
    }
    return res.status(200).json({ data: readSchemeByPartner });
}


//scheme Read based on amount

exports.readSchemeOnAmount = async (req, res, next) => {
    let { amount } = req.params;

    let partnerSecuredScheme = await models.partner.findAll({
        order: [
            [models.scheme, models.schemeInterest, 'days', 'asc']
        ],
        include: [{
            model: models.scheme,
            where: {
                isActive: true,
                schemeType: "secured",
                [Op.and]: {
                    schemeAmountStart: { [Op.lte]: amount },
                    schemeAmountEnd: { [Op.gte]: amount },
                },
            },
            include: [
                {
                    model: models.schemeInterest,
                    as: 'schemeInterest'
                }
            ]
        }]
    });

    if (!partnerSecuredScheme) {
        return res.status(200).json({ data: {} });
    }
    return res.status(200).json({ data: partnerSecuredScheme });

}

exports.readUnsecuredSchemeOnAmount = async (req, res, next) => {
    let { id, amount } = req.params;
    // let {amount}  = req.body;
    let partnerSecuredScheme = await models.partner.findOne({
        where: { id },
        order: [
            [models.scheme, models.schemeInterest, 'days', 'asc']
        ],
        include: [{
            model: models.scheme,
            where: {
                isActive: true,
                schemeType: "unsecured",
                [Op.and]: {
                    schemeAmountStart: { [Op.lte]: amount },
                    schemeAmountEnd: { [Op.gte]: amount },
                }
            },
            include: [
                {
                    model: models.schemeInterest,
                    as: 'schemeInterest'
                }
            ]
        }]
    });
    if (!partnerSecuredScheme) {
        return res.status(200).json({ data: {} });
    }
    return res.status(200).json({ data: partnerSecuredScheme });

}


// delete Scheme by id

exports.deactiveScheme = async (req, res, next) => {
    const { id, isActive } = req.query;

    let defaultSchemeCheck = await models.scheme.findOne({ where: { isActive: true, default: true, id: id } });
    if (!check.isEmpty(defaultSchemeCheck)) {
        return res.status(400).json({ message: "Please select one default scheme with respect to that partner." })
    }

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

exports.UpdateDefault = async (req, res, next) => {
    let { id } = req.params;
    let { partnerId } = req.body;

    let schemeDefault = await models.scheme.findOne({ where: { id: id } });

    if (schemeDefault.isActive == false) {
        return res.status(400).json({ message: "You can not set deactivate scheme as a default." })
    }

    let readSchemeByPartner = await models.partner.findOne({
        where: { isActive: true, id: partnerId },
        include: [{
            model: models.scheme,
            where: { isActive: true }
        }],
    });

    if (readSchemeByPartner) {
        let schemeArray = [];
        for (let scheme of readSchemeByPartner.schemes) {
            schemeArray.push(scheme.id);
        }
        let updateDefault = await models.scheme.update(
            { default: false }, { where: { id: { [Op.in]: schemeArray } }, });

        console.log(updateDefault);

        if (updateDefault) {
            await models.scheme.update(
                { default: true }, { where: { id } });
        }
    }

    return res.status(200).json({ message: 'Success' });

}


exports.checkSlab = async (req, res, next) => {
    let { partnerId, schemeId } = req.query

    let securedScheme = await models.scheme.findOne({
        where: { id: schemeId },
        attributes: ['id'],
        order: [
            [models.schemeInterest, 'days', 'asc']
        ],
        include: [{
            model: models.schemeInterest,
            as: 'schemeInterest',
            attributes: ['days', 'interestRate']
        }]
    })

    let unsecuredScheme = await models.partner.findOne({
        where: { id: partnerId },
        attributes: ['id'],
        order: [
            [models.scheme, 'id', 'asc'],
            [models.scheme, models.schemeInterest, 'days', 'asc']
        ],
        include: [
            {
                model: models.scheme,
                attributes: ['id', 'default'],
                where: { isActive: true, schemeType: 'unsecured' },
                include: [
                    {
                        model: models.schemeInterest,
                        as: 'schemeInterest',
                        attributes: ['days', 'interestRate']
                    }
                ]
            }
        ]
    })

    var defaultUnsecuredScheme = unsecuredScheme.schemes.filter(scheme => { return scheme.default })

    let unsecured = unsecuredScheme.schemes

    let defaultFind = await selectScheme(defaultUnsecuredScheme, securedScheme)

    let checkScheme = await selectScheme(unsecured, securedScheme)

    return res.status(200).json({ data: { securedScheme, defaultFind, checkScheme } })
}


async function selectScheme(unsecured, scheme) {
    let unsecuredArray = [];
    for (let i = 0; i < unsecured.length; i++) {
        let unsec = unsecured[i];
        let schemeInterest = unsec.schemeInterest;
        if (schemeInterest.length != scheme.schemeInterest.length) {
            continue;
        }
        let isMached = true;
        for (let j = 0; j < schemeInterest.length; j++) {
            let schemeIntUnSec = schemeInterest[j];
            let schemeInt = scheme.schemeInterest[j];

            if (schemeIntUnSec.days != schemeInt.days) {
                isMached = false;
                break;
            }
        }
        if (isMached) {
            unsecuredArray.push(unsec);
        }
    }
    return unsecuredArray
}