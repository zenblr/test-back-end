module.exports = (sequelize, DataTypes) => {
    const Offer = sequelize.define('offer', {
        // attributes
        images: {
            type: DataTypes.ARRAY(DataTypes.TEXT),
            field: 'images'

        },
        goldRate: {
            type: DataTypes.INTEGER,
            field: 'gold_rate'
        },
        userId: {
            type: DataTypes.INTEGER,
            field: 'user_id'
        }
    }, {
        freezeTableName: true,
        tableName: 'offer',
    });

    return Offer;
}