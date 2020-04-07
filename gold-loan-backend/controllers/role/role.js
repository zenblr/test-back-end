const models=require('../../models');

//add Role
exports.addRole=async(req,res)=>{
    
    const{roleName,description}=req.body;
     
    let addroleData=await models.roles.create({roleName,description});
    if(!addroleData){
        return res.status(422).json({message:'role not created'});
    }
    return res.status(201).json({message:"role created"});
}

//get Role

exports.readRole=async(req,res)=>{
    
    let readRoleData=await models.roles.findAll({where:{isActive:true}});
    if(!readRoleData[0]){
        return res.status(404).json({message:"Data not found"});
    }
    return res.status(200).json({readRoleData});
}

//update Role

exports.updateRole=async(req,res)=>{
    const roleId=req.params.id;
    const{roleName,description}=req.body;
    let updateRoleData=await models.roles.update({roleName,description},{where:{id:roleId,isActive:true}});
    if(!updateRoleData[0]){return res.status(404).json({message:"data not found"})};
    return res.status(200).json({message:"Updated"});

}

//delete Role

exports.deactiveRole=async(req,res)=>{
    const roleId=req.params.id;
    let deactiveRole=await models.roles.update({isActive:false},{where:{id:roleId,isActive:true}});
    if(!deactiveRole[0]){
        return res.status(404).json({message:'data not found'});
    }
    return res.status(200).json({message:"Success"});
}



