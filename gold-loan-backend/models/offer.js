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
                image.offerImages.URL = process.env.BASE_URL + image.offerImages.path;
            }
        }
        return values;
    }

     //Add_Offer
     Offer.addOffer = ( userId) => Offer.create({ userId });

     //Update_Offer
     Offer.updateOffer = (id, userId) => Offer.update({ userId }, { where: { id } })
 
     //Read_Offer
     Offer.readOffer = () => Offer.findAll();
     
    return Offer;
}