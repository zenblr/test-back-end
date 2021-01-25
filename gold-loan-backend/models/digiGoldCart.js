module.exports = (sequelize, DataTypes) => {
    const DigiGoldCart = sequelize.define('digiGoldCart', {
        customerId: {
            type: DataTypes.INTEGER,
            field: 'customer_id'
        },
        productSku: {
            type: DataTypes.STRING,
            field: 'product_sku'
        },
        productWeight: {
            type:DataTypes.FLOAT,
            field: 'product_weight'
        },
        productName:{
            type: DataTypes.STRING,
            field: 'product_name'
        },
        amount:{
            type: DataTypes.FLOAT,
            field: 'amount'
        },
        productImage:{
            type: DataTypes.TEXT,
            field: 'product_image'
        },
        quantity: {
            type: DataTypes.INTEGER,
            field: 'quantity'
        },
        metalType: {
            type: DataTypes.STRING,
            field: 'metal_type'
        }
    }, {
        freezeTableName: true,
        tableName: 'digi_gold_cart'
    });

    DigiGoldCart.associate = function (models) {
        DigiGoldCart.belongsTo(models.customer, { foreignKey: 'customerId', as: 'customer' });
    }

    DigiGoldCart.getCartDetails = (customerId) => DigiGoldCart.findAll({where:{customerId}})
        
    return DigiGoldCart;
}
