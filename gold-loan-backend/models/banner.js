const baseUrlConfig = require('../config/baseUrl');

module.exports = (sequelize, DataTypes) => {
    const Banner = sequelize.define('banner', {
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
        tableName: 'loan_banner',
    });

    Banner.associate = function (models) {
    }

    Banner.prototype.toJSON = function () {
        var values = Object.assign({}, this.get({ plain: true }));
        let bannerImage = []
        if (values.images) {
            for (imgUrl of values.images) {
                let URL = baseUrlConfig.BASEURL + imgUrl;
                bannerImage.push(URL)
            }
        }
        values.bannerImage = bannerImage
        return values;
    }
    
    //Add_Banner
    Banner.addBanner = (images, userId) => Banner.create({ images, userId });

    //Update_Banner
    Banner.updateBanner = (id, images, userId) => Banner.update({ images, userId }, { where: { id } })

    //Read_Banner
    Banner.readBanner = () => Banner.findAll();


    return Banner;
}