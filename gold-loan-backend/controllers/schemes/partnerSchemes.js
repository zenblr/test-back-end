const models=require('../../models');

exports.addPartnerScheme=async(req,res, next)=>{
    const{schemeId,partnerId}=req.body;
    const addPartnersShemeData= await models.partner_schemes.create({
schemeId,partnerId });
    if(!addPartnersShemeData[0]){
        return res.status(422).json({message:'scheme  not created'});
    }
    return res.status(201).json({message:'scheme  created'})

}

//read Schemes

exports.readPartnerScheme=async(req,res, next)=>{
    
    const readPartnerSchemeData=await models.partner_schemes.findAll({where:{isActive:true}});
    if(!readPartnerSchemeData){
        return res.status(404).json({message:'data not found'});

    }
    return res.status(200).json({data:readPartnerSchemeData});
}

//read Scheme by id

exports.readPartnerSchemeById=async(req,res, next)=>{
    
    const partnerSchemeId=req.params.id;
    const readsPartnerSchemeByIdData=await models.partner_schemes.findOne({where:{id:partnerSchemeId,isActive:true}});
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
    const updatePartnerSchemeData=await models.partner_schemes.update({chemeId,partnerId},{where:{id:partnerSchemeId,isActive:true}});

    if(!updatePartnerSchemeData[0]){
        return res.status(404).json({message:'data not found'});
    }
    return res.status(200).json({message:'Success'});    
}

// delete Scheme by id

exports.deactivePartnerScheme = async(req,res, next)=>{
    const partnerSchemeId=req.params.id;
    
    const deactivePartnerSchemeData = await models.partner_schemes.update({isActive:false},{where:{id:partnerSchemeId,isActive:true}});

    if(!deactivePartnerSchemeData[0]){
return res.status(404).json({message:'data not found'});
    }

    return res.status(200).json({messsage:'Success'});
} 