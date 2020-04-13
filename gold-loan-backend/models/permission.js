module.exports = (sequelize, DataTypes) => {
    const Permission = sequelize.define('permission', {
        // attributes
        permissionName: {
            type: DataTypes.STRING,
            field: 'permission_name',
            allowNull: false,
        },
        description:{
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
        tableName: 'permission',
    });


    Permission.associate = function(models) {
        // Permission.hasMany(models.roleRermission, { foreignKey: 'permissionId', as: 'permission_role' });

        Permission.belongsToMany(models.roles,{through: models.rolePermission})
    }


    return Permission;
}