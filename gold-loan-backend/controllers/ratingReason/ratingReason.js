const models = require('../../models');
const sequelize = models.sequelize;

const Sequelize = models.Sequelize;
const Op = Sequelize.Op;
const check = require('../../lib/checkLib');


exports.addRatingReason = async (req, res, next) => {
    let { description } = req.body;
    let ratingExist = await models.ratingReason.findOne({ where: { description: description, isActive: true } })
    if (!check.isEmpty(ratingExist)) {
        return res.status(404).json({ message: 'This Rating Reason already Exists' });
    }
    let rating = await models.ratingReason.create({ description })
    return res.status(200).json({ message: `Created` })
}

exports.getRatingReason = async (req, res, next) => {
    let { getAll } = req.query;
    if (req.query.from == 1 && req.query.to == -1) {
        let allRating = await models.ratingReason.findAll({ where: { isActive: true } });
        return res.status(200).json({ data: allRating });
    } else {

        let whereCondition;
        if (getAll == "true") {
            whereCondition = { where: { isActive: true }, order: [['id', 'DESC']] }
        } else if (getAll == "false") {
            whereCondition = { where: { isActive: true }, order: [['id', 'DESC']] }
        } else if (getAll == undefined) {
            whereCondition = {  where: { isActive: true }, order: [['id', 'DESC']] }
        }
        let allRating = await models.ratingReason.findAll(whereCondition);
        let count = await models.ratingReason.findAll(whereCondition);
        return res.status(200).json({ data: allRating, count: count.length });
    }
}

exports.updateRatingReason = async (req, res, next) => {
    let { description } = req.body;
    let { id } = req.params;

    let ratingExist = await models.ratingReason.findOne({ where: { description: description, isActive: true } })
    if (!check.isEmpty(ratingExist)) {
        return res.status(404).json({ message: 'This Rating is already Exist' });
    }
    let UpdateData = await models.ratingReason.update({ description }, { where: { id: id } })
    if (UpdateData[0] === 0) {
        return res.status(404).json({ message: 'Data not updated' });
    }
    return res.status(200).json({ message: 'Success' });

}

exports.deactivateRatingReason = async (req, res, next) => {
    const { id, isActive } = req.query;
    const rating = await models.ratingReason.update({ isActive: isActive }, { where: { id: id } })
    if (rating[0] == 0) {
        return res.status(404).json({ message: "rating deleted failed" });
    }
    return res.status(200).json({ message: `Updated` })

}