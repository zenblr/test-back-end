module.exports = (sequelize, DataTypes) => {
    const Rating = sequelize.define('rating', {
        // attributes
        ratingName: {
            type: DataTypes.STRING,
            field: 'rating_name',
            allowNull: false,
        },
        ratingPoint: {
            type: DataTypes.INTEGER,
            field: 'rating_number',
            allowNull: false,
        }
    }, {
        freezeTableName: true,
        allowNull: false,
        tableName: 'rating',
    });

    return Rating;
}