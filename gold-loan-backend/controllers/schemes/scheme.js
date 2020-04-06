const models=require('../../models');

exports.addScheme=async(req,res)=>{
    const{schemeAmountStart,schemeAmountEnd,interestRateThirtyDaysMonthly,interestRateSixtyDaysMonthly,
        interestRateNinetyDaysMonthly,interestRateThirtyDaysAnnually,interestRateSixtyDaysAnnually,interestRateNinetyDaysAnnually}=req.body;
    const addschemedata= await models.schemes.create({
        schemeAmountStart,schemeAmountEnd,interestRateThirtyDaysMonthly,interestRateSixtyDaysMonthly,
        interestRateNinetyDaysMonthly,interestRateThirtyDaysAnnually,interestRateSixtyDaysAnnually,interestRateNinetyDaysAnnually
    });
    if(!addschemedata){
        return res.status(422).json({message:'scheme  not created'});
    }
    return res.status(201).json({message:'scheme  created'})

}

//read Schemes

exports.readScheme=async(req,res)=>{
    
    const readschemedata=await models.schemes.findAll({where:{isActive:true}});
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