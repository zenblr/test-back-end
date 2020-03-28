module.exports = (sequelize, DataTypes) => {
    const rolePermission = sequelize.define('role_permission', {
        // attributes
        roleId: {
            type: DataTypes.INTEGER,
            field: 'role_id'
        },
        permissionId: {
            type: DataTypes.INTEGER,
            field: 'permission_id'
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            field: 'is_active',
            defaultValue: true,
        }
    }, {
        freezeTableName: true,
        allowNull: false,
        tableName: 'role_permission'
    });

    rolePermission.associate = function(models) {
        rolePermission.belongsTo(models.roles, { foreignKey: 'roleId', as: 'role' });
        rolePermission.belongsTo(models.permission, { foreignKey: 'permissionId', as: 'permission' });
    }



    return rolePermission;
}