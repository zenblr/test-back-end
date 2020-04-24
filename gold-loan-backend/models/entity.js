module.exports = (sequelize, DataTypes) => {
    const Entity = sequelize.define('entity', {
        // attributes
        entityName: {
            type: DataTypes.STRING,
            field: 'entity_name',
            allowNull: false,
        },
        description:{
            type: DataTypes.TEXT,
            field: 'description'
        },
        moduleId:{
            type: DataTypes.INTEGER,
            field: 'module_id',
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
        tableName: 'entity',
    });


    Entity.associate = function(models) {
        Entity.belongsTo(models.module, { foreignKey: 'moduleId', as: 'module' });
        Entity.hasMany(models.permission,{foreignKey:'entityId', as:'permission'});
    }

    return Entity;
}