const models=require('../../models');
const check = require('../../lib/checkLib');


// add Martial Status
exports.addMartialStatus=async(req,res)=>{
    const {name}= req.body;
    let martialStatusExist = await models.martialStatus.findOne({ where: { name,isActive:true } })
    if (!check.isEmpty(martialStatusExist)) {
        return res.status(404).json({ message: 'This martial Status is already Exist' });
    }
    const addMartialStatus=await models.martialStatus.create({name});
    if(!addMartialStatus){
        return res.status(422).json({message:'Martial Status is not created'});
    }
    return res.status(201).json({message:'Martial Status is created'});
}

//read  Martial Status

exports.readMartialStatus=async(req,res)=>{

    const readMartialStatus=await models.martialStatus.findAll({where:{isActive:true}});

    if(!readMartialStatus[0]){
        return res.status(404).json({message:'data not found'});
    }
    res.status(200).json(readMartialStatus);
}

//deactive Martial Status

exports.deactivateMartialStatus = async (req, res, next) => {
    const { id, isActive } = req.query;
    const deactivateMartialStatus = await models.martialStatus.update({ isActive: isActive }, { where: { id: id } })
    if (deactivateMartialStatus[0] == 0) {
        return res.status(404).json({ message: "Martial Status deleted failed" });
    }
    return res.status(200).json({ message: `Updated` })
}