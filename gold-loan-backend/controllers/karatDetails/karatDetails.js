const models=require('../../models');

// add karat details
exports.addKaratDetails=async(req,res)=>{
    const {karat,dedeductionBasedOnPurity,percentage,}=req.body;
    let createdBy=req.userData.id;
    let modifiedBy=req.userData.id;
    let addKaratDetails = await models.karatDetails.create({ karat,dedeductionBasedOnPurity,percentage ,createdBy,modifiedBy})
if(!addKaratDetails){
return res.status(422).json({message:'karat details is not created '})
}
return res.status(201).json({message:'karat details is created'});
}

// read karat details
exports.readKaratDetails=async(req,res)=>{
    let readKaratDetails=await models.karatDetails.findAll({isActive:true});
    if(!readKaratDetails[0]){
        return res.status(404).json({message:'data not found'})
    }
    return res.status(200).json(readKaratDetails);
}

// update karat details

exports.updateKaratDetails=async(rea,res)=>{
    let karatDetailsId=req.params.id;
    let updateKaratDetails=await models.karatDetails.update({karat,dedeductionBasedOnPurity,percentage},{where:{id:karatDetailsId,isActive:true}});
    if(!updateKaratDetails[0]){
       return res.status(404).json({message:'karat details  update failed'});
    }
    return res.status(200).json({message:'updated'})
}

// deactive karat details

exports.deactiveKaratdetails=async(req,res)=>{
    const{id,isActive}=req.query;
    let deactiveKaratdetails=await models.karatDetails.update({isActive:isActive},{where:id});
    if(!deactiveKaratdetails[0]){
        return res.status(404).json({message:'deleted failed'});
    }
    return res.status(200).json({message:'updated'})
}
