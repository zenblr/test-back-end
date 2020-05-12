module.exports = (sequelize, DataTypes) => {
    const UserType = sequelize.define('userType', {
        // attributes
        userType: {
            type: DataTypes.STRING,
            field: 'user_type',
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
        tableName: 'user_type',
    });

    return UserType;
}