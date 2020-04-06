const models=require('../../models');

//add Role
exports.addRole=async(req,res)=>{
    
    const{roleName,description}=req.body;
     
    let addroledata=await models.roles.create({roleName,description});
    if(!addroledata){
        return res.status(422).json({message:'role not created'});
    }
    return res.status(201).json({message:"role created"});
}

//get Role

exports.readRole=async(req,res)=>{
    
    let readroledata=await models.roles.findAll({where:{isActive:true}});
    if(!readroledata){
        return res.status(404).json({message:"Data not found"});
    }
    return res.status(200).json({readroledata});
}

//update Role

exports.updateRole=async(req,res)=>{
    const roleid=req.params.id;
    const{roleName,description}=req.body;
    let updateroledata=await models.roles.update({roleName,description},{where:{id:roleid,isActive:true}});
    if(!updateroledata){return res.status(404).json({message:"data not found"})};
    return res.status(200).json({message:"Updated"});

}

//delete Role

exports.deactiveRole=async(req,res)=>{
    const roleid=req.params.id;
    let deactiverole=await models.roles.update({isActive:false},{where:{id:roleid}});
    if(!deactiverole){
        return res.status(404).json({message:'data not found'});
    }
    return res.status(200).json({message:"Success"});
}



