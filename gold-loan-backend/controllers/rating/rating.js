const models = require('../../models');
const sequelize = models.sequelize;

const Sequelize = models.Sequelize;
const Op = Sequelize.Op;
const check = require('../../lib/checkLib');


exports.addRating = async(req, res) => {
    try {
        let { ratingName, ratingPoint } = req.body;
        let ratingExist = await models.rating.findOne({ where: { ratingPoint: ratingPoint, ratingName: ratingName } })
        if (!check.isEmpty(ratingExist)) {
            return res.status(404).json({ message: 'This Rating is already Exist' });
        }
        let rating = await models.rating.create({ ratingName, ratingPoint })
        return res.status(200).json({ message: `Rating Created` })

    } catch (error) {
        return res.status(500).json({ message: `Internal server error` })

    }
}

exports.getRating = async(req, res) => {
    try {
        let allRating = await models.rating.findAll()
        return res.status(200).json(allRating)

    } catch (error) {
        return res.status(500).json({ message: `Internal server error`, error })

    }
}

exports.deactivateRating = async(req, res) => {
    try {
        const { ratingId, isActive } = req.query;
        await models.rating.update({ isActive: isActive }, { where: { id: ratingId } })
        return res.status(200).json({ message: `Updated` })
    } catch (error) {
        return res.status(500).json({ message: `Internal server error`, error })
    }
}