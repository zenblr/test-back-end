module.exports = (sequelize, DataTypes) => {
    const PocketLocation = sequelize.define('pocketLocation', {
        // attributes
        location: {
            type: DataTypes.TEXT,
            field: 'location',
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
        tableName: 'loan_pocket_location',
    });

    return PocketLocation;
}