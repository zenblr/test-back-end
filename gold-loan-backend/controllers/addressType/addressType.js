const models=require('../../models');

// Add account Type
exports.addAddressType=async(req,res)=>{
    const {name,isActive}= req.body;
    const addressType=await models.addressType.create({name,isActive});
    if(!addressType){
        return res.status(422).json({message:'accountType is not created'});
    }
    return res.status(201).json({message:'accountType is created'});
}

// get Account Type

exports.readAddressType=async(req,res)=>{

    const readAddressType=await models.addressType.findAll({where:{isActive:true}});

    if(!readAddressType[0]){
        return res.status(404).json({message:'data not found'});
    }
    res.status(200).json(readAddressType);
}
