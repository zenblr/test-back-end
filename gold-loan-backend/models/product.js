module.exports = (sequelize, DataTypes) => {
    const Product = sequelize.define('product', {
        // attributes
        name: {
            type: DataTypes.STRING,
            field: 'name',
            allowNull: false,
        },
        moduleId: {
            type: DataTypes.INTEGER,
            field: 'module_id'
        },
        description: {
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
        tableName: 'product',
    });

    Product.getAllProduct = () => Product.findAll({ where: { isActive: true }, order: [['id', 'ASC']], attributes: ['id', 'name', 'moduleId'], });

    Product.associate = function (models) {
        Product.belongsTo(models.module, { foreignKey: 'moduleId', as: 'module' });
        Product.hasMany(models.appraiserRequest, { foreignKey: 'productId', as: 'appraiserRequest' })
    }

    return Product;
}