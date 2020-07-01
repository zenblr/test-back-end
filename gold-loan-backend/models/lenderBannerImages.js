module.exports = (sequelize, DataTypes) => {
    const LenderBannerImages = sequelize.define('lenderBannerImages', {
        // attributes
        lenderBannerId: {
            type: DataTypes.INTEGER,
            field: 'lender_banner_id'
        },
        lenderBannerImagesId: {
            type: DataTypes.INTEGER,
            field: 'lender_banner_images_id'
        },
    }, {
        freezeTableName: true,
        tableName: 'loan_lender_banner_images',
    });

    LenderBannerImages.associate = function (models) {

        LenderBannerImages.belongsTo(models.fileUpload, { foreignKey: 'lenderBannerImagesId', as: 'lenderBannerImages' });

    }
     
    return LenderBannerImages;
}