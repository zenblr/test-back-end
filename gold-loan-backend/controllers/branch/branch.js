const models=require('../../models');
const sequelize = models.sequelize;


//Add branch
exports.AddBranch=async (req,res)=>{
    try {
        const{partnerId,name,cityId,stateId,address,pincode,commission,isActive}=req.body;
        await sequelize.transaction(async t => {
            
            let addbranch=await models.branch.create({partnerId,name,cityId,stateId,address,pincode,commission,isActive},{transaction: t} );            
              let id=addbranch.dataValues.id;
              
              let partnerdataid=await models.partner.findOne({where:{id:addbranch.dataValues.partnerId},transaction:t});

             let pqid=partnerdataid.dataValues.partnerId;
            let newId=pqid.slice(0,2)+addbranch.dataValues.name.slice(0,3).toUpperCase()+'-'+id;
                   await models.branch.update({branchId:newId},{where:{id},transaction:t});
                 return addbranch;  
        }).then((addbranch) => {
            return res.status(200).json({ messgae: "branch created" })
        }).catch((exception) => {
            
            return res.status(500).json({
                message: "something went wrong",
                data: exception.message
            
            });
        })

    } catch (error) {
        console.log(error)
    }
    
   
}

//get branch
exports.ReadBranch=async (req,res)=>{
    try{
    
    let readbranchdata=await models.branch.findAll({where:{isActive:true},
    
});
    if(!readbranchdata){return res.status(404).json({message:'data not found'})}
    return res.status(200).json(readbranchdata);
    }
    catch(ex){
        console.log(ex.message);
    }
}


//get branch by id

exports.ReadBranchById=async(req,res)=>{
const id=req.params.id;
let branchdata=await models.branch.findOne({where:{id:id,isActive:true}, include:[
    {
        model:models.partner,
        as:"partner",
        where:{
            isActive:true
        }
    },
    {
        model:models.cities,
        as:"cities",
        where:{
            isActive:true
        }
    },
    {
        model:models.states,
        as:"states",
        where:{
            isActive:true
        }
    }
]});

if(!branchdata){return res.status(404).json({message:'data not found'})}

return res.status(200).json(branchdata);


}

// update branch 

exports.UpdateBranch=async(req,res)=>{
    const id=req.params.id;

    const{partnerId,name,cityId,stateId,address,pincode,commission,isActive}=req.body;
    let pId = name.slice(0, 3).toUpperCase() + '-'+id;

    
    let branchdata=await models.branch.update({partnerId,branchId:pId,name,cityId,stateId,address,pincode,commission,isActive} ,{where:{id,isActive:true}});
    if(!branchdata[0]){
        return res.status(404).json({message:'data not found'});
    }
    return res.status(200).json({message:"Success"});
}

// delete branch

exports.DeleteBranch=async(req,res)=>{
    const id=req.params.id;
    let branchdata=await models.branch.update({isActive:false},{where:{id}});
    if(!branchdata[0])
    {
        return res.status(404).json({message:'data not found'});
    }
    return res.status(200).json({message:'Success'})
}