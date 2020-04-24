module.exports = (sequelize, DataTypes) => {
    const Module = sequelize.define('module', {
        // attributes
        moduleName: {
            type: DataTypes.STRING,
            field: 'module_name',
            allowNull: false,
        },
        description:{
            type: DataTypes.TEXT,
            field: 'description'
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            field: 'is_active',
            defaultValue: true,
        }
    }, {
        freezeTableName: true,
        allowNull: false,
        tableName: 'module',
    });


    Module.associate = function(models) {
        Module.hasMany(models.entity,{foreignKey:'moduleId', as:'entity'});
    }

    return Module;
}