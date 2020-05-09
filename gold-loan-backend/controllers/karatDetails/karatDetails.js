const models=require('../../models');

// add karat details
exports.addKaratDetails=async(req,res)=>{
    const {karat,percentage,}=req.body;
    let createdBy=req.userData.id;
    let modifiedBy=req.userData.id;
    let addKaratDetails = await models.karatDetails.create({ karat,percentage ,createdBy,modifiedBy})
if(!addKaratDetails){
return res.status(422).json({message:'karat details is not created '})
}
return res.status(201).json({message:'karat details is created'});
}

// read karat details
exports.readKaratDetails=async(req,res)=>{
    let readKaratDetails=await models.karatDetails.findAll({where:{isActive:true},
        include:[
            {
                model: models.user,
                as: "Createdby",
                where: {
                    isActive: true
                }
            },
            {
                model: models.user,
                as: "Modifiedby",
                where: {
                    isActive: true
                }
            },        ]});
    if(!readKaratDetails[0]){
        return res.status(404).json({message:'data not found'})
    }
    return res.status(200).json(readKaratDetails);
}
exports.readKaratDetailsById=async(req,res)=>{
    let karatDetailsId=req.params.id;
    let readKaratDetailsById=await models.karatDetails.findOne({where:{id:karatDetailsId,isActive:true}});
    if(!readKaratDetailsById){
        return res.status(404).json({message:'data not found'});
    }
    return res.status(200).json(readKaratDetailsById);
}

// update karat details

exports.updateKaratDetails=async(req,res)=>{
    let karatDetailsId=req.params.id;
    const{karat,percentage}=req.body;
    let updateKaratDetails=await models.karatDetails.update({karat,percentage},{where:{id:karatDetailsId,isActive:true}});
    if(!updateKaratDetails[0]){
       return res.status(404).json({message:'karat details  update failed'});
    }
    return res.status(200).json({message:'updated'})
}

// deactive karat details

exports.deactiveKaratdetails=async(req,res)=>{
    const{id}=req.query;
    let deactiveKaratdetails=await models.karatDetails.update({isActive:false},{where:{id,isActive:true}});
    if(!deactiveKaratdetails[0]){
        return res.status(404).json({message:'deleted failed'});
    }
    return res.status(200).json({message:'updated'})
}
