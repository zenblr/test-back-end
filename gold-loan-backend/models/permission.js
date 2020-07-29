module.exports = (sequelize, DataTypes) => {
    const Permission = sequelize.define('permission', {
        // attributes
        actionName: {
            type: DataTypes.STRING,
            field: 'action_name',
            allowNull: false,
        },
        description: {
            type: DataTypes.TEXT,
            field: 'description'
        },
        entityId: {
            type: DataTypes.INTEGER,
            field: 'entity_id',
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


    Permission.associate = function (models) {
        Permission.belongsTo(models.entity, { foreignKey: 'entityId', as: 'entity' });
        Permission.belongsToMany(models.role, { through: models.rolePermission });
        Permission.hasMany(models.permissionSystemInfo, { foreignKey: 'permissionId', as: 'systemInfo' });
    }

    return Permission;
}