const models=require('../../models');

// Add address Type
exports.addAddressType=async(req,res)=>{
    const {name}= req.body;
    let addressTypeExist = await models.addressType.findOne({ where: { name } })
    if (!check.isEmpty(addressTypeExist)) {
        return res.status(404).json({ message: 'This Address type is already Exist' });
    }
    const addressType=await models.addressType.create({name});
    if(!addressType){
        return res.status(422).json({message:'accountType is not created'});
    }
    return res.status(201).json({message:'accountType is created'});
}

// get Address Type

exports.readAddressType=async(req,res)=>{

    const readAddressType=await models.addressType.findAll({where:{isActive:true}});

    if(!readAddressType[0]){
        return res.status(404).json({message:'data not found'});
    }
    res.status(200).json(readAddressType);
}
//deactive Address type
exports.deactivateAddressType = async (req, res, next) => {
    const { id, isActive } = req.query;
    const addressType = await models.addressType.update({ isActive: isActive }, { where: { id: id } })
    if (addressType[0] == 0) {
        return res.status(404).json({ message: "Address type deleted failed" });
    }
    return res.status(200).json({ message: `Updated` })
}