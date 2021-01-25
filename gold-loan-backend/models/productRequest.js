module.exports = (sequelize, DataTypes) => {
    const productRequest = sequelize.define('productRequest', {
        // attributes
        customerId: {
            type: DataTypes.INTEGER,
            field: 'customer_id',
            allowNull: false,
        },
        moduleId: {
            type: DataTypes.INTEGER,
            field: 'module_id'
        },
        requestFor: {
            type: DataTypes.STRING,
            field: 'request_for'
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            field: 'is_active',
            defaultValue: true,
        }
    }, {
        freezeTableName: true,
        allowNull: false,
        tableName: 'product_request',
    });


    productRequest.associate = function (models) {
        productRequest.belongsTo(models.module, { foreignKey: 'moduleId', as: 'module' });
        productRequest.belongsTo(models.customer, { foreignKey: 'customerId', as: 'customer' });
    }

    return productRequest;
}