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

    
    //Add_Banner
    Banner.addBanner = (images, userId) => Banner.create({ images, userId });

    //Update_Banner
    Banner.updateBanner = (id, images, userId) => Banner.update({ images, userId }, { where: { id } })

    //Read_Banner
    Banner.readBanner = () => Banner.findAll({attributes: ['id', 'images']});


    return Banner;
}