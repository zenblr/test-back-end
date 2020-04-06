const models=require('../../models');

exports.addPartnerScheme=async(req,res)=>{
    const{schemeId,partnerId}=req.body;
    const addpartnerschemedata= await models.partner_schemes.create({
schemeId,partnerId });
    if(!addpartnerschemedata[0]){
        return res.status(422).json({message:'scheme  not created'});
    }
    return res.status(201).json({message:'scheme  created'})

}

//read Schemes

exports.readPartnerScheme=async(req,res)=>{
    
    const readpartnerschemedata=await models.partner_schemes.findAll({where:{isActive:true}});
    if(!readpartnerschemedata){
        return res.status(404).json({message:'data not found'});

    }
    return res.status(200).json({data:readpartnerschemedata});
}

//read Scheme by id

exports.readPartnerSchemeById=async(req,res)=>{
    
    const partnerschemeid=req.params.id;
    const readspartnerschemebyiddata=await models.partner_schemes.findOne({where:{id:partnerschemeid,isActive:true}});
    if(!readspartnerschemebyiddata)
    {
        return res.status(404).json({message:'data not found'});
    }
    return res.status(200).json({data:readspartnerschemebyiddata});
}


// update Scheme By id

exports.updatePartnerScheme=async(req,res)=>{
    const partnerschemeid=req.params.id;
    const{chemeId,partnerId}=req.body;
    const updatepartnerschemedata=await models.partner_schemes.update({chemeId,partnerId},{where:{id:partnerschemeid,isActive:true}});

    if(!updatepartnerschemedata[0]){
        return res.status(404).json({message:'data not found'});
    }
    return res.status(200).json({message:'Success'});    
}

// delete Scheme by id

exports.deactivePartnerScheme = async(req,res)=>{
    const partnerschemeid=req.params.id;
    
    const deactivepartnerschemedata = await models.partner_schemes.update({isActive:false},{where:{id:partnerschemeid,isActive:true}});

    if(!deactivepartnerschemedata[0]){
return res.status(404).json({message:'data not found'});
    }

    return res.status(200).json({messsage:'Success'});
} 