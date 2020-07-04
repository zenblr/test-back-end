const baseUrlConfig = require('../config/baseUrl');

module.exports = (sequelize, DataTypes) => {
    const LenderBanner = sequelize.define('lenderBanner', {
        // attributes
        images: {
            type: DataTypes.ARRAY(DataTypes.TEXT),
            field: 'images'

        },
        userId: {
            type: DataTypes.INTEGER,
            field: 'user_id'
        }
    }, {
        freezeTableName: true,
        tableName: 'loan_lender_banner',
    });

    LenderBanner.associate = function (models) {

        LenderBanner.hasMany(models.lenderBannerImages, { foreignKey: 'lenderBannerId', as: 'lenderBannerImages' });

    }

    LenderBanner.prototype.toJSON = function () {
        var values = Object.assign({}, this.get({ plain: true }));
        let lenderBannerImages = []
        if (values.images) {
            for (imgUrl of values.images) {
                let URL = baseUrlConfig.BASEURL + imgUrl;
                bannerImage.push(URL)
            }
        }
        values.lenderBannerImages = lenderBannerImages
        return values;
    }

    //Add_LenderBanner
    LenderBanner.addLenderBanner = (images, userId) => LenderBanner.create({ images, userId });

    //Update_LenderBanner
    LenderBanner.updateLenderBanner = (id, images, userId) => LenderBanner.update({ images, userId }, { where: { id } });

    //Read_LenderBanner
    LenderBanner.readLenderBanner = () => LenderBanner.findAll();

    return LenderBanner;
}