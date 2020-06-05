module.exports = (sequelize, DataTypes) => {
    const Purpose = sequelize.define('purpose', {
        // attributes
        name: {
            type: DataTypes.TEXT,
            field: 'purpose',
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
        tableName: 'purpose',
    });

    return Purpose;
}