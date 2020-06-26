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
     //Add_Offer
     Offer.addOffer = (images, userId) => Offer.create({ images, userId });

     //Update_Offer
     Offer.updateOffer = (id, images, userId) => Offer.update({ images, userId }, { where: { id } })
 
     //Read_Offer
     Offer.readOffer = () => Offer.findAll({attributes: ['id', 'images']});
     
    return Offer;
}