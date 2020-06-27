const baseUrlConfig = require('../config/baseUrl');

module.exports = (sequelize, DataTypes) => {
    const Offer = sequelize.define('offer', {
        // attributes
        // images: {
        //     type: DataTypes.INTEGER,
        //     field: 'images'
        // },
        userId: {
            type: DataTypes.INTEGER,
            field: 'user_id'
        }
    }, {
        freezeTableName: true,
        tableName: 'loan_offer',
    });

    Offer.associate = function (models) {

        Offer.hasMany(models.offerImages, { foreignKey: 'offerId', as: 'offerImages' });

    }

    Offer.prototype.toJSON = function () {
        var values = Object.assign({}, this.get({ plain: true }));
        if (values.offerImages) {
            for (image of values.offerImages) {

                image.offerImages.URL = baseUrlConfig.BASEURL + image.offerImages.url;
                let filePath = image.offerImages.url;
                let pathToadd = filePath.replace('public/', '');
                image.offerImages.URL = baseUrlConfig.BASEURL + pathToadd;
            }
        }
        return values;
    }




     //Add_Offer
     Offer.addOffer = (images, userId) => Offer.create({ images, userId });

     //Update_Offer
     Offer.updateOffer = (id, images, userId) => Offer.update({ images, userId }, { where: { id } })
 
     //Read_Offer
     Offer.readOffer = () => Offer.findAll({attributes: ['id', 'images']});
     
    return Offer;
}