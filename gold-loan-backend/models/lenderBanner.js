const baseUrlConfig = require('../config/baseUrl');

module.exports = (sequelize, DataTypes) => {
    const LenderBanner = sequelize.define('lenderBanner', {
        // attributes
        // images: {
        //     type: DataTypes.ARRAY(DataTypes.TEXT),
        //     field: 'images'

        // },
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
        if (values.lenderBannerImages) {
            for (image of values.lenderBannerImages) {

                image.lenderBannerImages.URL = baseUrlConfig.BASEURL + image.lenderBannerImages.url;
                let filePath = image.lenderBannerImages.url;
                let pathToadd = filePath.replace('public/', '');
                image.lenderBannerImages.URL = baseUrlConfig.BASEURL + pathToadd;
            }
        }
        return values;
    }

    //Add_LenderBanner
    LenderBanner.addLenderBanner = ( userId) => LenderBanner.create({ userId });

    //Update_LenderBanner
    LenderBanner.updateLenderBanner = (id, userId) => LenderBanner.update({ userId }, { where: { id } });

    //Read_LenderBanner
    LenderBanner.readLenderBanner = () => LenderBanner.findAll();

    return LenderBanner;
}