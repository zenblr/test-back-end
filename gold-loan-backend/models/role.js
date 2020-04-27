module.exports = (sequelize, DataTypes) => {
    const Role = sequelize.define('role', {
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
        },
        createdBy: {
            type: DataTypes.INTEGER,
            field: 'created_by',
            allowNull: false
        },
        updatedBy: {
            type: DataTypes.INTEGER,
            field: 'updated_by',
            allowNull: false
        },
    }, {
        freezeTableName: true,
        allowNull: false,
        tableName: 'role',
    });

    //Find Role name
    Role.findUniqueRole = (roleName) => Role.findOne({ where: { roleName } });

    //function_to_remove_group
    Role.removeRole = (id) => Role.update({ isActive: false }, { where: { id: id, isActive: true } });

    Role.addRole = (roleName, description, createdBy, updatedBy ) => Role.create({roleName, description, createdBy, updatedBy});

    Role.updateRole = (roleName, description, updatedBy, id ) => Role.update({roleName, description, updatedBy}, {where: { id }});

    Role.getAllRole = () => Role.findAll({ where: { isActive: true }, order: [['id', 'ASC']] });

    Role.deleteRole = (id) => Role.update({ isActive: false },{ where: { id}});

    Role.associate = function(models) {
        Role.belongsToMany(models.user,{through: models.userRole});
        Role.belongsToMany(models.module,{through: models.roleModule});
        Role.belongsToMany(models.permission,{through: models.rolePermission});
        Role.belongsTo(models.user,{ foreignKey: 'createdBy', as: 'createdByUser' });
        Role.belongsTo(models.user,{ foreignKey: 'updatedBy', as: 'updatedByUser' });
    }

    return Role;
}