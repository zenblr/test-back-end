module.exports = (sequelize, DataTypes) => {
    const BannerImages = sequelize.define('bannerImages', {
        // attributes
        bannerId: {
            type: DataTypes.INTEGER,
            field: 'banner_id',
        },
        bannerImageId: {
            type: DataTypes.INTEGER,
            field: 'banner_image_id'
        },
        
    }, {
        freezeTableName: true,
        tableName: 'loan_banner_lmage',
    });

    BannerImages.associate = function (models) {
        BannerImages.belongsTo(models.fileUpload, { foreignKey: 'bannerImageId', as: 'bannerImage' });
    }

    return BannerImages;
}