const models=require('../../models');


//add partner
exports.AddPartner=async (req,res)=>{
    const {name,commission,isActive}=req.body;
    let partnerdata=await models.partner.create({name,commission,isActive});
    if(!partnerdata){
        return res.status(422).json({message:'Data is not created'});
    }
    return res.status(201).json({message:'data is created'});
}
//update partner

exports.UpdatePartner=async (req,res)=>{
    const id=req.params.id;
const{name,commission,isActive}=req.body;
    
    let data=await models.partner.update({name,commission,isActive},{where:{id,isActive:true}});
    if(!data[0]){return res.status(404).json({message:'Data not found'})}

    return res.status(200).json({message:'Success'});
}

//get partner

exports.ReadPartner=async (req,res)=>{
    
    let partnerdata=await models.partner.findAll({where:{isActive:true}});
    if(!partnerdata){
        return res.status(404).json({message:'Data not found'})
    }
    return res.status(200).json(partnerdata);
    
}
//get partner by id

exports.ReadPartnerById=async(req,res)=>{
    const id=req.params.id;
    let partnerdata=await models.partner.findOne({where:{id,isActive:true}});
if(!partnerdata){
    return res.status(404).json({message:'data not found'});
}
return res.status(200).json(partnerdata);
}

//delete partner by id 

exports.DeletePartner=async(req,res)=>{
    const id=req.params.id;
    let partnerdata=await  models.partner.update({ isActive:false },{ where: { id} });

    if(!partnerdata[0]){
        return res.status(404).json({message:'data not found'});
    }
    
    return res.status(200).json({message:'success'});
}