module.exports = (sequelize, DataTypes) => {
    const OfferImages = sequelize.define('offerImages', {
        // attributes
        offerId: {
            type: DataTypes.INTEGER,
            field: 'offer_id'
        },
        offerImagesId: {
            type: DataTypes.INTEGER,
            field: 'offer_images_id'
        },
    }, {
        freezeTableName: true,
        tableName: 'loan_offer_images',
    });

    OfferImages.associate = function (models) {

        OfferImages.belongsTo(models.fileUpload, { foreignKey: 'offerImagesId', as: 'offerImages' });

    }
     
    return OfferImages;
}