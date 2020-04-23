const models = require('../../models');
const sequelize = models.sequelize;

const Sequelize = models.Sequelize;
const Op = Sequelize.Op;
const check = require('../../lib/checkLib');

//add occupation
exports.addOccupation = async (req, res, next) => {
    let { name } = req.body;
    let occupationExist = await models.occupation.findOne({ where: { name,isActive:true } })
    if (!check.isEmpty(occupationExist)) {
        return res.status(400).json({ message: 'This Occupation is already Exist' });
    }
    let addOccupation = await models.occupation.create({ name });
    if(!addOccupation){return res.status(422).json({message:'Occupation is not created'})}
    return res.status(201).json({ message: `Occupation Created` })
}
// read ocuupation
exports.readOccupation = async (req, res, next) => {

    let readOccupation = await models.occupation.findAll({where:{isActive:true}})
    if(!readOccupation[0]){
        return res.status(404).json({message:'data not found'})
    }
    return res.status(200).json(readOccupation)

}
// update occupation

exports.updateOccupation= async (req,res,next)=>{
    let ocuupationId=req.params.id;
    const{name}=req.body;
    let updateOccupation= await models.occupation.update({name},{where:{id:ocuupationId,isActive:true}});
    if(!updateOccupation[0]){return res.status(404).json({message:'occupation update failed'});}
    return res.status(200).json({message:'Updated'});
}

// deactive Occupation
exports.deactiveOccupation = async (req, res, next) => {
    const { id, isActive } = req.query;
    const deactiveOccupation = await models.occupation.update({ isActive: isActive }, { where: { id: id } })
    if (deactiveOccupation[0] == 0) {
        return res.status(404).json({ message: "Occupation deleted failed" });
    }
    return res.status(200).json({ message: `Updated` })
}