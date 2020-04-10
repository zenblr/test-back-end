module.exports = (sequelize, DataTypes) => {
    const RolePermission = sequelize.define('rolePermission', {
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

    RolePermission.associate = function(models) {
        // rolePermission.belongsTo(models.roles, { foreignKey: 'roleId', as: 'role' });
        // rolePermission.belongsTo(models.permission, { foreignKey: 'permissionId', as: 'permission' });
    }



    return RolePermission;
}