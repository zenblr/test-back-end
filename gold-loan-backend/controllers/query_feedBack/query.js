const models=require('../../models');

// add Query

exports.addQuery=async (req,res)=>{
    const{customerName,contactNumber,query}=req.body;
    let addData=await models.query.create({customerName,contactNumber,query});
    if(!addData){
        return res.status(422).json({message:'Query is not created'});
    }
    return res.status(201).json({message:'created'});

}

// readQuery

exports.readQuery=async(req,res)=>{
    
let readCustomerQuery=await models.query.findAll({where:{isActive:true}});
if(!readCustomerQuery[0]){
    return res.status(404).json({message:'data not found'});

}
return res.status(200).json(readCustomerQuery);
}
// get query by id

exports.readQueryById=async(req,res)=>{
    const customerQueryId=req.params.id;
    let readCustomerQueryById=await models.query.findOne({where:{id:customerQueryId,isActive:true},
    });
    if(!readCustomerQueryById){
        return res.status(404).json({message:'data not found'})
    }
    return res.status(200).json({readCustomerQueryById});
}

//update status of query

exports.updateQuery=async(req,res)=>{
    let customerQueryId=req.params.id;
    const {status}=req.body;
    let updateCustomerQuery=await models.query.update({status:status},{where:{id:customerQueryId,isActive:true}});
    if(!updateCustomerQuery[0]){
        return res.status(404).json({message:'update failed'})
    }
    return res.status(200).json({message:'Updated'});

}

// delete query

exports.deactiveQuery=async(req,res)=>{
    const {isActive,id}=req.query;
    let deactiveCustomerQuery=await models.query.update({isActive:isActive},{where:{id}});
    if(!deactiveCustomerQuery[0]){
        return res.status(404).json({message:'Query deleted failed'});
    }
    return res.status(200).json({message:'Updated'});
}
