const models = require('../../models');
const sequelize = models.sequelize;
const check = require('../../lib/checkLib');

// add scheme
exports.addScheme = async (req, res, next) => {
    const { schemeName, schemeAmountStart, schemeAmountEnd, interestRateThirtyDaysMonthly, interestRateNinetyDaysMonthly,
        interestRateOneHundredEightyDaysMonthly, interestRateThirtyDaysAnnually, interestRateNinetyDaysAnnually, interestRateOneHundredEightyDaysAnnually, partnerId } = req.body;
        let schemeNameExist = await models.scheme.findOne({ where: { schemeName } })

        if (!check.isEmpty(schemeNameExist)) {
            return res.status(404).json({ message: 'This Scheme Name is already Exist' });
        }
    if (schemeAmountStart >= schemeAmountEnd) {
        return res.status(400).json({ message: `Your Scheme start amount is must be greater than your Scheme end amount` })
    }

    await sequelize.transaction(async t => {
     
        const addSchemeData = await models.scheme.create({
            schemeName, schemeAmountStart, schemeAmountEnd, interestRateThirtyDaysMonthly, interestRateNinetyDaysMonthly,
            interestRateOneHundredEightyDaysMonthly, interestRateThirtyDaysAnnually, interestRateNinetyDaysAnnually, interestRateOneHundredEightyDaysAnnually
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
        return res.status(200).json({ data: [] });
    }
    return res.status(200).json({ data: readSchemeByPartner });
}


// delete Scheme by id

exports.deactiveScheme = async (req, res, next) => {
    const {id,isActive}=req.query;

    const deactiveSchemeData = await models.scheme.update({ isActive: isActive }, { where: { id } })

    if (!deactiveSchemeData[0]) {
        return res.status(404).json({ message: 'data not found' });
    }

    return res.status(200).json({ message: 'Success' });
} 

// filter scheme

exports.filterScheme= async(req,res,next)=>{
        var { isActive } = req.query;
        const query = {};
        if(isActive){
        query.isActive=isActive;
        }
        let schemeFilterData = await models.scheme.findAll({
          where: query,
          include:{
              model:models.partner
          }
        });
        if (!schemeFilterData[0]) {
          return res.status(404).json({ message: "data not found" });
        }
        return res.status(200).json({schemeFilterData });    
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

// exports.editScheme= async(req,res,next)=>{
//     let {partnerId,schemeId}=req.query;
//     const {schemeAmountStart, schemeAmountEnd, interestRateThirtyDaysMonthly, interestRateNinetyDaysMonthly,
//         interestRateOneHundredEightyDaysMonthly, interestRateThirtyDaysAnnually, interestRateNinetyDaysAnnually, interestRateOneHundredEightyDaysAnnually}=req.body;
//         await sequelize.transaction(async t => {

//      let schemePartner= await models.partnerScheme.findOne({where:{partnerId,schemeId}});
//      if(schemePartner){

//      let editScheme=await models.scheme.update({schemeAmountStart, schemeAmountEnd, interestRateThirtyDaysMonthly, interestRateNinetyDaysMonthly,
//         interestRateOneHundredEightyDaysMonthly, interestRateThirtyDaysAnnually, interestRateNinetyDaysAnnually, interestRateOneHundredEightyDaysAnnually},{where:{id:schemeId}})
// return res.status(200).json({message:'updated'}),{transaction:t}
// }})
// return res.status(404).json({message:'updated failed'});
// }