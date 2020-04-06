const models=require('../../models');
const sequelize=models.sequelize;
const check=require('../../lib/checkLib');


exports.addScheme=async(req,res)=>{
    const{schemeAmountStart,schemeAmountEnd,interestRateThirtyDaysMonthly,interestRateSixtyDaysMonthly,
        interestRateNinetyDaysMonthly,interestRateThirtyDaysAnnually,interestRateSixtyDaysAnnually,interestRateNinetyDaysAnnually,partnerId}=req.body;
   
    await sequelize.transaction(async t => {
        const addschemedata= await models.schemes.create({
            schemeAmountStart,schemeAmountEnd,interestRateThirtyDaysMonthly,interestRateSixtyDaysMonthly,
            interestRateNinetyDaysMonthly,interestRateThirtyDaysAnnually,interestRateSixtyDaysAnnually,interestRateNinetyDaysAnnually,partnerId
        });
        if (partnerId.length!==0) {
            for (let i = 0; i < partnerId.length; i++) {
                var data = await models.partner_schemes.create({
                    schemeId: addschemedata.id, 
                    partnerId: partnerId[i].partnerId,
                    
                }, { transaction: t })
            }
            console.log(data);
        }
    }).then((addschemedata) => {
        return res.status(201).json({ messgae: "schemes created" ,addschemedata})
    }).catch((exception) => {

        return res.status(500).json({
            message: "something went wrong",
            data: exception.message

        });
    // })
    // if(!addschemedata){
    //     return res.status(422).json({message:'scheme  not created'});
    // }
    // return res.status(201).json({message:'scheme  created'})

    })
}
    

//read Schemes

exports.readScheme=async(req,res)=>{

    // let user = await models.seames.findAll({
    //   
    // });
    // res.json(user)
    
    const readschemedata=await models.schemes.findAll({where:{isActive:true}},
      {  include : [{
                  model:models.partner,
                  as:'partner'
            }]});
    if(!readschemedata){
        return res.status(404).json({message:'data not found'});

    }
    return res.status(200).json({data:readschemedata});
}

//read Scheme by id

exports.readSchemeById=async(req,res)=>{
    
    const schemeid=req.params.id;
    const readschemebyiddata=await models.schemes.findOne({where:{id:schemeid,isActive:true}});
    if(!readschemebyiddata)
    {
        return res.status(404).json({message:'data not found'});
    }
    return res.status(200).json({data:readschemebyiddata});
}


// update Scheme By id

exports.updateScheme=async(req,res)=>{
    const schemeid=req.params.id;
    const{schemeAmountStart,schemeAmountEnd,interestRateThirtyDaysMonthly,interestRateSixtyDaysMonthly,
        interestRateNinetyDaysMonthly,interestRateThirtyDaysAnnually,interestRateSixtyDaysAnnually,interestRateNinetyDaysAnnually}=req.body;
    const updateschemedata=await models.schemes.update({schemeAmountStart,schemeAmountEnd,interestRateThirtyDaysMonthly,interestRateSixtyDaysMonthly,
        interestRateNinetyDaysMonthly,interestRateThirtyDaysAnnually,interestRateSixtyDaysAnnually,interestRateNinetyDaysAnnually},{where:{id:schemeid,isActive:true}});

    if(!updateschemedata[0]){
        return res.status(404).json({message:'data not found'});
    }
    return res.status(200).json({message:'Success'});    
}

// delete Scheme by id

exports.deactiveScheme = async(req,res)=>{
    const schemeid=req.params.id;
    
    const deactiveschemedata = await models.schemes.update({isActive:false},{where:{id:schemeid,isActive:true}});

    if(!deactiveschemedata[0]){
return res.status(404).json({message:'data not found'});
    }

    return res.status(200).json({messsage:'Success'});
} 