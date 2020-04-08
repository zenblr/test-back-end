module.exports = (sequelize, DataTypes) => {
    const Roles = sequelize.define('roles', {
        // attributes
        roleName: {
            type: DataTypes.STRING,
            field: 'role_name',
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
        tableName: 'roles',
    });

    //Find Role name
    Roles.findUniqueRole = (roleName) => Roles.findOne({ where: { roleName } });

    //function_to_remove_group
    Roles.removeRole = (id) => Roles.update({ isActive: false }, { where: { id: id, isActive: true } });

    Roles.associate = function(models) {
        // Roles.hasMany(models.user_role, { foreignKey: 'roleId', as: 'role_user' });
        // Roles.hasMany(models.role_permission, { foreignKey: 'roleId', as: 'role_permission' });

        Roles.belongsToMany(models.users,{through: models.user_role});
        Roles.belongsToMany(models.permission,{through: models.role_permission})
    }

    return Roles;
}