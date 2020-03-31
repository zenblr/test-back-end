module.exports = (sequelize, DataTypes) => {
    const Permission = sequelize.define('permission', {
        // attributes
        permissionName: {
            type: DataTypes.STRING,
            field: 'permission_name',
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
        tableName: 'permission',
    });


    Permission.associate = function(models) {
        Permission.hasMany(models.role_permission, { foreignKey: 'permissionId', as: 'permission_role' });
    }


    return Permission;
}