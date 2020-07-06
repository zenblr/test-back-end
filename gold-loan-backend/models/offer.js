const baseUrlConfig = require('../config/baseUrl');

module.exports = (sequelize, DataTypes) => {
    const Offer = sequelize.define('offer', {
        // attributes
        images: {
            type: DataTypes.INTEGER,
            field: 'images'
        },
        userId: {
            type: DataTypes.INTEGER,
            field: 'user_id'
        }
    }, {
        freezeTableName: true,
        tableName: 'loan_offer',
    });

    Offer.associate = function (models) {

        // Offer.hasMany(models.offerImages, { foreignKey: 'offerId', as: 'offerImages' });

    }

    Offer.prototype.toJSON = function () {
        var values = Object.assign({}, this.get({ plain: true }));
        let offerImage = []
        if (values.images) {
            for (imgUrl of values.images) {
                let URL = baseUrlConfig.BASEURL + imgUrl;
                bannerImage.push(URL)
            }
        }
        values.offerImage = offerImage
        return values;
    }

    //Add_Offer
    Offer.addOffer = (images, userId) => Offer.create({ images, userId });

    //Update_Offer
    Offer.updateOffer = (id, images, userId) => Offer.update({ images, userId }, { where: { id } })

    //Read_Offer
    Offer.readOffer = () => Offer.findAll();

    return Offer;
}