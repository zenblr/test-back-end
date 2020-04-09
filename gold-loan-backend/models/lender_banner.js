module.exports = (sequelize, DataTypes) => {
    const lenderBanner = sequelize.define('lender_banner', {
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
        tableName: 'lender_banner',
    });

    return lenderBanner;
}