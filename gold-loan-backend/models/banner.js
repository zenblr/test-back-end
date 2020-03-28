module.exports = (sequelize, DataTypes) => {
    const Banner = sequelize.define('banner', {
        // attributes
        images: {
            type: DataTypes.ARRAY(DataTypes.TEXT),
            field: 'images'

        },
        userId: {
            type: DataTypes.INTEGER,
            defaultValue: 1,
            field: 'user_id'
        }
    }, {
        freezeTableName: true,
        tableName: 'banner',
    });

    //Find_Banner
    Banner.findBanner = (id) => Banner.findOne({ where: { id } });

    //Add_Banner
    Banner.addBanner = (images, isActive, userId, description) => Banner.create({ images, isActive, userId, description });

    //Update_Banner
    Banner.updateBanner = (id, images, isActive, userId, description) => Banner.update({ images, isActive, userId, description }, { where: { id } })

    //Read_Banner
    Banner.readBanner = (id) => Banner.findOne({ where: { id } });


    return Banner;
}