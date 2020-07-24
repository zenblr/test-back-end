const models = require('../../models');
const sequelize = models.sequelize;

const Sequelize = models.Sequelize;
const Op = Sequelize.Op;
const check = require('../../lib/checkLib');


exports.addRating = async (req, res, next) => {
    let { ratingName, ratingPoint } = req.body;
    let ratingExist = await models.rating.findOne({ where: { ratingPoint: ratingPoint, ratingName: ratingName } })
    if (!check.isEmpty(ratingExist)) {
        return res.status(404).json({ message: 'This Rating is already Exist' });
    }
    let rating = await models.rating.create({ ratingName, ratingPoint })
    return res.status(200).json({ message: `Rating Created` })
}

exports.getRating = async (req, res, next) => {
    let { getAll } = req.query;

    let whereCondition;
    if (getAll == "true") {
        whereCondition = { order: [['id', 'ASC']] }
    } else if (getAll == "false") {
        whereCondition = { where: { isActive: true }, order: [['id', 'ASC']] }
    } else if (getAll == undefined) {
        whereCondition = { order: [['id', 'ASC']] }
    }
    let allRating = await models.rating.findAll(whereCondition)
    return res.status(200).json({ data: allRating })

}

exports.updateRating = async (req, res, next) => {
    let { ratingName, ratingPoint } = req.body;
    let { id } = req.params;

    let ratingExist = await models.rating.findOne({ where: { ratingPoint: ratingPoint, ratingName: ratingName } })
    if (!check.isEmpty(ratingExist)) {
        return res.status(404).json({ message: 'This Rating is already Exist' });
    }
    let UpdateData = await models.rating.update({ ratingName, ratingPoint }, { where: { id: id } })
    if (UpdateData[0] === 0) {
        return res.status(404).json({ message: 'Data not updated' });
    }
    return res.status(200).json({ message: 'Success' });

}

exports.deactivateRating = async (req, res, next) => {
    const { ratingId, isActive } = req.query;
    const rating = await models.rating.update({ isActive: isActive }, { where: { id: ratingId } })
    if (rating[0] == 0) {
        return res.status(404).json({ message: "rating deleted failed" });
    }
    return res.status(200).json({ message: `Updated` })

}