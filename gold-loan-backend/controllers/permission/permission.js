const models=require("../../models");

//add permission
exports.addPermission=async(req,res)=>{
    const{permissionName}=req.body;

    let  addpermission=await models.permission.create({permissionName});
    if(!addpermission){
        return res.status(422).json({message:"data not created"});
    }
    return res.status(201).json({message:'permission created'});

}

//read permissiion
exports.readPermission=async(req,res)=>{
    
    let readpermissiondata=await models.permission.findAll({where:{isActive:true}});

    if(!readpermissiondata){
        return res.status(404).json({message:"data not found"});
    }
    return res.status(200).json(readpermissiondata);
}

//update permission

exports.updatePermission=async(req,res)=>{
    const permissionid=req.params.id;
    const {permissionName}=req.body
    let updatepermissiondata=await models.permission.update({permissionName},{where:{id:permissionid,isActive:true}});
    if(!updatepermissiondata[0]){return res.status(404).json({message:'permission is not exist'})}
    return res.status(200).json({message:'Updated'});
}

// delete permission

exports.deactivePermission=async(req,res)=>{
    const permissionid=req.params.id;
    let deactivepermission=await models.permission.update({isActive:false},{where:{id:permissionid,isActive:true}});
    if(!deactivepermission[0]){
        return res.status(404).json({message:"permission is not exist"});
    }
    return res.status(200).json({message:"Success"});
}