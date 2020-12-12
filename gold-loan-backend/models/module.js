module.exports = (sequelize, DataTypes) => {
    const Module = sequelize.define('module', {
        // attributes
        moduleName: {
            type: DataTypes.STRING,
            field: 'module_name',
            allowNull: false,
        },
        description: {
            type: DataTypes.TEXT,
            field: 'description'
        },
        modulePoint: {
            type: DataTypes.INTEGER,
            field: 'module_point'
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

    Module.getAllModule = () => Module.findAll({ where: { isActive: true }, order: [['id', 'ASC']], attributes: ['id', 'moduleName', 'modulePoint'], });

    Module.associate = function (models) {
        Module.hasMany(models.entity, { foreignKey: 'moduleId', as: 'entity' });
        Module.belongsToMany(models.role, { through: models.roleModule });
        Module.hasMany(models.product, { foreignKey: 'moduleId', as: 'module' });
        Module.hasMany(models.productRequest, { foreignKey: 'moduleId', as: 'moduproductRequestle' });

        Module.hasMany(models.appraiserRequest, { foreignKey: 'moduleId', as: 'appraiserRequest' });

    }

    return Module;
}