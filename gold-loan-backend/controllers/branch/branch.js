const models=require('../../models');

//Add branch
exports.AddBranch=async (req,res)=>{
    try {
        const{partnerId,name,cityId,stateId,address,pincode,commission,isActive}=req.body;
        let newdata1=await models.branch.findAll();
        let newdata2=newdata1.reverse();
        if(!newdata2[0]){var bId=1;}

       else{ var bId=newdata2[0].dataValues.id+1;}
        console.log(bId)
        let addbranch=await models.branch.create({partnerId,branchId:name.slice(0, 3).toUpperCase() + '-'+bId,name,cityId,stateId,address,pincode,commission,isActive});
        if(!addbranch){return res.status(422).json({message:'Data not created'});}
        
        return res.status(201).json({message:"data is created"});
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