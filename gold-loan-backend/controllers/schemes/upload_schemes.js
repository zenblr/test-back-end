const csv=require('csvtojson');
const models=require('../../models');
const sequelize=models.sequelize;


exports.uploadScheme=async(req,res,next)=>{
const csvFilePath = req.file.path;
const jsonArray = await csv().fromFile(csvFilePath);

// let checkIfCsvUploaded = await models.upload_scheme.findAll();
// if (checkIfCsvUploaded.length > 0) {
//     return res.status(404).json({ messgae: "scheme Csv is already Uploaded" })
// }
await sequelize.transaction(async t => {
    for (var i = 0; i < jsonArray.length; i++) {
        let data = await models.schemes.create({ schemeAmountStart: jsonArray[i].scheme_amount_start, schemeAmountEnd: jsonArray[i].scheme_amount_end,
            interestRateThirtyDaysMonthly:jsonArray[i].interest_rate_thirty_days_monthly,interestRateSixtyDaysMonthly:jsonArray[i].interest_rate_sixty_days_monthly,
            interestRateNinetyDaysMonthly:jsonArray[i].interest_rate_ninety_days_monthly,interestRateThirtyDaysAnnually:jsonArray[i].interest_rate_thirty_days_annually,
            interestRateSixtyDaysAnnually:jsonArray[i].interest_rate_sixty_days_annually,interestRateNinertyDaysAnnually:jsonArray[i].interest_rate_ninety_days_annually});
            for (let i = 0; i < partnerId.length; i++) {
                console.log(partnerId[i]);
        
                 var schemedata = await models.partner_schemes.create({
                    schemeId: addSchemeData.id,
                    partnerId: partnerId[i]
        
                }, { transaction: t })
            }
          
            
    }
}).then(() => {
    res.status(200).json({ message: "success" })

}).catch((exception) => {
   next(exception)
})

//     for (let i = 0; i < partnerId.length; i++) {
//         console.log(partnerId[i]);

//         var data = await models.partner_schemes.create({
//             schemeId: addSchemeData.id,
//             partnerId: partnerId[i]

//         }, { transaction: t })
//     }
//     console.log(data);
// }).then((addSchemeData) => {
//     return res.status(201).json({ messgae: "schemes created" })
// }).catch((exception) => {
//     next(exception)
// })
}

