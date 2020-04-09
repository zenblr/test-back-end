const models=require('../../models');
const sequelize = models.sequelize;

const Sequelize = models.Sequelize;
const Op = Sequelize.Op;
const check = require('../../lib/checkLib')

//add Role
exports.addRole=async(req,res)=>{
    
    const{roleName,description, permissionId}=req.body;

    let roleExist = await models.roles.findOne({where: {roleName}})
    if (!check.isEmpty(roleExist)) {
        return res.status(404).json({ message: 'This Role is already Exist' });
    }
    await sequelize.transaction(async t => {
        let role=await models.roles.create({roleName,description});
        for (let i = 0; i < permissionId.length; i++) {
            let data = await models.role_permission.create({
            roleId : role.id,
            permissionId: permissionId[i]
            }, { transaction: t })
        }

    }).then(() => {
        return res.status(200).json({ messgae: `Role created` })
    }).catch((exception) => {
        next(exception)
    })

}

//get Role

exports.readRole=async(req,res)=>{
    
    let readRoleData=await models.roles.findAll({where:{isActive:true},include:[models.permission]});
    if(!readRoleData){
        return res.status(404).json({message:"Data not found"});
    }
    return res.status(200).json({readRoleData});
}

//update Role

exports.updateRole=async(req,res, next)=>{
    const roleId=req.params.id;
    const{roleName,description}=req.body;
    let updateRoleData=await models.roles.update({roleName,description},{where:{id:roleId,isActive:true}});
    if(!updateRoleData[0]){return res.status(404).json({message:"data not found"})};
    return res.status(200).json({message:"Updated"});

}

//delete Role

exports.deactiveRole=async(req,res, next)=>{
    const roleId=req.params.id;
    let deactiveRole=await models.roles.update({isActive:false},{where:{id:roleId,isActive:true}});
    if(!deactiveRole[0]){
        return res.status(404).json({message:'data not found'});
    }
    return res.status(200).json({message:"Success"});
}



