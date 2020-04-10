const models=require('../../models');

exports.addPartnerScheme=async(req,res, next)=>{
    const{schemeId,partnerId}=req.body;
    const addPartnersShemeData= await models.partnerSchemes.create({
schemeId,partnerId });
    if(!addPartnersShemeData[0]){
        return res.status(422).json({message:'scheme  not created'});
    }
    return res.status(201).json({message:'scheme  created'})

}

//read Schemes

exports.readPartnerScheme=async(req,res, next)=>{
    
    const readPartnerSchemeData=await models.partnerSchemes.findAll({where:{isActive:true}});
    if(!readPartnerSchemeData){
        return res.status(404).json({message:'data not found'});

    }
    return res.status(200).json({data:readPartnerSchemeData});
}

//read Scheme by id

exports.readPartnerSchemeById=async(req,res, next)=>{
    
    const partnerSchemeId=req.params.id;
    const readsPartnerSchemeByIdData=await models.partnerSchemes.findOne({where:{id:partnerSchemeId,isActive:true}});
    if(!readsPartnerSchemeByIdData)
    {
        return res.status(404).json({message:'data not found'});
    }
    return res.status(200).json({data:readsPartnerSchemeByIdData});
}


// update Scheme By id

exports.updatePartnerScheme=async(req,res, next)=>{
    const partnerSchemeId=req.params.id;
    const{chemeId,partnerId}=req.body;
    const updatePartnerSchemeData=await models.partnerSchemes.update({chemeId,partnerId},{where:{id:partnerSchemeId,isActive:true}});

    if(!updatePartnerSchemeData[0]){
        return res.status(404).json({message:'data not found'});
    }
    return res.status(200).json({message:'Success'});    
}

// delete Scheme by id

exports.deactivePartnerScheme = async(req,res, next)=>{
    const partnerSchemeId=req.params.id;
    
    const deactivePartnerSchemeData = await models.partnerSchemes.update({isActive:false},{where:{id:partnerSchemeId,isActive:true}});

    if(!deactivePartnerSchemeData[0]){
return res.status(404).json({message:'data not found'});
    }

    return res.status(200).json({messsage:'Success'});
} 