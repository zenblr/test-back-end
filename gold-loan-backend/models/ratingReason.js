module.exports = (sequelize, DataTypes) => {
    const RatingReason = sequelize.define('ratingReason', {
        // attributes
        description: {
            type: DataTypes.TEXT,
            field: 'description',
            allowNull: false,
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            field: 'is_active',
            defaultValue: true,
        }
    }, {
        freezeTableName: true,
        allowNull: false,
        tableName: 'rating_reason',
    });

    return RatingReason;
}