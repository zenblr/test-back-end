const models=require('../../models');

// add feed back 

exports.addFeedBack=async (req,res)=>{
    const{customerName,contactNumber,feedBack,rating}=req.body;
    let customerId= req.userData.id;

    let addFeedBackData=await models.feedBack.create({customerName,contactNumber,feedBack,rating,customerId});
    if(!addFeedBackData){
        return res.status(422).json({message:'feed back is not created'});
    }
    return res.status(201).json({message:'created'});

}

// read feedback

exports.readFeedBack=async(req,res)=>{
let readCustomerFeedBack=await models.feedBack.findAll({where:{isActive:true},
        include: [
    {
        model:models.customer,
        as: "customer"
    }
], });
if(!readCustomerFeedBack[0]){
    return res.status(404).json({message:'data not found'});

}
return res.status(200).json(readCustomerFeedBack);
    
}
// read feedback by id

exports.readFeedBackById=async(req,res)=>{
    const customerFeedBackId=req.params.id;
    let readCustomerFeedBackId=await models.feedBack.findOne({where:{id:customerFeedBackId,isActive:true},
        include:[
            {
                model: models.customer,
                as: 'customer'
            }
        ],
    });
    if(!readCustomerFeedBackId){
        return res.status(404).json({message:'data not found'})
    }
    return res.status(200).json({readCustomerFeedBackId});
}

//update feedback 

exports.updateFeedBack=async(req,res)=>{
    let customerFeedBackId=req.params.id;
    const {customerName,contactNumber,feedBack,rating}=req.body;
    let updateCustomerFeedBack=await models.feedBack.update({customerName,contactNumber,feedBack,rating},{where:{id:customerFeedBackId,isActive:true}});
    if(!updateCustomerFeedBack[0]){
        return res.status(404).json({message:' update failed'})
    }
    return res.status(200).json({message:'Updated'});

}

// delete feedback

exports.deactiveFeedBack=async(req,res)=>{
    const {isActive,id}=req.query;
    let deactiveCustomerFeedBack=await models.feedBack.update({isActive:isActive},{where:{id}});
    if(!deactiveCustomerFeedBack[0]){
        return res.status(404).json({message:'Query deleted failed'});
    }
    return res.status(200).json({message:'Updated'});
}