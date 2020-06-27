module.exports = (sequelize, DataTypes) => {
    const Banner = sequelize.define('banner', {
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
        tableName: 'loan_banner',
    });

    Banner.associate = function (models) {
        Banner.hasMany(models.bannerImages, { foreignKey: 'bannerId', as: 'bannerImage' });
    }

    Banner.prototype.toJSON = function () {
        var values = Object.assign({}, this.get({ plain: true }));
        if (values.bannerImages) {
            for (image of values.bannerImages) {

                image.bannerImages.URL = baseUrlConfig.BASEURL + image.bannerImages.url;
                let filePath = image.bannerImages.url;
                let pathToadd = filePath.replace('public/', '');
                image.bannerImages.URL = baseUrlConfig.BASEURL + pathToadd;
            }
        }
        return values;
    }
    
    //Add_Banner
    Banner.addBanner = (images, userId) => Banner.create({ images, userId });

    //Update_Banner
    Banner.updateBanner = (id, images, userId) => Banner.update({ images, userId }, { where: { id } })

    //Read_Banner
    Banner.readBanner = () => Banner.findAll({attributes: ['id', 'images']});


    return Banner;
}