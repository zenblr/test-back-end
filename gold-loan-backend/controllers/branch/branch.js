const models=require('../../models');

//Add branch
exports.AddBranch=async (req,res)=>{
    
    const{partnerId,name,city,state,address,pincode,commission,isActive}=req.body;
    
    let addbranch=await models.branch.create(partnerId,name,city,state,address,pincode,commission,isActive);
    if(!addbranch){return res.status(422).json({message:'Data not created'});}
    
    return res.status(201).json({message:"data is created"});
}

//get branch
exports.ReadBranch=async (req,res)=>{
    
    let readbranchdata=await models.branch.findAll({where:{isActive:true}});
    if(!readbranchdata){return res.status(404).json({message:'data not found'})}
    return res.status(200).json(readbranchdata);

}


//get branch by id

exports.ReadBranchById=async(req,res)=>{
const branchid=req.params.id;
let branchdata=await models.branch.findOne({where:{branchid,isActive:true}});

if(!branchdata){return res.status(404).json({message:'data not found'})}

return res.status(200).json(branchdata);


}

// update branch 

exports.UpdateBranch=async(req,res)=>{
    const branchid=req.params.id;
    const{partnerId,name,city,state,address,pincode,commission,isActive}=req.body;
    
    let branchdata=await models.branch.update({partnerId,name,city,state,address,pincode,commission,isActive} ,{where:branchid,isActive:true});
    if(!branchdata[0]){
        return res.status(404).json({message:'data not found'});
    }
    return res.status(200).json({message:"Success"});
}

// delete branch

exports.DeleteBranch=async(req,res)=>{
    const branchid=req.params.id;
    let branchdata=await models.branch.update({isActive:false},{where:{branchid}});
    if(!branchdata)
    {
        return res.status(404).json({message:'data not found'});
    }
    return res.status(200).json({message:'Success'})
}