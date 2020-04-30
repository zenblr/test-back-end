module.exports = (sequelize, DataTypes) => {
    const Offer = sequelize.define('offer', {
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
        tableName: 'loan_offer',
    });

    return Offer;
}