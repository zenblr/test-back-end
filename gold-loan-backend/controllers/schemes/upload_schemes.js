const csv=require('csvtojson');
const models=require('../../models');
const sequelize=models.sequelize;

// upload schemes csv
exports.uploadScheme=async(req,res,next)=>{

await sequelize.transaction(async t => {
    const csvFilePath = req.file.path;
    const partnerId=req.body.partnerId.split(',');
const jsonArray = await csv().fromFile(csvFilePath);

    for (var i = 0; i < jsonArray.length; i++) {
        let addSchemeData= await models.schemes.create({ schemeAmountStart: jsonArray[i].AmountStart, schemeAmountEnd: jsonArray[i].AmountEnd,
            interestRateThirtyDaysMonthly:jsonArray[i].InterestRateThirtyDaysMonthly,interestRateNinetyDaysMonthly:jsonArray[i].InterestRateNinetyDaysMonthly,
            interestRateOneHundredEightyDaysMonthly:jsonArray[i].InterestRateOneHundredEightyDaysMonthly,interestRateThirtyDaysAnnually:jsonArray[i].InterestRateThirtyDaysAnnually,
            interestRateNinetyDaysAnnually:jsonArray[i].InterestRateNinetyDaysAnnually,interestRateOneHundredEightyDaysAnnually:jsonArray[i].InterestRateOneHundredEightyDaysAnnually});
            for (let i = 0; i < partnerId.length; i++) {
                console.log(partnerId[i]);
        
                 var schemedata = await models.partner_schemes.create({
                    schemeId: addSchemeData.id,
                    partnerId: partnerId[i]
        
                }, { transaction: t })
            }
          
            
    }
}).then(() => {
    res.status(201).json({ message: " Schemes Created" })

}).catch((exception) => {
   next(exception)
})

}

