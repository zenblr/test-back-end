const models = require('../../models');
const sequelize = models.sequelize;

const Sequelize = models.Sequelize;
const Op = Sequelize.Op;
const check = require('../../lib/checkLib');


exports.addOccupation = async (req, res, next) => {
    let { name } = req.body;
    let occupationExist = await models.occupation.findOne({ where: { name } })
    if (!check.isEmpty(occupationExist)) {
        return res.status(404).json({ message: 'This Occupation is already Exist' });
    }
    let rating = await models.occupation.create({ name })
    return res.status(200).json({ message: `Occupation Created` })
}

exports.readOccupation = async (req, res, next) => {

    let allOccupation = await models.occupation.findAll({where:{isActive:true}})
    return res.status(200).json(allOccupation)

}

exports.deactiveOccupation = async (req, res, next) => {
    const { id, isActive } = req.query;
    const deactiveOccupation = await models.occupation.update({ isActive: isActive }, { where: { id: id } })
    if (deactiveOccupation[0] == 0) {
        return res.status(404).json({ message: "Occupation deleted failed" });
    }
    return res.status(200).json({ message: `Updated` })
}