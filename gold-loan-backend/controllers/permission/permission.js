const models=require("../../models");

//add permission
exports.addPermission=async(req, res, next)=>{
    const{permissionName,description}=req.body;

    let  addPermissionData=await models.permission.create({permissionName,description});
    if(!addPermissionData){
        return res.status(422).json({message:"data not created"});
    }
    return res.status(201).json({message:'permission created'});

}

//read permissiion
exports.readPermission=async(req, res, next)=>{
    
    let readPermissionData=await models.permission.findAll({where:{isActive:true}});

    if(!readPermissionData[0]){
        return res.status(404).json({message:"data not found"});
    }
    return res.status(200).json(readPermissionData);
}

//update permission

exports.updatePermission=async(req,res, next)=>{
    const permissionId=req.params.id;
    const {permissionName,description}=req.body
    let updatePermissionData=await models.permission.update({permissionName,description},{where:{id:permissionId,isActive:true}});
    if(!updatePermissionData[0]){return res.status(404).json({message:'permission is not exist'})}
    return res.status(200).json({message:'Updated'});
}

// delete permission

exports.deactivePermission=async(req,res, next)=>{
    const permissionId=req.params.id;
    let deactivePermission=await models.permission.update({isActive:false},{where:{id:permissionId,isActive:true}});
    if(!deactivePermission[0]){
        return res.status(404).json({message:"permission is not exist"});
    }
    return res.status(200).json({message:"Success"});
}