module.exports = (sequelize, DataTypes) => {
    const userRole = sequelize.define('user_role', {
        // attributes
        userId: {
            type: DataTypes.INTEGER,
            field: 'user_id'
        },
        roleId: {
            type: DataTypes.INTEGER,
            field: 'role_id'
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            field: 'is_active',
            defaultValue: true,
        }
    }, {
        freezeTableName: true,
        allowNull: false,
        tableName: 'user_role'
    });


    userRole.associate = function(models) {
        // userRole.belongsTo(models.users, { foreignKey: 'userId', as: 'user' });
        // userRole.belongsTo(models.roles, { foreignKey: 'roleId', as: 'role' });
    }


    return userRole;
}