const models = require("../../models");
const sequelize = models.sequelize;

const Sequelize = models.Sequelize;
const Op = Sequelize.Op;

const CONSTANT = require("../../utils/constant");

const check = require("../../lib/checkLib");


exports.addGoldRate = async (req, res, next) => {
    let { goldRate } = req.body;
    let createdBy = req.userData.id;
    let modifiedBy = req.userData.id;
    let modifiedTime = Date.now();

    let getGoldRate = await models.goldRate.findAll();
    if (getGoldRate.length == 0) {
        await sequelize.transaction(async (t) => {
            let CreatedGoldRate = await models.goldRate.create({ goldRate, previousGoldRate: goldRate, createdBy, modifiedBy, modifiedTime }, { transaction: t });

            await models.goldRateHistory.create({ goldRate, modifiedBy, modifiedTime }, { transaction: t });
        });
        return res.status(200).json({ message: "success" })
    } else {

        let id = getGoldRate[0].id;
        let previousGoldRate = getGoldRate[0].goldRate
        await sequelize.transaction(async (t) => {
            let updateGoldRate = await models.goldRate.update({ goldRate, previousGoldRate, modifiedBy, modifiedTime }, { where: { id }, transaction: t })

            await models.goldRateHistory.create({ goldRate, modifiedBy, modifiedTime }, { transaction: t });
            return updateGoldRate
        });
        return res.status(200).json({ message: 'success' });

    }

}

exports.readGoldRate = async (req, res, next) => {
    let goldRate = await models.goldRate.findAll({
        include: [{
            model: models.user,
            as:'Modifiedby',
            attributes:['id','firstName','lastName']
        }]
    })
    
    if (!goldRate) {
        res.status(404).json({ message: 'Data not found' });
    } else {
        res.status(200).json(goldRate[0]);
    }
}