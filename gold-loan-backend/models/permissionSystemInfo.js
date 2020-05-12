module.exports = (sequelize, DataTypes) => {
    const PermissionSystemInfo = sequelize.define('permissionSystemInfo', {
        // attributes
        systemInfo: {
            type: DataTypes.JSON,
            field: 'system_info'
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
        tableName: 'permission_system_info'
    });

    PermissionSystemInfo.associate = function(models) {
        PermissionSystemInfo.belongsTo(models.permission, { foreignKey: 'permissionId', as: 'permission' });
    }
    
    return PermissionSystemInfo;
}